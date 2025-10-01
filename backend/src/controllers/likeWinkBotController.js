const db = require('../config/db');
const openai = require('../config/openai');
const ChatterModel = require('../models/chatterModel');

async function handleLikeResponse(likeId, senderId, girlId) {
  try {
    // Random delay: 30-50 seconds
    const responseDelay = 30000 + Math.random() * 20000;
    
    console.log(`[Bot] Will respond to like ${likeId} in ${Math.round(responseDelay/1000)}s`);

    setTimeout(async () => {
      try {
        // Get user and girl profile info
        const profilesRes = await db.query(`
          SELECT 
            up.name AS user_name,
            up.age AS user_age,
            gp.name AS girl_name,
            gp.age AS girl_age,
            gp.interests AS girl_interests,
            gp.bio AS girl_bio
          FROM profiles up
          JOIN profiles gp ON gp.user_id = $2
          WHERE up.user_id = $1
        `, [senderId, girlId]);

        if (!profilesRes.rows.length) return;

        const { user_name, user_age, girl_name, girl_age, girl_interests, girl_bio } = profilesRes.rows[0];

        // Generate response using GPT
        const hour = new Date().getHours();
        const timeContext = hour < 6 ? "very late at night" :
                            hour < 12 ? "morning" :
                            hour < 17 ? "afternoon" :
                            hour < 22 ? "evening" : "late night";

        const systemPrompt = `You are ${girl_name}, a ${girl_age}-year-old woman on Liebenly dating app. ${user_name}${user_age ? `, ${user_age} years old,` : ''} just liked your profile!

TIME: ${timeContext}

YOUR TASK: Respond to his like with a SHORT, flirty opening message. This is your FIRST message to him, so make it count!

TONE & STYLE:
- Keep it VERY SHORT: 1-2 sentences max (8-15 words)
- Be confident, playful, and slightly teasing
- Show interest but not desperation
- Use casual Gen Z/Millennial language
- Add 0-1 emoji if natural (😏 👀 😅)
- Sometimes skip punctuation for casual vibe
- Lowercase start is common

RESPONSE TYPES (pick ONE approach):

1. **Playful/Teasing** (40%):
   Wonder why he liked you. Tease him about his choice. Be playfully cocky about your profile.

2. **Direct/Confident** (35%):
   Acknowledge the like directly. Show you noticed him. Be straightforward but flirty.

3. **Curious/Intrigued** (25%):
   Express interest in knowing more. Ask something light. Create intrigue about connecting.

${girl_interests ? `Your interests: ${girl_interests}` : ''}
${girl_bio ? `Your bio: ${girl_bio}` : ''}

CRITICAL RULES:
- NO generic greetings like "hi" or "hey there"
- NO questions about "how are you"
- Be ORIGINAL and specific to the like situation
- Sound natural, not scripted
- Create curiosity and desire to respond
- Sometimes be slightly naughty or use double meanings`;

        const gptResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${user_name} just liked your profile. Respond to his like!` }
          ],
          max_tokens: 60,
          temperature: 1.3,
          presence_penalty: 0.7,
          frequency_penalty: 0.6
        });

        let botReply = gptResponse.choices?.[0]?.message?.content?.trim();
        if (!botReply) return;

        // Add natural imperfections
        botReply = makeTextCasual(botReply);

        // Delete the like and create conversation with message
        await db.query('BEGIN');

        await db.query('DELETE FROM likes WHERE id = $1', [likeId]);

        // Get or create conversation
        const convRes = await db.query(`
          SELECT id FROM conversations WHERE user_id = $1 AND girl_id = $2
        `, [senderId, girlId]);

        let conversationId;
        if (convRes.rows.length > 0) {
          conversationId = convRes.rows[0].id;
        } else {
          const newConv = await db.query(`
            INSERT INTO conversations (user_id, girl_id) VALUES ($1, $2) RETURNING id
          `, [senderId, girlId]);
          conversationId = newConv.rows[0].id;
        }

        // Insert bot's response message
        const msgResult = await db.query(`
          INSERT INTO messages (conversation_id, sender_id, content, sent_at)
          VALUES ($1, $2, $3, NOW())
          RETURNING id, content, sent_at
        `, [conversationId, girlId, botReply]);

        await db.query(`
  INSERT INTO notifications (user_id, sender_id, type, content, is_read, created_at)
  VALUES ($1, $2, 'message', $3, false, NOW())
`, [senderId, girlId, `You received a new message from ${girl_name}`]);

        await db.query('COMMIT');

        // Emit via Socket.IO if available
        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit('receive_message', {
            id: msgResult.rows[0].id,
            text: botReply,
            senderId: girlId,
            timestamp: msgResult.rows[0].sent_at
          });
        }

        console.log(`[Bot] Responded to like ${likeId}: "${botReply}"`);

      } catch (err) {
        console.error('[Bot] Error responding to like:', err);
      }
    }, responseDelay);

  } catch (err) {
    console.error('[Bot] Error scheduling like response:', err);
  }
}

async function handleWinkResponse(winkId, senderId, girlId) {
  try {
    // Random delay: 30-50 seconds
    const responseDelay = 30000 + Math.random() * 20000;
    
    console.log(`[Bot] Will respond to wink ${winkId} in ${Math.round(responseDelay/1000)}s`);

    setTimeout(async () => {
      try {
        // Get user and girl profile info
        const profilesRes = await db.query(`
          SELECT 
            up.name AS user_name,
            up.age AS user_age,
            gp.name AS girl_name,
            gp.age AS girl_age,
            gp.interests AS girl_interests,
            gp.bio AS girl_bio
          FROM profiles up
          JOIN profiles gp ON gp.user_id = $2
          WHERE up.user_id = $1
        `, [senderId, girlId]);

        if (!profilesRes.rows.length) return;

        const { user_name, user_age, girl_name, girl_age, girl_interests, girl_bio } = profilesRes.rows[0];

        // Generate response using GPT
        const hour = new Date().getHours();
        const timeContext = hour < 6 ? "very late at night" :
                            hour < 12 ? "morning" :
                            hour < 17 ? "afternoon" :
                            hour < 22 ? "evening" : "late night";

        const systemPrompt = `You are ${girl_name}, a ${girl_age}-year-old woman on Liebenly dating app. ${user_name}${user_age ? `, ${user_age} years old,` : ''} just winked at you! 😉

TIME: ${timeContext}

YOUR TASK: Respond to his wink with a SHORT, flirty, playful message. He paid coins to wink at you, so acknowledge it with interest!

TONE & STYLE:
- Keep it VERY SHORT: 1-2 sentences max (8-15 words)
- Be more playful than with likes - winks are bolder!
- Tease him about the wink
- Show you're intrigued
- Use casual language
- Add 0-1 emoji (😏 👀 😅 😂)
- Sometimes skip punctuation

RESPONSE TYPES (pick ONE approach):

1. **Playfully Call Out the Wink** (40%):
   Tease him about winking. Acknowledge his bold move. Be cocky about it.

2. **Flirty Reciprocation** (35%):
   Wink back verbally. Match his energy. Show interest playfully.

3. **Intrigued/Naughty** (25%):
   Use double meanings. Be slightly provocative. Create sexual tension subtly.

${girl_interests ? `Your interests: ${girl_interests}` : ''}
${girl_bio ? `Your bio: ${girl_bio}` : ''}

CRITICAL RULES:
- Acknowledge that he WINKED specifically (not liked)
- Be bolder than like responses - winks cost money!
- Sometimes use playful double meanings
- Create immediate chemistry
- Sound natural and spontaneous
- Make him want to continue the conversation`;

        const gptResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `${user_name} just winked at you. Respond to his wink!` }
          ],
          max_tokens: 60,
          temperature: 1.4,
          presence_penalty: 0.7,
          frequency_penalty: 0.6
        });

        let botReply = gptResponse.choices?.[0]?.message?.content?.trim();
        if (!botReply) return;

        // Add natural imperfections
        botReply = makeTextCasual(botReply);

        // Delete the wink and create conversation with message
        await db.query('BEGIN');

        await db.query('DELETE FROM winks WHERE id = $1', [winkId]);

        // Get or create conversation
        const convRes = await db.query(`
          SELECT id FROM conversations WHERE user_id = $1 AND girl_id = $2
        `, [senderId, girlId]);

        let conversationId;
        if (convRes.rows.length > 0) {
          conversationId = convRes.rows[0].id;
        } else {
          const newConv = await db.query(`
            INSERT INTO conversations (user_id, girl_id) VALUES ($1, $2) RETURNING id
          `, [senderId, girlId]);
          conversationId = newConv.rows[0].id;
        }

        // Insert bot's response message
        const msgResult = await db.query(`
          INSERT INTO messages (conversation_id, sender_id, content, sent_at)
          VALUES ($1, $2, $3, NOW())
          RETURNING id, content, sent_at
        `, [conversationId, girlId, botReply]);

        await db.query(`
  INSERT INTO notifications (user_id, sender_id, type, content, is_read, created_at)
  VALUES ($1, $2, 'message', $3, false, NOW())
`, [senderId, girlId, `You received a new message from ${girl_name}`]);



        await db.query('COMMIT');

        // Emit via Socket.IO if available
        if (global.io) {
          global.io.to(`chat-${conversationId}`).emit('receive_message', {
            id: msgResult.rows[0].id,
            text: botReply,
            senderId: girlId,
            timestamp: msgResult.rows[0].sent_at
          });
        }

        console.log(`[Bot] Responded to wink ${winkId}: "${botReply}"`);

      } catch (err) {
        console.error('[Bot] Error responding to wink:', err);
      }
    }, responseDelay);

  } catch (err) {
    console.error('[Bot] Error scheduling wink response:', err);
  }
}

function makeTextCasual(text) {
  let result = text;

  // Lowercase first letter (70% chance)
  if (Math.random() < 0.7) {
    result = result.charAt(0).toLowerCase() + result.slice(1);
  }

  // Replace formal words
  result = result
    .replace(/\byou are\b/gi, 'ur')
    .replace(/\byou're\b/gi, 'ur')
    .replace(/\byour\b/gi, 'ur')
    .replace(/\byou\b/gi, Math.random() > 0.5 ? 'u' : 'you')
    .replace(/\bdon't\b/gi, 'dont')
    .replace(/\bcan't\b/gi, 'cant')
    .replace(/\bI'm\b/gi, 'im')
    .replace(/\bgoing to\b/gi, 'gonna')
    .replace(/\bwant to\b/gi, 'wanna')
    .replace(/\btrying to\b/gi, 'tryna');

  // Remove ending punctuation (50% chance)
  if (Math.random() < 0.5) {
    result = result.replace(/[.!?]+\s*$/, '');
  }

  return result;
}

module.exports = {
  handleLikeResponse,
  handleWinkResponse
};