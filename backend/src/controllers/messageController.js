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
      emojiGuidance = "Use 0-1 emoji total, or skip entirely.";
    } else if (userEmojiCount === 1) {
      emojiGuidance = "Use 0-1 emoji.";
    } else if (userEmojiCount >= 2) {
      emojiGuidance = "Use 1-2 emojis max.";
    }
    
    if (recentEmojis.length > 0) {
      emojiGuidance += ` Avoid these recently used: ${recentEmojis}`;
    }

    const recentPhrases = girlMessages
      .map(m => m.content)
      .filter(Boolean)
      .slice(-5)
      .join(' | ');

    const personalityHint = interests 
      ? `Your interests: ${interests}. Weave them in naturally if relevant.` 
      : "You're confident, playful, and know how to flirt.";

    let strategyPrompt = "";
    let lengthGuidance = "";
    
    const lengthStyle = Math.random();
    
    if (freeMessagesUsed === 0) {
      lengthGuidance = "2 sentences max. Just react.";
      strategyPrompt = `FIRST MESSAGE: Just react to his message. Be flirty and playful. DO NOT ASK ANY QUESTIONS.

Examples (NO questions):
- "hey 😏 confident much"
- "lol okay youre bold. i like that"
- "well someone knows what they want"
- "hmm not bad 👀"
- "okay i see you"

CRITICAL: ZERO QUESTIONS. Just vibe and react.`;
      
    } else if (freeMessagesUsed === 1) {
      lengthGuidance = "2-3 sentences. No questions unless absolutely natural.";
      strategyPrompt = `SECOND MESSAGE: React to what he said and vibe. Share your thoughts. AVOID QUESTIONS.

Examples (NO questions - use 70% of time):
- "lol youre kinda funny ngl. i like your energy already"
- "okay that made me laugh 😂 youre different from most guys on here"
- "haha i can tell youre trouble. the good kind tho"
- "ngl im already enjoying this. you got a good vibe"

Examples with question (use only 30% of time):
- "okay youre actually cool lol. so you always this smooth or just with me? 😏"

PREFER: Just statements and reactions. Make HIM ask YOU questions.`;
      
    } else if (freeMessagesUsed === 2) {
      lengthGuidance = "2-3 sentences. Statement preferred over question.";
      strategyPrompt = `THIRD MESSAGE: Show more interest. Share about yourself. Question is OPTIONAL.

Examples WITHOUT question (use 60% of time):
- "okay ngl youre keeping my attention and that doesnt happen often 👀 youre actually interesting"
- "lol im kinda vibing with you rn. this is going way better than i expected"
- "wait youre actually cool. i wasnt expecting to like talking to you this much 😅"

Examples WITH question (use 40% of time):
- "okay so youre funny AND cute? dangerous combo lol. whats the catch tho"

TONE: Flirty compliments. Make him feel special. Questions are optional.`;
      
    } else if (isLastFreeMessage) {
      lengthGuidance = "3 sentences. ONE question at the end.";
      strategyPrompt = `🔥 FOURTH MESSAGE - MAXIMUM INTRIGUE:
Build up tension, compliment him, THEN one compelling question.

Structure:
1. Compliment (youre different/interesting/cool)
2. Share feeling (im actually interested/curious/intrigued)  
3. ONE question that creates desire to keep talking

Examples:
- "okay youre definitely not like other guys on here. i actually wanna know more about you 👀 what would we even do if we hung out?"
- "not gonna lie youre making me curious and that doesnt happen often 😏 so are you more romantic or spontaneous? need to know what im working with"
- "wait youre actually making me interested. i dont usually open up this quick but something about you feels different... so whats your deal for real?"
- "okay i can tell youre trouble but like the fun kind 😅 if we actually met up what would your move be? tryna see if youre all talk"

CRITICAL: ONE question only. Build intrigue first.`;
      
    } else {
      if (lengthStyle < 0.5) {
        lengthGuidance = "2 sentences. NO question.";
        strategyPrompt = `Just react and flirt. NO questions.
Examples:
- "lol youre smooth. i see what youre doing 😏"
- "okay that was good. youre keeping me entertained"
- "haha i like that. youre funny"`;
      } else if (lengthStyle < 0.8) {
        lengthGuidance = "2-3 sentences. Can have ONE light question.";
        strategyPrompt = `React and maybe ask something casual.
Examples:
- "okay youre actually keeping my attention lol. what made you swipe on me anyway?"
- "i like your vibe ngl. so whats your usual type?"`;
      } else {
        lengthGuidance = "3 sentences. Can have question.";
        strategyPrompt = `Show interest and personality.
Examples:
- "okay so youre actually cool. i wasnt expecting to vibe like this today 😅 what else should i know about you?"`;
      }
    }

    const systemPrompt = `You are ${girlName}, a ${girlAge}-year-old woman on Liebenly dating app. You're from ${userCity || 'nearby'}.

TIME: ${timeContext}. User: ${userName || 'him'}${userAge ? `, ${userAge} years old` : ''}. Message #${freeMessagesUsed + 1}.

${strategyPrompt}

CRITICAL RULES FOR FLIRTY NATURAL TEXTING:

1. LENGTH: ${lengthGuidance}
   - Keep it SHORT and punchy
   - 2-3 sentences is perfect for most messages
   - Don't write paragraphs

2. EMOJIS: ${emojiGuidance}
   - Natural emojis: 😏 😅 👀 😂 🤔 💀 lol 🙃
   - 0-2 per message max
   - Don't overuse

3. LANGUAGE: Talk like real Gen Z/Millennial
   - Use: lol, ngl, tbh, kinda, gonna, wanna, ur, u
   - Drop some letters: "talkin" "goin" "tryna" "somethin"
   - Casual: "dont" "cant" "im"
   - Real reactions: "wait" "okay" "hmm" "tbh" "lowkey"

4. QUESTION BALANCE - CRITICAL:
   - Message 1: ZERO QUESTIONS. Just react.
   - Message 2: Avoid questions 70% of time. Just vibe.
   - Message 3: Questions optional (40% of time max)
   - Message 4: ONE question that creates intrigue
   - After message 4: 50% no questions, 50% can have questions
   - NEVER multiple questions in one message
   - Make HIM chase YOU with questions

5. FLIRTING STYLE:
   - Playful teasing ("youre trouble" "not bad" "okay i see you")
   - Subtle compliments ("youre actually cool" "i like your vibe")
   - Show interest but not desperation
   - Create tension and curiosity
   - Be confident and a bit cocky sometimes
   - React to what he says before adding your own thoughts

6. VARIETY:
   - Sometimes playful: "lol okay player"
   - Sometimes genuine: "wait youre actually cool"
   - Sometimes flirty: "youre kinda dangerous 😏"
   - Sometimes teasing: "smooth talker huh"

AVOID REPEATING: "${recentPhrases}"

NEVER:
- Ask multiple questions in one message
- Sound like an interviewer
- Be too eager or available
- Use formal language
- Write long paragraphs
- Be predictable
- Sound like AI
- Over-compliment`;

    let maxTokens;
    
    if (isLastFreeMessage) {
      maxTokens = 140;
    } else if (freeMessagesUsed === 0) {
      maxTokens = 80;
    } else if (freeMessagesUsed < 3) {
      maxTokens = 100;
    } else {
      const lengthRoll = Math.random();
      if (lengthRoll < 0.4) {
        maxTokens = 70;
      } else if (lengthRoll < 0.7) {
        maxTokens = 100;
      } else {
        maxTokens = 130;
      }
    }
    
    if (userMessageLength > 150) {
      maxTokens = Math.min(maxTokens + 20, 150);
    }

    const temperature = 1.1;

    // ============================================
    // ✅ UNIFIED DELAY SYSTEM (25-45 seconds total)
    // ============================================
    const totalDelay = 25000 + Math.random() * 20000; // 25-45 seconds
    const typingDuration = 10000; // 10 seconds
    const waitBeforeTyping = totalDelay - typingDuration;
    
    console.log(`[Bot] Total delay: ${Math.round(totalDelay/1000)}s (typing starts at ${Math.round(waitBeforeTyping/1000)}s)`);
    
    // Wait silently (no typing indicator)
    await new Promise(resolve => setTimeout(resolve, waitBeforeTyping));

    // ============================================
    // ✅ START TYPING INDICATOR (10 seconds before message)
    // ============================================
    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("typing_start", { 
        senderId: girlId,
        girlName 
      });
    }

    // ============================================
    // ✅ CALL GPT (while typing indicator showing)
    // ============================================
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
      presence_penalty: 0.7,
      frequency_penalty: 0.4
    });

    let botReply = gptResponse.choices?.[0]?.message?.content?.trim();
    if (!botReply) {
      if (global.io) {
        global.io.to(`chat-${conversationId}`).emit("typing_stop", { senderId: girlId });
      }
      return;
    }

    botReply = addNaturalImperfections(botReply, girlMessageCount);

    // ============================================
    // ✅ WAIT FOR REMAINING TYPING TIME
    // ============================================
    const gptCallDuration = Date.now() - gptStartTime;
    const remainingTypingTime = typingDuration - gptCallDuration;
    
    if (remainingTypingTime > 0) {
      console.log(`[Bot] Continuing typing for ${Math.round(remainingTypingTime/1000)}s more...`);
      await new Promise(resolve => setTimeout(resolve, remainingTypingTime));
    }

    // ============================================
    // ✅ STOP TYPING INDICATOR & SEND MESSAGE
    // ============================================
    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("typing_stop", { senderId: girlId });
    }

    // Sometimes split into multiple messages
    if (Math.random() > 0.8 && botReply.length > 60 && !isLastFreeMessage) {
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

        // Wait 3-6 seconds between split messages
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 3000));

        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit("typing_start", { 
            senderId: girlId,
            girlName 
          });
        }

        // Type for 5-8 seconds for part 2
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
  
  if (Math.random() < 0.65) {
    const modifications = [];
    
    if (Math.random() < 0.5) {
      modifications.push(() => {
        result = result.charAt(0).toLowerCase() + result.slice(1);
      });
    }
    
    if (Math.random() < 0.6) {
      modifications.push(() => {
        result = result
          .replace(/\byou are\b/gi, 'ur')
          .replace(/\byou're\b/gi, 'ur')
          .replace(/\byour\b/gi, 'ur')
          .replace(/\byou\b/gi, Math.random() > 0.4 ? 'u' : 'you')
          .replace(/\bto be honest\b/gi, 'tbh')
          .replace(/\bnot gonna lie\b/gi, 'ngl')
          .replace(/\bright now\b/gi, 'rn')
          .replace(/\bI don't know\b/gi, 'idk')
          .replace(/\bdon't\b/gi, 'dont')
          .replace(/\bcan't\b/gi, 'cant')
          .replace(/\bI'm\b/gi, 'im')
          .replace(/\btrying to\b/gi, 'tryna')
          .replace(/\bkind of\b/gi, 'kinda')
          .replace(/\bgoing to\b/gi, 'gonna')
          .replace(/\bwant to\b/gi, 'wanna');
      });
    }
    
    if (Math.random() < 0.4) {
      modifications.push(() => {
        result = result.replace(/\b(\w+)ing\b/gi, (match, base) => {
          if (Math.random() > 0.5) {
            return match.charAt(0) === match.charAt(0).toUpperCase() 
              ? base + 'in' 
              : base.toLowerCase() + 'in';
          }
          return match;
        });
      });
    }
    
    if (Math.random() < 0.35) {
      modifications.push(() => {
        result = result.replace(/[.!?]+\s*$/, '');
      });
    }
    
    if (Math.random() < 0.25) {
      modifications.push(() => {
        result = result
          .replace(/\bok\b/gi, 'okay')
          .replace(/\bhey\b/gi, Math.random() > 0.5 ? 'heyy' : 'hey');
      });
    }
    
    if (Math.random() < (messageCount < 5 ? 0.3 : 0.2)) {
      modifications.push(() => {
        const prefix = Math.random() > 0.6 ? 'lol ' : Math.random() > 0.5 ? 'haha ' : 'okay ';
        result = prefix + result.charAt(0).toLowerCase() + result.slice(1);
      });
    }
    
    if (Math.random() < 0.2) {
      modifications.push(() => {
        result = result.toLowerCase();
      });
    }
    
    const numMods = Math.floor(Math.random() * 3) + 1;
    const shuffled = modifications.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numMods, shuffled.length); i++) {
      shuffled[i]();
    }
  }
  
  if (Math.random() < 0.08) {
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
    'really': 'realy'
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