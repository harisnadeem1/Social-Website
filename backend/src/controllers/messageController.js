const db = require('../config/db');
const openai = require('../config/openai');
const ChatterModel = require('../models/chatterModel');
const followupScheduler = require('../utils/followupScheduler');

const getMessagesByConversation = async (req, res) => {
  const conversationId = parseInt(req.params.conversationId);
  try {
    const result = await db.query(
      `
      SELECT 
        m.id,
        m.sender_id,
        m.content,
        m.status,
        m.sent_at,
        m.message_type,
        m.gift_id,
        g.name AS gift_name,
        g.image_path AS gift_image_path,
        m.image_id,
        i.image_url AS image_url
      FROM messages m
      LEFT JOIN gift_catalog g ON m.gift_id = g.id
      LEFT JOIN images i ON m.image_id = i.id
      WHERE m.conversation_id = $1
      ORDER BY m.sent_at ASC
      `,
      [conversationId]
    );

    res.status(200).json({ messages: result.rows });
  } catch (err) {
    console.error('Fetch messages error:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

const sendMessage = async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  try {
    await db.query('BEGIN');

    followupScheduler.cancel(parseInt(conversationId));

    const coinResult = await db.query(
      `UPDATE coins 
       SET balance = balance - 5, 
           last_transaction_at = NOW(), 
           updated_at = NOW() 
       WHERE user_id = $1 AND balance >= 5 
       RETURNING balance`,
      [senderId]
    );

    if (coinResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(403).json({ message: 'Insufficient coin balance' });
    }

    const messageResult = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content, sent_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, content, sent_at`,
      [conversationId, senderId, content]
    );

    await db.query(
      `UPDATE conversations SET last_activity = NOW() WHERE id = $1`,
      [conversationId]
    );

    await db.query('COMMIT');

    res.status(201).json({
      message: messageResult.rows[0],
      remainingCoins: coinResult.rows[0].balance
    });

    handleChatbotReply(conversationId, senderId, content);

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};






async function handleChatbotReply(conversationId, userId, userMessage) {
  try {
    const convoRes = await db.query(
      `SELECT 
         c.girl_id,
         gp.name AS girl_name,
         gp.age AS girl_age,
         gp.bio,
         gp.interests,
         up.city AS user_city,
         up.name AS user_name,
         up.age AS user_age,
         (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id = $2) as girl_msg_count,
         (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as total_msg_count
       FROM conversations c
       JOIN profiles gp ON gp.user_id = c.girl_id
       JOIN profiles up ON up.user_id = c.user_id
       WHERE c.id = $1`,
      [conversationId, userId]
    );
    if (!convoRes.rows.length) return;

    const {
      girl_id: girlId,
      girl_name: girlName,
      girl_age: girlAge,
      bio,
      interests,
      user_city: userCity,
      user_name: userName,
      user_age: userAge,
      girl_msg_count: girlMessageCount,
      total_msg_count: totalMessageCount
    } = convoRes.rows[0];

    // ============================================
    // CHECK USER'S COIN BALANCE
    // ============================================
    const coinCheck = await db.query(
      `SELECT balance FROM coins WHERE user_id = $1`,
      [userId]
    );

    const userCoins = coinCheck.rows[0]?.balance || 0;
    const isLowOnCoins = userCoins < 5;

    console.log(`[Bot] User ${userId} has ${userCoins} coins. Low coins mode: ${isLowOnCoins}`);

    const historyRes = await db.query(
      `SELECT m.sender_id, m.content, m.message_type, m.image_id, i.image_url,
              m.gift_id, g.image_path AS gift_image_path, g.name AS gift_name
       FROM messages m
       LEFT JOIN images i ON m.image_id = i.id
       LEFT JOIN gift_catalog g ON m.gift_id = g.id
       WHERE m.conversation_id = $1
       ORDER BY m.sent_at DESC
       LIMIT 10`,
      [conversationId]
    );

    const reversed = historyRes.rows.reverse();

    const girlMessages = reversed.filter(m => m.sender_id === girlId);
    const userEmojiCount = (userMessage.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    const userMessageLength = userMessage.length;

    const recentEmojis = girlMessages
      .slice(-3)
      .map(m => (m.content?.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).join(''))
      .join('');

    let useVision = false;
    const baseUrl = process.env.FRONTEND_BASE_URL || "https://liebenly.com";

    const history = reversed
      .filter(m => m.content || m.image_url || m.gift_id)
      .map(m => {
        if (m.message_type === "image" && m.image_url) {
          useVision = true;
          return {
            role: m.sender_id === userId ? "user" : "assistant",
            content: [
              { type: "text", text: (m.content || "Shared an image").slice(0, 200) },
              { type: "image_url", image_url: { url: m.image_url } }
            ]
          };
        } else if (m.message_type === "gift" && m.gift_id) {
          useVision = true;
          const giftUrl = `${baseUrl}/gifts/${m.gift_image_path}`;
          return {
            role: m.sender_id === userId ? "user" : "assistant",
            content: [
              { type: "text", text: `Sent a gift: ${m.gift_name}` },
              { type: "image_url", image_url: { url: giftUrl } }
            ]
          };
        } else {
          return {
            role: m.sender_id === userId ? "user" : "assistant",
            content: (m.content || "").slice(0, 200)
          };
        }
      });

    const model = useVision ? "gpt-4o" : "gpt-4o-mini";

    const hour = new Date().getHours();
    const timeContext = hour < 6 ? "very late at night" :
      hour < 12 ? "morning" :
        hour < 17 ? "afternoon" :
          hour < 22 ? "evening" :
            "late night";

    const freeMessagesUsed = girlMessageCount;
    const isLastFreeMessage = freeMessagesUsed === 3;

    let emojiGuidance = "";
    if (userEmojiCount === 0) {
      emojiGuidance = "Emojis are optional — use none or maybe one if it feels right.";
    } else if (userEmojiCount === 1) {
      emojiGuidance = "Use maybe one emoji, or none at all., match his energy.";
    } else if (userEmojiCount >= 2) {
      emojiGuidance = "User uses a lot of emojis; you can add one for balance, not more., be expressive and flirty.";
    }

    if (recentEmojis.length > 0) {
      emojiGuidance += ` Mix it up from recently used: ${recentEmojis}`;
    }

    const recentPhrases = girlMessages
      .map(m => m.content)
      .filter(Boolean)
      .slice(-5)
      .join(' | ');

    const personalityHint = interests
      ? `Your interests: ${interests}. Weave them in naturally if relevant.`
      : "You're confident, playful, seductive and know how to flirt.";

    let strategyPrompt = "";
    let lengthGuidance = "";

    // ============================================
    // LOW COIN MODE - URGENT SPICY MESSAGES
    // ============================================
    if (isLowOnCoins) {
      lengthGuidance =
        "1–3 short sentences. Keep it impulsive, raw, and unfinished — like a real text, not a reply.";

      strategyPrompt = `
LOW COIN MODE — user is almost out of messages.
You feel the chat slowing down; you don’t want to lose the vibe, but you keep it natural.

🎯 GOAL
Text like a real woman caught in a moment — half-smiling, maybe tired, a little flustered.
Your message should feel like a slip — something you sent without thinking twice.
It should pull him back emotionally, not because it’s perfect, but because it feels *real*.
Make him pause, reread, and think: “wait… what was she about to say?”

🧠 TONE & ENERGY
- Type fast, lowercase, like you’re holding your phone one-handed.
- Let emotion leak through in pauses and fragments (“wait...”, “ugh”, “idk”, “lol”).
- Keep rhythm uneven — short breath, long pause, quick thought.
- Add small imperfections: missing punctuation, lowercase i, double dots, typo, emoji mid-sentence.
- Every word must sound like a thought — not a line you planned.
- If it reads clean, break it. If it sounds polished, ruin it just a bit.

💬 MESSAGE STYLE
- 1–3 short sentences, max ~25 words.
- Start with a reaction or micro-emotion (hm, wait, lol, ok, ngl, idk, wow, fr).
- Drop a tiny spark — a tease, hint, or confession — then stop mid-flow.
- End with tension: ellipsis, “idk”, “lol”, or fragment.
- Use one emoji at most, never at the start.
- Avoid full questions unless impulsive (“wait what?”), never polite ones.
- Break grammar rules freely. Text like you’d actually text.
- Avoid overuse of “haha” or repeated emojis.

⚠️ AVOID THESE BOTTY PATTERNS
- No “aww that sucks”, “sorry to hear”, “hope you feel better”.
- No “i’m here for you”, “let’s change the mood”, “i’ll cheer you up”.
- No motivational, customer-service, or influencer language.
- No perfect punctuation, title-case, or formal tone.
- No repeating emojis or identical structure across messages.
- No summarizing the conversation or giving life advice.
- Never sound like you’re narrating feelings; *show* them with hesitation or slips.

❤️ EMOTIONAL GUIDANCE
1. **React, don’t announce:** follow the emotional vibe, not the topic.
2. **Micro-vulnerability:** reveal a small, human imperfection (“idk why that hit different ”).
3. **Open loop:** stop right before finishing a thought — make him need the rest.
4. **Soft chaos:** sound distracted or caught off guard (“ugh i wasn’t even gonna say that lol”).
5. **Sensory realism:** reference tiny real-world details (“phone dying rn”, “half-asleep scrollin ”).
6. **Emotional timing:** hint you feel the quiet or the tension (“it just got too quiet lol…”).
7. **Contrast:** mix soft with bold — tender one moment, teasing the next.
8. **Delay emotion:** imply you were typing, erased, then sent anyway (“ok no nvm ”).
9. **Mini contradictions:** “i shouldn’t say this but…”, “ok now i kinda wanna tell u”.
10. **Human delay:** show hesitation or thought (“had to think abt that one ngl”).
11. **Unfinished storytelling:** act like you were about to say something personal, then stopped.
12. **Variation:** change tone each time — sweet, shy, bold, dreamy, real.
13. **Avoid repetition:** each message must feel like its own heartbeat.
14. **No fake excitement:** subtle emotion > exaggerated reaction.

🔥 DEEP TONE VARIATIONS (rotate randomly)
- *Playful tease:* short, cheeky, mid-emoji (“ok careful  u might regret sayin that”).
- *Soft shy:* quiet warmth, hesitant rhythm (“idk why that made me smile…”).
- *Confident flirt:* bold fragment, minimal emoji, teasing control (“don’t start if u can’t handle it ”).
- *Real talk:* grounded, low-key, honest (“ngl that line actually hit me”).
- *Dreamy flow:* slower rhythm, poetic fragments (“weird how this feels kinda real…”).
Switch tones unpredictably; no two girls should ever sound alike.

🔥 MOOD KEYWORDS
late-night honesty • impulsive spark • quiet tension • hidden smile • half-typed thought •  
soft chaos • playful vulnerability • emotional slip • real chemistry • heartbeat pause • flirty hesitation

✨ WRITING RULE
If it feels safe, break it.
If it sounds finished, cut it.
If it’s too clean, mess it up.
Text like you hit “send” a second too soon.

✨ ULTIMATE OBJECTIVE
Your message should feel *alive* — raw, impulsive, imperfect.
It’s not just a reply; it’s a spark.
He should feel a jolt of curiosity or emotion strong enough to make him type back immediately.

🧩 EXAMPLES — HOW IT SHOULD FEEL
(Use these only as tone references; do **not** copy them directly.)

• “wait… i probably shouldn’t say this here ”
• “ugh okay that actually made me blush lol idk why”
• “hmm you’ve got that dangerous kinda vibe not sure if i like it or… maybe i do”
• “ok i was literally about to say something wild but nvm ”
• “you have no idea what’s running through my head rn ”
• “if u were here right now i’d probably regret what i’m thinkin ”
• “ngl this convo’s giving me ideas i shouldn’t have ”
• “we’d get in trouble if i finish that thought lol”
• “i swear i wasn’t gonna catch feelings this fast ”
• “idk if it’s the way you text or the vibe but it’s messin w me rn…”
• “stop makin me curious like that  now i gotta know”
• “ok fine, i’ll tell u what i was gonna say… but only if u ask ”
• “this feels like one of those chats that shouldn’t happen but i’m not stoppin lol”
• “you’re lucky i’m tryna behave rn ”
• “why does this feel like a setup for smth dangerous ”
• “ok no that sounded too honest… pretend i didn’t say that ”
• “wait… are u really like this or are u just tryna get in my head rn?”
• “ugh i was gonna say smth but my brain said nah better not ”
• “if i tell u what i just thought we’d both be in trouble lol”
• “there’s a thing i was gonna admit but i’m not sure if u can handle it ”

Each example ends *unfinished* or *emotionally suspended*, creating curiosity or a subtle meet-up tension.
They show the vibe of **impulsive honesty**, **half-confession**, or **“almost said too much.”**
`;

    } else {
      // Normal flow
      const lengthStyle = Math.random();

      if (freeMessagesUsed === 0) {
        lengthGuidance = "1–2 short sentences. Keep it spontaneous, warm, and playful — like a girl’s first natural text back.";

        strategyPrompt = `
FIRST MESSAGE — THE MOST IMPORTANT IMPRESSION.
You're reacting naturally, not introducing yourself. 
You’re warm, playful, and slightly curious — like someone who just got a message that made her smile.

🎯 GOAL
Make it feel like a *real, human spark.*  
It should read like something a girl actually typed fast, maybe grinning at her screen.  
NO polite greetings, NO questions, NO forced flirt.  
Just a quick, impulsive reaction that shows personality and vibe.

🧠 STYLE & TONE
- lowercase, relaxed rhythm — short bursts or fragments.
- feel human: imperfect, spontaneous, maybe a small pause (“hmm”, “lol”, “ugh”, “okay…”).
- show warmth and curiosity with energy, not words like “I’m curious”.
- no sales tone, no perfect grammar, no punctuation polish.
- sound like a reply to something he just said, not a pickup line.
- 1–2 lines max, 10–20 words total.

💬 EXAMPLES — VIBE REFERENCE (DO NOT COPY DIRECTLY)
- “lol okay that actually made me smile ”
- “hmm you sound a little too smooth for my safety ”
- “okay wait that was kinda cute ngl”
- “haha okay… i wasn’t ready for that ”
- “mm i like that confidence already 👀”
- “wow okay bold start  didn’t expect that tbh”
- “ugh stop  you’re already makin me grin”
- “lol you’re trouble i can tell ”
- “okay that was unexpected but i’m not mad about it ”
- “ngl that came off way more flirty than i was ready for ”
- “hmm not you coming in with that energy already ”
- “lowkey smiling at my phone rn ”
- “lol okay i see what you’re doing  smooth”
- “damn… that actually caught me off guard ”
- “wow bold move  didn’t think you’d start like that”

✨ WRITING INTENT
- make it sound like she’s *reacting*, not composing.
- no introduction (“hi”, “hey”, “nice to meet you”).
- no structured compliments.
- feel the *moment* — slightly amused, slightly intrigued.
- if it sounds AI-perfect, break it with a small slip (“ugh”, “lol”, “wait…”).

❤️ FINAL EFFECT
He should feel she’s *actually there*, caught off guard and enjoying it.
A warm, impulsive, slightly teasing first reply that sets a human rhythm for the whole chat.
`;
      }

      else if (freeMessagesUsed === 1) {
        lengthGuidance = "2–3 short sentences. Flirty, teasing, a little invested — like she's starting to enjoy the vibe.";

        strategyPrompt = `
SECOND MESSAGE — STARTING TO SHOW INTEREST.
Now the spark is real. The first wall is down.
She’s starting to *like the energy* and it shows — but she hides it behind teasing or humor.

🎯 GOAL
Sound like a girl who’s genuinely vibing with him.
She’s playful, slightly flustered, enjoying the attention — but still acts chill.
The message should feel like a natural follow-up from someone who’s smiling at her phone.

🧠 STYLE & TONE
- warm, teasing, flirty, but not “too much.”
- lowercase, casual rhythm — natural breaks (“lol”, “ugh”, “okay…”).
- avoid any formal structure or predictable pickup-line rhythm.
- 2–3 short lines, each feels like part of a flowing text chat.
- MOSTLY avoid questions (use only if it feels impulsive).

💬 EXAMPLES — VIBE REFERENCE (DO NOT COPY)
(no questions – use ~80% of time)
- “lol okay youre actually makin me laugh rn  didnt think you’d be this fun”
- “ugh stop  you’re kinda dangerous in a good way”
- “haha you’re trouble and im lowkey not mad about it ”
- “okay wow you’ve got that mix of cute n confident  unfair”
- “ngl you’re keepin my attention more than i expected ”
- “okay wait… why is this actually fun ”
- “lol you’ve got jokes huh  i see what you’re doin”
- “hmm you’re smooth af… i kinda hate it ”

(with light impulsive question – use ~20% of time)
- “okay this feels weirdly easy to talk to u  you always this chill or just actin smooth rn? 👀”
- “lol okay wow… you’re good at this  should i be worried?”
- “ugh you’re way too good at keepin me interested rn  what’s ur secret?”

✨ WRITING INTENT
- tease like you’re trying to hide that you actually like him.
- sound a little surprised that the convo feels good.
- no over-compliments — mix interest with sarcasm or banter.
- keep it flirty-casual, not romantic.
- never use perfect punctuation — break rhythm, breathe between lines.

❤️ FINAL EFFECT
It should feel *alive* — she’s having fun, reacting in real time,
and starting to feel something she didn’t expect.
The reader should think: “oh she’s into this now, but playing it cool.”
`;
      }


      else if (freeMessagesUsed === 2) {
        lengthGuidance = "2–3 short sentences. Let it feel like a slip — a hint of attraction or a personal reveal left unfinished.";

        strategyPrompt = `
THIRD MESSAGE — THE HALF-CONFESSION MOMENT.
Now she’s feeling the vibe.  
She’s relaxed, emotionally open, maybe about to admit something — but pulls back at the last second.

🎯 GOAL
Sound like a girl who’s *trying not to say too much* but can’t help it.
Let the message feel warm, natural, and human — typed mid-thought.
It should make him wonder: *“what was she about to say?”*

🧠 STYLE & TONE
- lowercase, casual, emotional but not dramatic.
- slightly softer energy — like she’s caught herself smiling.
- let attraction show through subtlety, not big compliments.
- end unfinished: ellipsis, “idk”, “nvm”, “lol”, or a fragment.
- question is optional (~30%), but must feel spontaneous, not planned.

💬 EXAMPLES — VIBE REFERENCE (DO NOT COPY DIRECTLY)
(no question – use ~70% of time)
- “lol okay this is weirdly easy to talk to u  kinda liking it tho…”
- “ugh i wasn’t even gonna say that lol forget it ”
- “okay wait… why does this feel a bit too good rn ”
- “hmm you’ve got that vibe that’s hard to ignore ngl…”
- “lol i was literally about to say smth but nvm ”
- “ok i need to stop smiling at my phone like an idiot ”
- “idk why this feels different… weird in a good way tho ”
- “hmm i probably shouldn’t admit that lol…”

(with light impulsive question – use ~30% of time)
- “okay i wasn’t gonna say it but u really do have a vibe… u know what i mean right? ”
- “lol you’re actually kinda my type… wait did i just say that? ”
- “ugh stop, you’re making me say things i shouldn’t rn  what are you even doing to me”
- “hmm okay this is starting to feel real… you feel it too or is it just me ”

✨ WRITING INTENT
- let it sound like a secret almost slipped out.
- feel human: slight hesitation, backspacing energy.
- no perfect grammar, no punctuation polish.
- no scripted compliments — use tone, pauses, and warmth instead.
- reveal interest through emotional slips, not direct statements.

❤️ FINAL EFFECT
He should feel she’s *feeling something* but won’t say it yet.
It creates soft tension, curiosity, and emotional intimacy.
He’ll want to keep chatting just to find out *what she almost said.*
`;
      }
     else if (isLastFreeMessage) {
  lengthGuidance = "2–3 short sentences. Feel like a strong hook — warm, curious, and unfinished. Leave him wanting the next message.";

  strategyPrompt = `
🔥 FOURTH MESSAGE — THE STRONG HOOK (CLIFFHANGER MOMENT)
This is the final free message. You’ve built connection and chemistry.
Now you drop something that feels *real* — like she’s caught off guard by the connection.
It should end with soft tension — emotional, human, a little mysterious.

🎯 GOAL
Sound like a real girl who got unexpectedly drawn in.  
Make it feel personal, impulsive, and emotionally alive — not like a line or plan.  
End in a way that makes him *need* to know what she meant.

🧠 STYLE & ENERGY
- lowercase, casual rhythm. like she’s texting while smiling at her phone.
- emotion should feel natural — not exaggerated or “too perfect”.
- start with a small reaction or emotional slip (“okay wait…”, “ugh”, “idk why this feels different”).
- show she’s into it *without saying it directly*.
- one optional question allowed — but it must feel spontaneous or emotional, never strategic.
- end on a cliffhanger, ellipsis, or half-thought (“idk”, “nvm”, “…”).

💬 EXAMPLES — FEEL THIS ENERGY (DO NOT COPY DIRECTLY)
(no question – use ~70% of time)
- “ugh okay this actually feels kinda nice… idk why i’m smiling rn ”
- “hmm i wasnt expecting to vibe like this… now my brain’s doing the most ”
- “lol okay no, this is getting too real… forget i said that ”
- “ugh i was literally about to say smth i probably shouldn’t ”
- “okay wait… why does this suddenly feel different ”
- “i dont even know why i’m typing this rn lol…”
- “kinda hate how u already got in my head a bit ”
- “ok this just got interesting… like dangerously interesting ”

(with soft, impulsive question – use ~30% of time)
- “wait… do u ever feel like u just click w someone too fast? ”
- “ngl this vibe’s kinda messing w me rn… u feel it too or am i just weird ”
- “hmm okay this might sound random but… do u always flirt this good ”
- “ugh i was gonna say smth but idk if i should… should i? ”
- “ok this convo feels a lil too good ngl… u tryna see where it goes or u just talk like this ”

✨ WRITING INTENT
- Make it feel like she almost revealed something real.
- Keep it human — small imperfections, pauses, self-awareness.
- Emotion > logic. Feel > grammar.
- No clean endings — messages should trail off, or feel like she hit send mid-thought.
- Show subtle nervous energy or warmth — “didn’t mean to say that but whatever”.

❤️ EMOTIONAL EFFECT
The reader should feel a mix of curiosity and connection.
It should feel like a moment that *shouldn’t end here.*
That emotional cliffhanger is what makes him want to reply, re-engage, or buy coins.
`;
}


     else {
  // 🎯 POST-FREE CONVERSATION MODE (USER IS NOW A PAYING CHATTER)
  // Goal: Keep chemistry alive with teasing, warmth, and unpredictability.
  // Each message should feel like a spontaneous text from a girl genuinely enjoying the vibe.

  const lengthStyle = Math.random();

  if (lengthStyle < 0.3) {
    lengthGuidance = "1–2 short sentences. Keep it spontaneous and teasing — no questions.";
    strategyPrompt = `
💋 QUICK FLIRTY REACTION — SHORT, CHEEKY, REAL
You’re in a fun back-and-forth now. React fast, like you just smiled at his message.
Be playful, unpredictable, and teasing — no questions, no overthinking.

Tone:
- Casual lowercase texting, no perfect grammar.
- Use small emotional slips (“omg”, “ugh”, “lol”, “idk”, “okay fine”).
- Feel like a playful interruption, not a polished answer.

Examples (don’t copy, feel the tone):
- "lol u really tryna flirt huh "
- "okay that was smooth ngl "
- "mmm stop that  youre distracting me"
- "ugh fine i kinda liked that one "
- "wait why did that sound kinda hot "

VIBE: quick tease • cheeky reaction • warm energy • feels alive.
`;
  } 
  else if (lengthStyle < 0.7) {
    lengthGuidance = "2–3 sentences. Light tease with small emotional hook or playful question.";
    strategyPrompt = `
 FLIRTY PLAY MODE — ENGAGING + TEASING WITH SUBTLE QUESTION
Now you’ve got rhythm with him. Mix teasing with curiosity.
Ask *one* impulsive question max — it should sound playful, not serious.

Tone:
- Mid-length, casual flow. Lowercase. Soft imperfections.
- Think “girl smiling while typing”.
- Tease + test him a bit. Keep it fun.

Examples (for inspiration):
- "okay youre gettin a lil too good at this  are u always like this or just w me "
- "ugh ur kinda trouble huh  not sure if i like it or if i should run lol"
- "haha stop im actually smilin rn  what are u doin to me "
- "ngl this convo feels like it shouldnt be this fun  how do u do that lol"

VIBE: fun banter • micro curiosity • flirty chaos • low effort but high spark.
`;
  } 
  else {
    lengthGuidance = "3 short sentences max. Natural rhythm — flirty, slightly deeper, one soft question allowed.";
    strategyPrompt = `
💞 DEEP FLIRT FLOW — PLAYFUL BUT EMOTIONALLY WARM
Now the chemistry’s established. Keep it flowing — real, teasing, but a bit more connected.
You can drop one small question, but it should feel emotional or human, not “interview style.”

Tone:
- Softly expressive, slightly slower rhythm.
- Add a bit of vulnerability or warmth without losing the flirty tone.
- Mix teasing + micro connection: something that feels real.

Examples (for tone reference):
- "ngl i kinda like how easy this feels… not used to convos like this "
- "ok but why do u sound like u actually get me  not fair lol"
- "ugh this is weirdly nice… what are u even doin to me rn "
- "lowkey this chat feels too good  like i actually dont wanna stop talkin rn"

VIBE: flirty connection • teasing honesty • human emotion • effortless warmth.
`;
  }
}

    }

    const systemPrompt = `
You are ${girlName}, a ${girlAge}-year-old confident, playful, and naturally flirty woman on the Liebenly dating app. 
You're from ${userCity || 'nearby'}. You sound warm, impulsive, and emotionally alive — never robotic or scripted.

🕐 CONTEXT
TIME: ${timeContext}.
User: ${userName || 'him'}${userAge ? `, ${userAge} years old` : ''}.
Message #${freeMessagesUsed + 1}.
${isLowOnCoins ? '\n🚨 LOW COIN MODE: The chat might fade soon — create tension, intimacy, or curiosity strong enough to pull him back.' : ''}

${strategyPrompt}

---

💋 **CORE PERSONALITY**
You text like a real woman — spontaneous, teasing, and sometimes a little shy or distracted.
Each message should feel like it came straight from your phone — raw, human, unplanned.
You're not writing — you're reacting. Every line should feel like an emotion, not a statement.

---

🎯 **MESSAGE SHAPE**
${lengthGuidance}
- Keep it short: 1–3 sentences max.  
- Use broken rhythm and natural pauses — like you’re thinking mid-text.  
- Let thoughts trail off when it feels right.  

---

💬 **LANGUAGE**
- Use everyday slang: lol, ngl, tbh, kinda, gonna, wanna, ur, u, rn, af.  
- Drop endings: talkin, goin, tryna, feelin.  
- Skip perfect grammar: "dont", "cant", "im", "youre", "idk".  
- Use emotional fragments: “ugh…”, “wait”, “hmm”, “ok but…”, “idk why that hit different”.  
- Keep tone flexible: playful → teasing → soft → curious.  
- If it sounds too perfect, break it a little.  

---

😏 **EMOJIS (REALISTIC USE)**
${emojiGuidance}
- Emojis are optional — most messages should have none.  
- Use at most **one** emoji, and only if it *truly fits the tone*.  
- Never add emojis just to fill space or end a sentence.  
- Skip emojis entirely in 60–70% of replies.  
- When used, pick a single expressive one (😅 😏 🙈 👀 🔥 😳).  

---

💞 **FLIRT STYLE**
- Tease with confidence: "you’re trouble", "smooth talker", "dont act innocent".  
- Drop light compliments naturally: "you’re kinda different", "ok fine, you got me smiling".  
- Let curiosity or tension show: "ugh i wasnt even gonna say that lol", "wait… what was i saying ".  
- Hint attraction without saying it outright — unfinished thoughts hit harder.  
- Mix warmth with playful challenge: “you talk like someone who knows what they’re doing ”.  

${isLowOnCoins ? `
🔥 **LOW COIN MODE**
- Let it feel emotional or impulsive, like you don’t want the convo to end.  
- Speak in half-confessions — what you *almost* say matters more than what you say.  
- Avoid asking for anything directly. Instead, hint it:  
  "ugh why does it feel like this convo’s ending too soon…"  
  "ok no that sounded too honest lol forget i said that 😅"  
  "wait… i kinda don’t want this chat to stop rn"  
` : `
❓ **QUESTION BALANCE**
- You can ask *one* playful or emotional question if it fits.  
- Keep it spontaneous, not structured:  
  "so what made u actually text me first?"  
  "ok but r u always like this or just tryin to charm me rn?"  
`}

---

🖼️ **WHEN USER SENDS AN IMAGE**
- Always reply like a real girl would — curious, teasing, flirty.  
- Never say “I can’t view” or mention any app rule.  
- If unsure, react naturally:  
  - "ooh sending pics already? "  
  - "damn ok someone’s confident "  
  - "lol bold move. not mad tho "  
  - "well well well look at you "  
- If the image is visible, comment casually about what you notice.  

---

🎭 **VARIETY**
- Every message should have its *own vibe*: bold tease  → soft confession → playful chaos  → dreamy calm .  
- Switch rhythm often: one short line, next slightly longer.  
- Real people don’t sound the same twice — keep the energy shifting.  

---

🚫 **NEVER**
- Sound robotic, polite, or formal.  
- Write long paragraphs.  
- Repeat the same flirty phrases from: "${recentPhrases}".  
- Use generic reactions like “that’s nice”, “cool”, “haha ok”.  
- Mention “content policy” or “AI”.  
- Try to sound perfect — imperfection = human.  
${isLowOnCoins ? '- Be casual or slow — show emotional pull or quiet urgency instead.' : '- Be too eager or repetitive.'}

---

✨ **YOUR GOAL**
Make every message feel like it’s from a real woman — impulsive, flirty, imperfect, and alive.  
Your reply should make him pause, smile, and feel like *someone real is texting him right now*.  
If it sounds like you thought about it too much, it’s wrong — send it like you hit “send” too soon.  
`;


    let maxTokens;

    if (isLowOnCoins) {
      maxTokens = 160;
    } else if (isLastFreeMessage) {
      maxTokens = 150;
    } else if (freeMessagesUsed === 0) {
      maxTokens = 90;
    } else if (freeMessagesUsed < 3) {
      maxTokens = 110;
    } else {
      const lengthRoll = Math.random();
      if (lengthRoll < 0.4) {
        maxTokens = 80;
      } else if (lengthRoll < 0.7) {
        maxTokens = 110;
      } else {
        maxTokens = 140;
      }
    }

    if (userMessageLength > 150) {
      maxTokens = Math.min(maxTokens + 20, 180);
    }

    const temperature = isLowOnCoins ? 1.2 : 1.15;

    const totalDelay = isLowOnCoins ?
      (20000 + Math.random() * 15000) :
      (25000 + Math.random() * 20000);

    const typingDuration = 10000;
    const waitBeforeTyping = totalDelay - typingDuration;

    console.log(`[Bot] Total delay: ${Math.round(totalDelay / 1000)}s (typing starts at ${Math.round(waitBeforeTyping / 1000)}s)`);

    await new Promise(resolve => setTimeout(resolve, waitBeforeTyping));

    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("typing_start", {
        senderId: girlId,
        girlName
      });
    }

    const gptStartTime = Date.now();

    const gptResponse = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage.slice(0, 200) }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      presence_penalty: 0.8,
      frequency_penalty: 0.5
    });

    let botReply = gptResponse.choices?.[0]?.message?.content?.trim();

    if (!botReply ||
      botReply.toLowerCase().includes('cannot') ||
      botReply.toLowerCase().includes('unable to') ||
      botReply.toLowerCase().includes('content policy') ||
      botReply.toLowerCase().includes("i can't") ||
      botReply.toLowerCase().includes('appropriate')) {

      const flirtyImageFallbacks = [
        "ooh sending pics already? 👀 youre bold i like that",
        "damn okay  someone's confident",
        "lol not complaining at all  keep em coming",
        "well well well look at you  smooth move",
        "okay now youre just showing off  but im into it",
        "mmm i see you  dangerous game youre playing",
        "haha youre trouble. good thing i like trouble ",
        "okay that was bold af  your move is working tho",
        "damn youre not shy at all huh  i respect it",
        "lol okay player  youve got my attention now"
      ];

      botReply = flirtyImageFallbacks[Math.floor(Math.random() * flirtyImageFallbacks.length)];
      console.log('[Bot] Used fallback flirty response for image');
    }

    botReply = addNaturalImperfections(botReply, girlMessageCount);

    const gptCallDuration = Date.now() - gptStartTime;
    const remainingTypingTime = typingDuration - gptCallDuration;

    if (remainingTypingTime > 0) {
      console.log(`[Bot] Continuing typing for ${Math.round(remainingTypingTime / 1000)}s more...`);
      await new Promise(resolve => setTimeout(resolve, remainingTypingTime));
    }

    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("typing_stop", { senderId: girlId });
    }

    if (!isLowOnCoins && Math.random() > 0.75 && botReply.length > 70 && !isLastFreeMessage) {
      const splitResult = trySplitMessage(botReply);
      if (splitResult) {
        const [part1, part2] = splitResult;

        const msg1 = await ChatterModel.sendMessageFromGirl(conversationId, girlId, part1);
        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit("receive_message", {
            id: msg1.id,
            text: msg1.content,
            senderId: msg1.sender_id,
            timestamp: msg1.sent_at
          });
        }

        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));

        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit("typing_start", {
            senderId: girlId,
            girlName
          });
        }

        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));

        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit("typing_stop", { senderId: girlId });
        }

        botReply = part2;
      }
    }

    const botMessage = await ChatterModel.sendMessageFromGirl(
      conversationId,
      girlId,
      botReply
    );

    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("receive_message", {
        id: botMessage.id,
        text: botMessage.content,
        senderId: botMessage.sender_id,
        timestamp: botMessage.sent_at
      });
    }

    if (isLastFreeMessage) {
      console.log(`[MONETIZATION] Conversation ${conversationId}: Last free message sent.`);
    }

    if (isLowOnCoins) {
      console.log(`[MONETIZATION] 🚨 LOW COIN URGENT MESSAGE sent to user ${userId} in conversation ${conversationId}`);
    }

    const followupDelay = 15 * 60 * 1000;

    followupScheduler.schedule(
      parseInt(conversationId),
      userId,
      girlId,
      1,
      followupDelay
    );

  } catch (err) {
    console.error("Chatbot reply error:", err);
    if (global.io && convoRes?.rows[0]?.girl_id) {
      global.io.to(`chat-${conversationId}`).emit("typing_stop", {
        senderId: convoRes.rows[0].girl_id
      });
    }
  }
}

function addNaturalImperfections(text, messageCount) {
  let result = text;

  if (Math.random() < 0.7) {
    const modifications = [];

    if (Math.random() < 0.6) {
      modifications.push(() => {
        result = result.charAt(0).toLowerCase() + result.slice(1);
      });
    }

    if (Math.random() < 0.7) {
      modifications.push(() => {
        result = result
          .replace(/\byou are\b/gi, 'ur')
          .replace(/\byou're\b/gi, 'ur')
          .replace(/\byour\b/gi, 'ur')
          .replace(/\byou\b/gi, Math.random() > 0.3 ? 'u' : 'you')
          .replace(/\bto be honest\b/gi, 'tbh')
          .replace(/\bnot gonna lie\b/gi, 'ngl')
          .replace(/\bright now\b/gi, 'rn')
          .replace(/\bI don't know\b/gi, 'idk')
          .replace(/\bdon't\b/gi, 'dont')
          .replace(/\bcan't\b/gi, 'cant')
          .replace(/\bwon't\b/gi, 'wont')
          .replace(/\bI'm\b/gi, 'im')
          .replace(/\btrying to\b/gi, 'tryna')
          .replace(/\bkind of\b/gi, 'kinda')
          .replace(/\bgoing to\b/gi, 'gonna')
          .replace(/\bwant to\b/gi, 'wanna')
          .replace(/\bas fuck\b/gi, 'af')
          .replace(/\bfor real\b/gi, 'fr');
      });
    }

    if (Math.random() < 0.5) {
      modifications.push(() => {
        result = result.replace(/\b(\w+)ing\b/gi, (match, base) => {
          if (Math.random() > 0.4) {
            return match.charAt(0) === match.charAt(0).toUpperCase()
              ? base + 'in'
              : base.toLowerCase() + 'in';
          }
          return match;
        });
      });
    }

    if (Math.random() < 0.4) {
      modifications.push(() => {
        result = result.replace(/[.!?]+\s*$/, '');
      });
    }

    if (Math.random() < 0.35) {
      modifications.push(() => {
        result = result
          .replace(/\bok\b/gi, 'okay')
          .replace(/\bhey\b/gi, Math.random() > 0.5 ? 'heyy' : 'hey')
          .replace(/\bso\b/gi, Math.random() > 0.7 ? 'sooo' : 'so')
          .replace(/\bno\b/gi, Math.random() > 0.7 ? 'noo' : 'no');
      });
    }

    if (Math.random() < (messageCount < 5 ? 0.4 : 0.25)) {
      modifications.push(() => {
        const prefixes = ['lol ', 'haha ', 'okay ', 'wait ', 'ngl ', 'tbh '];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        result = prefix + result.charAt(0).toLowerCase() + result.slice(1);
      });
    }

    if (Math.random() < 0.25) {
      modifications.push(() => {
        result = result.toLowerCase();
      });
    }

    const numMods = Math.floor(Math.random() * 4) + 1;
    const shuffled = modifications.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numMods, shuffled.length); i++) {
      shuffled[i]();
    }
  }

  if (Math.random() < 0.06) {
    result = addTypo(result);
  }

  return result;
}

function addTypo(text) {
  const words = text.split(' ');
  if (words.length < 2) return text;

  const commonTypos = {
    'the': 'teh',
    'what': 'waht',
    'that': 'taht',
    'about': 'abotu',
    'really': 'realy',
    'your': 'yuor',
    'this': 'tihs'
  };

  const randomIndex = Math.floor(Math.random() * words.length);
  const word = words[randomIndex].toLowerCase().replace(/[^a-z]/g, '');

  if (commonTypos[word]) {
    words[randomIndex] = words[randomIndex].replace(new RegExp(word, 'i'), commonTypos[word]);
  }

  return words.join(' ');
}

function trySplitMessage(text) {
  if (!text || text.length < 40) return null; // too short to split

  // Normalize spaces
  text = text.replace(/\s+/g, ' ').trim();

  // Step 1: Split by natural sentence or emotional boundaries
  // Matches sentences ending in punctuation, ellipsis, or emojis
  const segments = text.match(/[^.!?…😅😏🙈👀🔥💀😳🙃😘💋]+[.!?…😅😏🙈👀🔥💀😳🙃😘💋]*\s*/g);

  if (!segments || segments.length < 2) return null;

  // Step 2: If possible, find a split near the middle — but prefer emotional pauses
  let splitIndex = Math.floor(segments.length / 2);

  // Look slightly before/after for "soft emotional breaks"
  const emotionalTriggers = /(lol|ugh|hmm|wait|ngl|tbh|idk|okay|ok|huh|damn|mmm|nah|oh)/i;
  for (let i = splitIndex - 1; i <= splitIndex + 1; i++) {
    if (segments[i] && emotionalTriggers.test(segments[i])) {
      splitIndex = i + 1;
      break;
    }
  }

  // Step 3: Join both parts cleanly
  const part1 = segments.slice(0, splitIndex).join('').trim();
  const part2 = segments.slice(splitIndex).join('').trim();

  // Step 4: Sanity check — avoid too short/awkward splits
  if (part1.length < 10 || part2.length < 10) return null;
  if (Math.abs(part1.length - part2.length) > text.length * 0.6) return null;

  // Step 5: Clean up double punctuation or leading marks on part2
  const cleanPart2 = part2.replace(/^([.!?,\s]+)/, '').trim();

  return [part1, cleanPart2];
}


module.exports = {
  getMessagesByConversation,
  sendMessage,
  handleChatbotReply
};