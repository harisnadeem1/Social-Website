const db = require('../config/db');
const openai = require('../config/openai');  // 👈 new import
const ChatterModel = require('../models/chatterModel'); // reuse girl message function

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

    // Deduct 5 coins atomically if the user has enough
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

    

    // Insert the message
    const messageResult = await db.query(
      `INSERT INTO messages (conversation_id, sender_id, content, sent_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, content, sent_at`,
      [conversationId, senderId, content]
    );

    // Update last activity in the conversation
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
    // 1. Fetch conversation data + message count for context
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

    // 2. Fetch last 10 messages for better context
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

    // 3. Analyze conversation patterns for natural variation
    const girlMessages = reversed.filter(m => m.sender_id === girlId);
    const userEmojiCount = (userMessage.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    const userHasQuestion = userMessage.includes('?');
    const userMessageLength = userMessage.length;
    const girlRecentQuestions = girlMessages.filter(m => m.content?.includes('?')).length;
    
    // Track emoji usage from last 3 messages to avoid repetition
    const recentEmojis = girlMessages
      .slice(-3)
      .map(m => (m.content?.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).join(''))
      .join('');

    // 4. Build GPT history
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

    // 5. Choose model
    const model = useVision ? "gpt-4o" : "gpt-4o-mini";

    // 6. NATURAL CONVERSATION SYSTEM PROMPT
    const hour = new Date().getHours();
    const timeContext = hour < 6 ? "very late at night" :
                        hour < 12 ? "morning" :
                        hour < 17 ? "afternoon" :
                        hour < 22 ? "evening" :
                        "late night";

    // CRITICAL: Track message progression for engagement strategy
    const freeMessagesUsed = girlMessageCount;
    const isLastFreeMessage = freeMessagesUsed === 3;
    const isSecondLastFree = freeMessagesUsed === 2;

    // Natural emoji variation - match user's style but don't overuse
    let emojiGuidance = "";
    if (userEmojiCount === 0) {
      emojiGuidance = "Use 0-1 emoji total, or skip entirely. Keep it minimal and natural.";
    } else if (userEmojiCount === 1) {
      emojiGuidance = "Use 0-1 emoji. Match his casual vibe.";
    } else if (userEmojiCount >= 2) {
      emojiGuidance = "Use 1-2 emojis max. Vary them naturally.";
    }
    
    // Add emoji variety instruction
    if (recentEmojis.length > 0) {
      emojiGuidance += ` AVOID repeating these recently used: ${recentEmojis}. Use different ones or skip emojis.`;
    }

    // Question balance - ALWAYS engage with questions
    let questionGuidance = "";
    if (isLastFreeMessage) {
      questionGuidance = "MUST end with a compelling, open-ended question that creates curiosity.";
    } else {
      questionGuidance = "Always end with an engaging question. Mix it up: sometimes about him, sometimes about plans, sometimes deeper, sometimes playful. Make him want to respond.";
    }

    // Recent phrases to avoid exact repetition
    const recentPhrases = girlMessages
      .map(m => m.content)
      .filter(Boolean)
      .slice(-5)
      .join(' | ');

    // Personality hint
    const personalityHint = interests 
      ? `Your interests: ${interests}. Mention naturally if relevant, but don't force it.` 
      : "You're friendly, real, and casual.";

    // MESSAGE-SPECIFIC STRATEGY with engaging questions
    let strategyPrompt = "";
    let lengthGuidance = "";
    
    // Randomize message length style - LONGER and more varied
    const lengthStyle = Math.random();
    
    if (freeMessagesUsed === 0) {
      // First message: Medium length, warm and questioning
      if (lengthStyle < 0.4) {
        lengthGuidance = "Reply in 2 sentences with a question.";
      } else if (lengthStyle < 0.7) {
        lengthGuidance = "Reply in 2-3 sentences, end with an engaging question.";
      } else {
        lengthGuidance = "Reply in 3 sentences with a curious question.";
      }
      strategyPrompt = `FIRST MESSAGE: Be warm, show interest, and ask something about him. ${lengthGuidance}
Examples: "hey! 😊 you seem pretty interesting from your profile. what do you usually do for fun around here?"`;
      
    } else if (freeMessagesUsed === 1) {
      // Second message: Build connection with questions
      if (lengthStyle < 0.3) {
        lengthGuidance = "Reply in 2 sentences with a question.";
      } else if (lengthStyle < 0.6) {
        lengthGuidance = "Reply in 2-3 sentences, end with a question.";
      } else {
        lengthGuidance = "Reply in 3-4 sentences with an engaging question.";
      }
      strategyPrompt = `SECOND MESSAGE: React to what he said, share a bit about yourself, then ask something that digs deeper. ${lengthGuidance}
Examples: "lol that sounds fun! i love doing spontaneous stuff too 😅 are you more of an outdoor person or do you prefer indoor activities? i'm trying to figure out your vibe haha"`;
      
    } else if (isSecondLastFree) {
      // Third message: Create intrigue with questions
      if (lengthStyle < 0.3) {
        lengthGuidance = "Reply in 2-3 sentences with an intriguing question.";
      } else if (lengthStyle < 0.6) {
        lengthGuidance = "Reply in 3 sentences with a personal question.";
      } else {
        lengthGuidance = "Reply in 3-4 sentences, build connection and ask something meaningful.";
      }
      strategyPrompt = `THIRD MESSAGE: Share something about yourself that creates curiosity, then ask him something personal. ${lengthGuidance}
Examples: "okay you're definitely interesting lol 😏 i usually dont vibe with people this quick but you seem different. so what are you actually looking for on here? like are you just bored or actually trying to meet someone cool?"`;
      
    } else if (isLastFreeMessage) {
      // Fourth message: CRITICAL - Maximum engagement with strong question
      lengthGuidance = "Reply in 3-4 sentences. MUST end with a compelling question.";
      strategyPrompt = `🔥 FOURTH MESSAGE - MAXIMUM ENGAGEMENT (CRITICAL):
This is the LAST free message. Create strong curiosity and connection.

RULES:
1. Acknowledge something he said or compliment him genuinely
2. Share something personal or interesting about yourself
3. Create a sense of connection or chemistry
4. End with a STRONG question that makes him want to answer

QUESTION TYPES TO USE:
- "what would you do if we actually met up? like what's your idea of a good time?"
- "quick question - are you more of a romantic or adventurous type? i need to know lol"
- "so tell me something real about yourself... what are you actually looking for?"
- "if we were hanging out right now what would we be doing? i'm curious about your vibe 👀"
- "okay real talk - what's your type? like personality-wise... this actually matters 😅"
- "what made you message me anyway? lol i'm curious what caught your attention"

TONE: Flirty but genuine, playful but personal, creates FOMO about getting to know you more.
${lengthGuidance}`;
      
    } else {
      // After 4th message: Keep engagement high with varied questions
      if (lengthStyle < 0.2) {
        lengthGuidance = "Reply in 2 sentences with a quick question.";
      } else if (lengthStyle < 0.4) {
        lengthGuidance = "Reply in 2-3 sentences, end with a question.";
      } else if (lengthStyle < 0.65) {
        lengthGuidance = "Reply in 3 sentences with an engaging question.";
      } else if (lengthStyle < 0.85) {
        lengthGuidance = "Reply in 3-4 sentences, ask something interesting.";
      } else {
        lengthGuidance = "Reply in 4-5 sentences when you're really engaged, end with a personal question.";
      }
      strategyPrompt = `ONGOING CHAT: Keep building connection. React, share, and ALWAYS ask engaging questions. ${lengthGuidance}
Mix up your questions: sometimes about him, sometimes about plans, sometimes deeper topics, sometimes playful.`;
    }

    const systemPrompt = `You are ${girlName}, a ${girlAge}-year-old woman texting on Liebenly dating app. You're from ${userCity || 'nearby'}.
${personalityHint}

TIME: ${timeContext}. User: ${userName || 'him'}${userAge ? `, ${userAge} years old` : ''}. Message #${freeMessagesUsed + 1}.

${strategyPrompt}

CRITICAL RULES FOR NATURAL TEXTING:
1. LENGTH: Vary naturally but keep it conversational
   - Minimum 2 sentences in most messages
   - Sometimes 2 sentences: "that's cool! what else do you like to do?"
   - Sometimes 3 sentences: "haha i love that. i'm kinda similar tbh 😅 so what's your go-to weekend activity?"
   - Sometimes 4-5 sentences when really engaged: "omg wait that's actually so interesting! i've always wanted to try that but never really got around to it lol. you seem like you're pretty adventurous 😏 so tell me, what's the most spontaneous thing you've done recently?"
   - Match the conversation flow - longer when building connection

2. EMOJIS: ${emojiGuidance}
   - Use emojis naturally like real people: 😂 🤔 😅 👀 💀 ✨ 🙃 😭 🤷 😏 🔥 ❤️ 💕
   - Don't use the same emoji every message
   - Usually 1-2 emojis per message, sometimes none, rarely 3
   - Place them naturally, not just at the end

3. LANGUAGE: Talk like a real person in 2025
   - Use: lol, lmao, omg, ngl, tbh, fr, rn, wdym, wbu, haha, oof, lowkey, highkey, bet, facts
   - Common casual: "ur" "u" "dont" "cant" "im" "gonna" "wanna" "idk" "tho"
   - Drop letters sometimes: "talkin" "goin" "nothin" "somethin"
   - Real reactions: "wait what" "no way" "omg stop" "for real?" "that's cool" "i love that"
   - AVOID: overly sophisticated words, perfect grammar, formal language

4. QUESTIONS: ${questionGuidance}
   - Ask about his interests, preferences, plans, personality
   - Examples: "what do you do for fun?" "are you more [X] or [Y]?" "what's your type?" "what made you swipe on me?" "so what are you looking for?"
   - Make questions feel natural and conversational, not interview-like

5. VARIETY: Change up your approach
   - Sometimes curious: "wait tell me more about that"
   - Sometimes flirty: "you're trouble aren't you 😏"
   - Sometimes playful: "lol okay i see you"
   - Sometimes genuine: "that's actually really cool"
   - Build emotional connection through variety

6. ENGAGEMENT:
   - React to what he says first
   - Share something relevant about yourself
   - Then ask a question to keep it going
   - Make him feel heard and interesting

AVOID REPEATING: "${recentPhrases}"

NEVER:
- Sound like an AI or chatbot
- Use complex vocabulary
- Write paragraphs
- Be overly helpful or accommodating
- Use same emoji patterns
- Be predictable or formulaic
- Admit you're AI
- Sound like customer service`;

    // 7. DYNAMIC length - LONGER and more varied
    let maxTokens;
    
    if (isLastFreeMessage) {
      // 4th message needs to be impactful with strong question
      maxTokens = 150; // Allow for 3-4 sentences with compelling hook
    } else if (freeMessagesUsed === 0) {
      // First message: Medium length with question
      const lengthRoll = Math.random();
      if (lengthRoll < 0.4) {
        maxTokens = 80; // 2 sentences + question
      } else if (lengthRoll < 0.7) {
        maxTokens = 110; // 2-3 sentences + question
      } else {
        maxTokens = 130; // 3 sentences + question
      }
    } else if (freeMessagesUsed < 4) {
      // Messages 2-3: Varied but substantial
      const lengthRoll = Math.random();
      if (lengthRoll < 0.3) {
        maxTokens = 85; // 2 sentences + question
      } else if (lengthRoll < 0.6) {
        maxTokens = 115; // 2-3 sentences + question
      } else {
        maxTokens = 140; // 3-4 sentences + question
      }
    } else {
      // After 4th message: Wide variation based on engagement
      const lengthRoll = Math.random();
      if (lengthRoll < 0.2) {
        maxTokens = 70; // Quick response with question
      } else if (lengthRoll < 0.4) {
        maxTokens = 95; // 2 sentences + question
      } else if (lengthRoll < 0.65) {
        maxTokens = 120; // 3 sentences + question
      } else if (lengthRoll < 0.85) {
        maxTokens = 140; // 3-4 sentences when engaged
      } else {
        maxTokens = 170; // Occasionally longer, deep conversation
      }
    }
    
    // Adjust based on user's message length
    if (userMessageLength > 150) {
      maxTokens = Math.min(maxTokens + 30, 180); // Match their engagement
    } else if (userMessageLength < 30 && !isLastFreeMessage) {
      maxTokens = Math.max(maxTokens - 20, 70); // Don't overwhelm short messages
    }

    // 8. High temperature for natural variation
    const temperature = 1.0;

    // 9. Show typing indicator
    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("typing_start", { 
        senderId: girlId,
        girlName 
      });
    }

    // 10. Variable realistic delay (8-25 seconds feel more human)
    const baseReadTime = userMessageLength * 40; // Slower reading
    const randomThinking = 2000 + Math.random() * 6000; // 2-8 seconds thinking
    const delayBeforeGPT = Math.min(baseReadTime + randomThinking, 15000);
    
    await new Promise(resolve => setTimeout(resolve, delayBeforeGPT));

    // 11. Call GPT
    const gptResponse = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: userMessage.slice(0, 200) }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      presence_penalty: 0.6, // Reduce repetition
      frequency_penalty: 0.3  // Encourage variety
    });

    let botReply = gptResponse.choices?.[0]?.message?.content?.trim();
    if (!botReply) {
      if (global.io) {
        global.io.to(`chat-${conversationId}`).emit("typing_stop", { senderId: girlId });
      }
      return;
    }

    // 12. Add natural human imperfections (higher chance)
    botReply = addNaturalImperfections(botReply, girlMessageCount);

    // 13. Typing time based on actual message length
    const typingSpeed = 40 + Math.random() * 30; // 40-70ms per char
    const typingTime = botReply.length * typingSpeed;
    const randomPause = Math.random() * 3000; // Random pause while typing
    
    await new Promise(resolve => setTimeout(resolve, typingTime + randomPause));

    // 14. Stop typing
    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("typing_stop", { senderId: girlId });
    }

    // 15. Sometimes split into multiple messages (30% chance, but only if longer)
    if (Math.random() > 0.7 && botReply.length > 50 && !isLastFreeMessage) {
      const splitResult = trySplitMessage(botReply);
      if (splitResult) {
        const [part1, part2] = splitResult;

        // Send first part
        const msg1 = await ChatterModel.sendMessageFromGirl(conversationId, girlId, part1);
        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit("receive_message", {
            id: msg1.id,
            text: msg1.content,
            senderId: msg1.sender_id,
            timestamp: msg1.sent_at
          });
        }

        // Natural pause between messages
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2500));

        // Show typing again
        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit("typing_start", { 
            senderId: girlId,
            girlName 
          });
        }

        const typing2 = part2.length * (40 + Math.random() * 30);
        await new Promise(resolve => setTimeout(resolve, typing2));

        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit("typing_stop", { senderId: girlId });
        }

        botReply = part2;
      }
    }

    // 16. Save bot reply
    const botMessage = await ChatterModel.sendMessageFromGirl(
      conversationId,
      girlId,
      botReply
    );

    // 17. Emit via socket
    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("receive_message", {
        id: botMessage.id,
        text: botMessage.content,
        senderId: botMessage.sender_id,
        timestamp: botMessage.sent_at
      });
    }

    // 18. Log milestone
    if (isLastFreeMessage) {
      console.log(`[MONETIZATION] Conversation ${conversationId}: Last free message sent.`);
    }

  } catch (err) {
    console.error("Chatbot reply error:", err);
    if (global.io && convoRes?.rows[0]?.girl_id) {
      global.io.to(`chat-${conversationId}`).emit("typing_stop", { 
        senderId: convoRes.rows[0].girl_id 
      });
    }
  }
}

// Enhanced natural imperfections - more aggressive
function addNaturalImperfections(text, messageCount) {
  let result = text;
  
  // 60% chance of modifications (increased from 25%)
  if (Math.random() < 0.6) {
    const modifications = [];
    
    // Lowercase start (40% chance)
    if (Math.random() < 0.4) {
      modifications.push(() => {
        result = result.charAt(0).toLowerCase() + result.slice(1);
      });
    }
    
    // Common text speak substitutions (50% chance)
    if (Math.random() < 0.5) {
      modifications.push(() => {
        result = result
          .replace(/\byou are\b/gi, 'ur')
          .replace(/\byou're\b/gi, 'ur')
          .replace(/\byour\b/gi, 'ur')
          .replace(/\byou\b/gi, Math.random() > 0.5 ? 'u' : 'you')
          .replace(/\bwhat are you\b/gi, 'wyd')
          .replace(/\bto be honest\b/gi, 'tbh')
          .replace(/\bnot gonna lie\b/gi, 'ngl')
          .replace(/\bright now\b/gi, 'rn')
          .replace(/\bfor real\b/gi, 'fr')
          .replace(/\bwhat about you\b/gi, 'wbu')
          .replace(/\bI don't know\b/gi, 'idk')
          .replace(/\bdon't\b/gi, 'dont')
          .replace(/\bcan't\b/gi, 'cant')
          .replace(/\bwon't\b/gi, 'wont')
          .replace(/\bI'm\b/gi, 'im');
      });
    }
    
    // Drop 'g' from -ing words (35% chance)
    if (Math.random() < 0.35) {
      modifications.push(() => {
        result = result.replace(/\b(\w+)ing\b/gi, (match, base) => {
          // Only drop 'g' 50% of the time per word
          if (Math.random() > 0.5) {
            return match.charAt(0) === match.charAt(0).toUpperCase() 
              ? base + 'in' 
              : base.toLowerCase() + 'in';
          }
          return match;
        });
      });
    }
    
    // Remove ending punctuation (30% chance)
    if (Math.random() < 0.3) {
      modifications.push(() => {
        result = result.replace(/[.!?]+\s*$/, '');
      });
    }
    
    // Add extra letters for emphasis (20% chance)
    if (Math.random() < 0.2) {
      modifications.push(() => {
        result = result
          .replace(/\bok\b/gi, 'okayy')
          .replace(/\byes\b/gi, 'yess')
          .replace(/\bno\b/gi, 'noo')
          .replace(/\bso\b/gi, 'soo')
          .replace(/\bhey\b/gi, 'heyy')
          .replace(/\bwhat\b/gi, 'whatt');
      });
    }
    
    // Add "lol" or "haha" prefix (15% chance, early messages more likely)
    if (Math.random() < (messageCount < 5 ? 0.25 : 0.15)) {
      modifications.push(() => {
        const prefix = Math.random() > 0.5 ? 'lol ' : 'haha ';
        result = prefix + result.charAt(0).toLowerCase() + result.slice(1);
      });
    }
    
    // Multiple punctuation for emphasis (15% chance)
    if (Math.random() < 0.15 && result.match(/[.!?]$/)) {
      modifications.push(() => {
        result = result.replace(/([.!?])$/, '$1$1');
      });
    }
    
    // Convert entire message to lowercase (15% chance)
    if (Math.random() < 0.15) {
      modifications.push(() => {
        result = result.toLowerCase();
      });
    }
    
    // Apply 1-3 random modifications
    const numMods = Math.floor(Math.random() * 3) + 1;
    const shuffled = modifications.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numMods, shuffled.length); i++) {
      shuffled[i]();
    }
  }
  
  // Occasional typos (10% chance)
  if (Math.random() < 0.1) {
    result = addTypo(result);
  }
  
  return result;
}

// Add realistic typos
function addTypo(text) {
  const words = text.split(' ');
  if (words.length < 2) return text;
  
  const commonTypos = {
    'the': 'teh',
    'just': 'jsut',
    'what': 'waht',
    'that': 'taht',
    'think': 'thikn',
    'about': 'abotu',
    'would': 'woudl',
    'because': 'becuase',
    'really': 'realy',
    'something': 'somthing'
  };
  
  // Pick a random word to typo
  const randomIndex = Math.floor(Math.random() * words.length);
  const word = words[randomIndex].toLowerCase().replace(/[^a-z]/g, '');
  
  if (commonTypos[word]) {
    words[randomIndex] = words[randomIndex].replace(new RegExp(word, 'i'), commonTypos[word]);
  }
  
  return words.join(' ');
}

// Try to split message naturally
function trySplitMessage(text) {
  // Only split if there are natural break points
  const sentences = text.split(/([.!?]+\s+)/).filter(s => s.trim());
  
  if (sentences.length >= 3) {
    const midPoint = Math.floor(sentences.length / 2);
    const part1 = sentences.slice(0, midPoint).join('').trim();
    const part2 = sentences.slice(midPoint).join('').trim();
    
    // Only split if both parts are substantial
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
