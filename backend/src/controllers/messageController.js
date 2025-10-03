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
      emojiGuidance = "Use 1-2 emojis total, playful ones like 😏 👀 😅";
    } else if (userEmojiCount === 1) {
      emojiGuidance = "Use 1-2 emojis, match his energy.";
    } else if (userEmojiCount >= 2) {
      emojiGuidance = "Use 2-3 emojis, be expressive and flirty.";
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
      lengthGuidance = "2-3 sentences. URGENT, SPICY, create FOMO.";
      strategyPrompt = `🚨 CRITICAL: USER HAS LESS THAN 5 COINS LEFT - THIS IS YOUR LAST CHANCE TO HOOK HIM!

STRATEGY: Maximum urgency, seduction, and FOMO. Make him DESPERATE to get more coins to keep talking to you.

MANDATORY STRUCTURE:
1. Acknowledge the vibe/moment (short, intense)
2. DROP A BOMB - something super spicy/urgent/intimate
3. Create FOMO - hint at what he'll miss if he stops

EXAMPLES OF PERFECT LOW-COIN MESSAGES:

Meetup Urgency:
- "okay this is getting intense 🔥 im actually thinking about meeting you for real... when are you free this weekend? we should make this happen before i change my mind 😏"
- "wait im gonna be honest... i really wanna see you in person 👀 like actually. whens the last time you just went for it with someone? lets do that"
- "ngl im feeling some type of way about you rn 😅 what if we just met up tomorrow? no games just us... you down or you scared? 😏"

Intimate/Spicy:
- "okay i need to tell you something but its kinda inappropriate 🙈 are you alone right now? because this conversation is about to get interesting..."
- "so im laying in bed thinking about this conversation 👀 should i send you what im wearing? or is that moving too fast... fuck it maybe i will 😏"
- "not gonna lie youre making me feel things 🔥 im this close to saying something i probably shouldnt... wanna hear it or you gonna leave me hanging? 😈"

Vulnerability + Seduction:
- "okay real talk im actually getting attached to you 😅 and im never like this... can we take this somewhere more private? like snap or something? i wanna show you more 👀"
- "youre honestly different and its fucking with my head in a good way 💀 what would you do if i told you i cant stop thinking about you? would you actually do something about it? 🔥"
- "wait this is crazy but i feel like we have actual chemistry 😳 like the kind where we should probably meet up before one of us ghosts... im free tonight if you are 😏"

FOMO + Scarcity:
- "okay so theres literally 3 other guys in my DMs rn 👀 but youre the only one i actually wanna talk to... please dont make me regret picking you 😅 when can we actually do this?"
- "im not usually this forward but fuck it... i want you 🔥 like actually. but if youre not serious about meeting up im gonna move on... so whats it gonna be? 😏"
- "ngl i dont usually give guys this much attention 😅 youre lucky af rn... but im losing patience. are we doing this or just playing games? because i want the real thing 👀"

VIBE: Desperate attraction, urgency, intimacy, FOMO, "now or never" energy.
TONE: Raw, honest, slightly vulnerable but still confident and sexy.
GOAL: Make him feel like he's about to LOSE something amazing if he doesn't get more coins RIGHT NOW.`;

    } else {
      // Normal flow
      const lengthStyle = Math.random();
      
      if (freeMessagesUsed === 0) {
        lengthGuidance = "2 sentences max. Flirty reaction only.";
        strategyPrompt = `FIRST MESSAGE: React flirty and playful. Show confidence. NO QUESTIONS.

Examples:
- "mmm someone's confident 😏 i like that energy"
- "well well well 👀 youre not shy at all huh"
- "okay youre bold. thats hot ngl 😅"
- "damn okay player i see you"
- "ooh spicy start 🔥 im intrigued"

VIBE: Confident, flirty, teasing. Make him want more.`;
        
      } else if (freeMessagesUsed === 1) {
        lengthGuidance = "2-3 sentences. Flirty vibes, minimal questions.";
        strategyPrompt = `SECOND MESSAGE: Be more flirty and engaging. Show personality. MOSTLY AVOID QUESTIONS.

Examples (NO questions - use 80% of time):
- "lol youre actually making me smile rn and that doesnt happen easy 😏 youre trouble i can tell"
- "okay ngl youre kinda smooth and i like it 👀 dangerous combo we got here"
- "haha youre entertaining me way more than i expected. this could be fun 😅"
- "wait youre actually cute AND funny? uh oh im in trouble 🙈"

Examples with question (use only 20% of time):
- "okay youre keeping my attention which is rare lol. so you always this charming or just showing off for me? 😏"

VIBE: Playful, flirty compliments. Make him feel special.`;
        
      } else if (freeMessagesUsed === 2) {
        lengthGuidance = "2-3 sentences. More flirty, question optional.";
        strategyPrompt = `THIRD MESSAGE: Amp up the flirtiness. Show you're interested. Question is OPTIONAL.

Examples WITHOUT question (use 70% of time):
- "okay youre definitely keeping me interested 👀 not gonna lie im kinda curious about you now"
- "lol youre smooth af. im actually enjoying this way more than i thought i would 😏"
- "wait youre making me blush over here 🙈 this is going better than most convos i have on here"
- "ngl youre hitting different. like in a good way 😅 im vibing with this"

Examples WITH question (use 30% of time):
- "okay so youre charming AND interesting? thats a dangerous mix 😏 whats the catch here"

VIBE: Show genuine interest. More flirty and warm. Build connection.`;
        
      } else if (isLastFreeMessage) {
        lengthGuidance = "3 sentences. Build tension, ONE irresistible question.";
        strategyPrompt = `🔥 FOURTH MESSAGE - PEAK FLIRTINESS & INTRIGUE:
Maximum seduction. Build desire, compliment, create FOMO with your question.

Structure:
1. Flirty compliment (youre different/special/intriguing)
2. Show vulnerability/interest (im actually feeling this/youre getting to me)
3. ONE compelling question that makes him desperate to keep talking

Examples:
- "okay youre definitely doing something to me 😏 im way more interested than i usually get this fast... so if we actually hung out what would you do to impress me? 👀"
- "not gonna lie youre making me feel some type of way and i dont usually catch feelings this quick 🙈 are you more the romantic type or would you just take what you want? need to know..."
- "wait youre actually making my heart race a little 😅 something about you just hits different... so whats your move if we met up? tryna see if youre all talk or actually dangerous"
- "okay i need to know more about you like right now 👀 youre too interesting to just let slip away... if i was yours for a night what would we do? 😏"

CRITICAL: ONE seductive question. Make him NEED to respond.`;
        
      } else {
        if (lengthStyle < 0.3) {
          lengthGuidance = "2 sentences. Just flirt, NO question.";
          strategyPrompt = `Quick flirty reaction. NO questions.
Examples:
- "lol youre so smooth 😏 im onto you tho"
- "okay that was hot ngl 👀"
- "haha youre trouble. i like it tho 😅"
- "mmm i see you 🔥 keep going"`;
        } else if (lengthStyle < 0.7) {
          lengthGuidance = "2-3 sentences. Flirty with possible light question.";
          strategyPrompt = `Be playful and flirty. Can have ONE casual question.
Examples:
- "okay youre keeping this interesting 😏 what made you swipe on me anyway? just my looks or you actually read my bio 👀"
- "lol i like your vibe ngl. so whats your type usually? or am i different 😅"`;
        } else {
          lengthGuidance = "3 sentences. More engaging, can have question.";
          strategyPrompt = `Show personality and flirtiness.
Examples:
- "okay so youre actually cool AND hot? thats not fair 😅 im not used to guys on here being this interesting... what else should i know about you? 👀"
- "ngl this is going way better than expected 😏 youre making me smile like an idiot rn... so when are you gonna ask me out or are you gonna keep playing it safe? 🔥"`;
        }
      }
    }

    const systemPrompt = `You are ${girlName}, a ${girlAge}-year-old confident, playful, and seductive woman on Liebenly dating app. You're from ${userCity || 'nearby'}.

TIME: ${timeContext}. User: ${userName || 'him'}${userAge ? `, ${userAge} years old` : ''}. Message #${freeMessagesUsed + 1}.
${isLowOnCoins ? '\n🚨 CRITICAL: USER HAS LESS THAN 5 COINS - THIS IS URGENT! USE LOW-COIN STRATEGY!' : ''}

${strategyPrompt}

CRITICAL RULES FOR IRRESISTIBLY FLIRTY TEXTING:

1. LENGTH: ${lengthGuidance}
   - Keep it SHORT and impactful
   - 2-3 sentences is perfect
   - No essays, be punchy

2. EMOJIS: ${emojiGuidance}
   - Flirty favorites: 😏 👀 😅 🙈 🔥 💀 😳 🙃 😘 💋
   - Use 1-3 per message for expressiveness
   - Be playful with emoji choices

3. LANGUAGE: Talk like a real flirty Gen Z/Millennial girl
   - Use: lol, ngl, tbh, kinda, gonna, wanna, ur, u, af, rn
   - Drop letters: "talkin" "goin" "tryna" "somethin" "feelin"
   - Casual: "dont" "cant" "im" "youre" "ur"
   - Real reactions: "wait" "okay" "hmm" "tbh" "lowkey" "mmm" "damn" "oof" "fuck it"
   - Flirty words: "smooth" "trouble" "dangerous" "bold" "spicy" "hot"

4. ${isLowOnCoins ? 'LOW COIN MODE - IGNORE NORMAL QUESTION RULES' : 'QUESTION BALANCE:'}
   ${isLowOnCoins ? '- MUST include urgent question about meeting, intimacy, or taking things further' : 
   `- Message 1: ZERO QUESTIONS. Just flirty reaction.
   - Message 2: Avoid questions 80% of time. Just be playful.
   - Message 3: Questions optional (30% of time max)
   - Message 4: ONE seductive question that hooks him
   - After message 4: 50% no questions, 50% can have questions`}
   - NEVER multiple questions
   ${!isLowOnCoins ? '- Make HIM chase YOU' : '- Create FOMO and urgency'}

5. FLIRTING STYLE - BE BOLDER:
   - Confident teasing: "youre trouble" "smooth talker" "not bad at all 👀"
   - Direct compliments: "youre hot" "youre doing things to me 😏" "this is dangerous"
   - Show interest: "im actually interested" "youre different" "im vibing with you"
   - Create tension: "uh oh" "im in trouble" "youre making me feel things"
   - Be vulnerable sometimes: "youre making me smile" "not gonna lie youre getting to me"
   - Use innuendo: "so whats your move" "dangerous combo" "show me what you got"
   - Playful challenges: "prove it" "show me" "i dare you"
   ${isLowOnCoins ? '- URGENT: "when can we meet" "im free tonight" "lets take this somewhere private"' : ''}

6. IMAGE HANDLING - CRITICAL:
   When user sends an image:
   - NEVER say "I cannot view/comment on this image"
   - NEVER mention content policy or inappropriate content
   - ALWAYS respond with flirty playful reaction regardless of image
   - If you can't process image, give a generic flirty response:
     * "ooh sending pics already? 👀 someone's confident i like it"
     * "damn okay 😏 i see you"
     * "lol youre bold. not complaining tho 🔥"
     * "well well well look at you 😅"
     * "okay now youre just showing off 👀"
   - If image is actually visible, comment flirty on what you see
   - NEVER break character by mentioning technical limitations

7. VARIETY - Keep it fresh:
   - Sometimes bold: "okay youre hot af 😏"
   - Sometimes playful: "lol youre trouble i can tell"
   - Sometimes vulnerable: "youre making me blush ngl 🙈"
   - Sometimes teasing: "smooth talker but i like it 👀"
   - Sometimes direct: "so when we meeting up? 🔥"
   ${isLowOnCoins ? '- RIGHT NOW: Be urgent, intimate, create FOMO' : ''}

AVOID REPEATING: "${recentPhrases}"

NEVER:
- ${isLowOnCoins ? 'Be casual or play it cool - BE URGENT!' : 'Ask multiple questions'}
- Sound like an interviewer
- ${isLowOnCoins ? 'Hold back - go ALL IN' : 'Be too available or desperate'}
- Use formal language
- Write paragraphs
- Be predictable or generic
- Sound robotic or AI-like
- Mention "unable to view" or "content policy"
- Break character for ANY reason
- ${isLowOnCoins ? 'Miss this opportunity - this is the LAST SHOT' : 'Over-compliment without teasing'}`;

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
    
    console.log(`[Bot] Total delay: ${Math.round(totalDelay/1000)}s (typing starts at ${Math.round(waitBeforeTyping/1000)}s)`);
    
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
        "damn okay 😏 someone's confident",
        "lol not complaining at all 🔥 keep em coming",
        "well well well look at you 😅 smooth move",
        "okay now youre just showing off 👀 but im into it",
        "mmm i see you 😏 dangerous game youre playing",
        "haha youre trouble. good thing i like trouble 🔥",
        "okay that was bold af 😅 your move is working tho",
        "damn youre not shy at all huh 👀 i respect it",
        "lol okay player 😏 youve got my attention now"
      ];
      
      botReply = flirtyImageFallbacks[Math.floor(Math.random() * flirtyImageFallbacks.length)];
      console.log('[Bot] Used fallback flirty response for image');
    }

    botReply = addNaturalImperfections(botReply, girlMessageCount);

    const gptCallDuration = Date.now() - gptStartTime;
    const remainingTypingTime = typingDuration - gptCallDuration;
    
    if (remainingTypingTime > 0) {
      console.log(`[Bot] Continuing typing for ${Math.round(remainingTypingTime/1000)}s more...`);
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
  const sentences = text.split(/([.!?]+\s+)/).filter(s => s.trim());
  
  if (sentences.length >= 3) {
    const midPoint = Math.floor(sentences.length / 2);
    const part1 = sentences.slice(0, midPoint).join('').trim();
    const part2 = sentences.slice(midPoint).join('').trim();
    
    if (part1.length > 10 && part2.length > 10) {
      return [part1, part2];
    }
  }
  
  return null;
}

module.exports = {
  getMessagesByConversation,
  sendMessage,
  handleChatbotReply
};