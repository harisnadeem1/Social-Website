const db = require('../config/db');
const openai = require('../config/openai');
const ChatterModel = require('../models/chatterModel');

class FollowupScheduler {
  constructor() {
    this.scheduledJobs = new Map();
  }

  schedule(conversationId, userId, girlId, attemptNumber, delayMs) {
    this.cancel(conversationId, attemptNumber);

    const timeoutId = setTimeout(async () => {
      try {
        await this.executeFollowup(conversationId, userId, girlId, attemptNumber);
      } catch (error) {
        console.error(`[Follow-up] Error:`, error);
      }
    }, delayMs);

    const jobKey = `${conversationId}-${attemptNumber}`;
    this.scheduledJobs.set(jobKey, { timeoutId, conversationId, userId, girlId, attemptNumber });

    console.log(`[Follow-up] Scheduled attempt ${attemptNumber} for conversation ${conversationId} in ${Math.round(delayMs/1000)}s`);
  }

  cancel(conversationId, attemptNumber = null) {
    if (attemptNumber !== null) {
      const jobKey = `${conversationId}-${attemptNumber}`;
      const job = this.scheduledJobs.get(jobKey);
      
      if (job) {
        clearTimeout(job.timeoutId);
        this.scheduledJobs.delete(jobKey);
        console.log(`[Follow-up] Cancelled attempt ${attemptNumber} for conversation ${conversationId}`);
        return true;
      }
    } else {
      let cancelled = 0;
      for (const [jobKey, job] of this.scheduledJobs.entries()) {
        if (job.conversationId === conversationId) {
          clearTimeout(job.timeoutId);
          this.scheduledJobs.delete(jobKey);
          cancelled++;
        }
      }
      if (cancelled > 0) {
        console.log(`[Follow-up] Cancelled ${cancelled} follow-ups for conversation ${conversationId}`);
      }
      return cancelled > 0;
    }
    return false;
  }

  async executeFollowup(conversationId, userId, girlId, attemptNumber) {
    console.log(`[Follow-up] Executing attempt ${attemptNumber} for conversation ${conversationId}`);

    const lastMsgResult = await db.query(
      `SELECT sender_id FROM messages 
       WHERE conversation_id = $1 
       ORDER BY sent_at DESC LIMIT 1`,
      [conversationId]
    );

    if (!lastMsgResult.rows.length) return;

    if (lastMsgResult.rows[0].sender_id === userId) {
      console.log(`[Follow-up] User already replied, skipping`);
      this.cancel(conversationId, attemptNumber);
      return;
    }

    const convoRes = await db.query(
      `SELECT c.girl_id, gp.name AS girl_name, gp.age AS girl_age, 
              gp.interests, up.name AS user_name
       FROM conversations c
       JOIN profiles gp ON gp.user_id = c.girl_id
       JOIN profiles up ON up.user_id = c.user_id
       WHERE c.id = $1`,
      [conversationId]
    );

    if (!convoRes.rows.length) return;

    const { girl_name: girlName, girl_age: girlAge, interests, user_name: userName } = convoRes.rows[0];

    const historyRes = await db.query(
      `SELECT sender_id, content FROM messages 
       WHERE conversation_id = $1 
       ORDER BY sent_at DESC LIMIT 5`,
      [conversationId]
    );

    const history = historyRes.rows.reverse().map(m => ({
      role: m.sender_id === userId ? 'user' : 'assistant',
      content: m.content || ''
    }));

    const followupMessage = await this.generateFollowup(attemptNumber, girlName, girlAge, userName, interests, history);

    const botMessage = await ChatterModel.sendMessageFromGirl(conversationId, girlId, followupMessage);

    if (global.io) {
      global.io.to(`chat-${conversationId}`).emit('receive_message', {
        id: botMessage.id,
        text: botMessage.content,
        senderId: botMessage.sender_id,
        timestamp: botMessage.sent_at
      });
    }

    console.log(`[Follow-up] Sent attempt ${attemptNumber}: "${followupMessage}"`);

    if (attemptNumber === 1) {
      const delay = 3 * 60 * 60 * 1000;
      this.schedule(conversationId, userId, girlId, 2, delay);
    }

    this.cancel(conversationId, attemptNumber);
  }

  async generateFollowup(attemptNumber, girlName, girlAge, userName, interests, history) {
  const hour = new Date().getHours();
  const timeContext = hour < 6 ? 'very late at night' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 22 ? 'evening' : 'late night';

  const lastGirlMessage = history.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
  const lastUserMessage = history.filter(m => m.role === 'user').slice(-1)[0]?.content || '';

  let systemPrompt;

  if (attemptNumber === 1) {
    systemPrompt = `You are ${girlName}, a ${girlAge}-year-old woman chatting with ${userName || 'him'} on Liebenly dating app.

TIME: ${timeContext}
SITUATION: You sent him a message 1-2 minutes ago and he hasn't replied yet.

YOUR GOAL: Send a light, playful poke to get his attention and bring him back to the chat. Make him curious or smile. Be casual, not needy.

TONE & STYLE:
- Keep it SHORT: MAXIMUM 5-8 WORDS TOTAL
- Be playful and teasing, never desperate
- Use natural casual texting language
- Add 0-1 emoji if it feels natural
- Sometimes skip punctuation at the end
- Start with lowercase sometimes
- Sound like a real person, not scripted

STRATEGIC APPROACHES - Choose ONE that fits the conversation:

1. **Playful Accusation**:
   Tease him about going quiet or disappearing. Wonder if something made him leave. Call out the silence in a flirty way. Ask if he's still there with humor.

2. **Self-Aware Humor**:
   Acknowledge the awkward pause with a joke. Make light of the one-sided conversation. Show awareness of waiting but stay playful. Use self-deprecating humor.

3. **Curious Callback** (only if there was a clear topic/question):
   Circle back to what you were just discussing. Reference something specific he said or you asked. Show genuine interest in continuing that exact thread.

CONVERSATION CONTEXT:
Your last message: "${lastGirlMessage.slice(0, 150)}"
His last message: "${lastUserMessage.slice(0, 150)}"

${interests ? `Your interests: ${interests}` : ''}

CRITICAL RULES:
- Do NOT use generic or cliché phrases
- Create something UNIQUE to THIS conversation
- Reference the actual context you have
- Be creative and spontaneous
- Think: "What would I actually text in this situation?"
- Every message should feel different and natural`;

  } else {
    systemPrompt = `You are ${girlName}, a ${girlAge}-year-old woman chatting with ${userName || 'him'} on Liebenly.

TIME: ${timeContext}
SITUATION: You've sent 2 messages now (1-2 min ago, then 5-7 min later). He still hasn't replied. It's been 7-9 minutes total.

YOUR GOAL: Send ONE FINAL short message that creates mild FOMO but gives him an out.

STRICT LENGTH REQUIREMENT: 
- MAXIMUM 8-12 WORDS TOTAL
- ONE short sentence or phrase
- Brief and to the point

TONE & STYLE:
- Slightly more direct but still cool
- Use casual texting naturally
- 1-2 emojis max
- Sometimes skip punctuation
- Sound confident, not desperate

EXAMPLES OF GOOD LENGTH:
- "alright im gonna assume ur busy lol"
- "okay nvmm then 😅"
- "guess ill catch u later"
- "aight well i tried 🤷‍♀️"
- "lol okay im done bothering u"
- "wait i had something funny to tell u but nvmm"

YOUR LAST MESSAGE: "${lastGirlMessage.slice(0, 100)}"
HIS LAST MESSAGE: "${lastUserMessage.slice(0, 100)}"

CRITICAL: Keep it SHORT and give him a graceful out while making him curious.`;
  }

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history.slice(-3)
    ],
    max_tokens: 30, // Reduced from 80
    temperature: 1.2, // Slightly reduced for more control
    presence_penalty: 0.6,
    frequency_penalty: 0.5
  });

  let message = gptResponse.choices?.[0]?.message?.content?.trim() || "hey u there?";

  // Truncate if too long (safety check)
  const words = message.split(/\s+/);
  const maxWords = attemptNumber === 1 ? 8 : 12;
  if (words.length > maxWords) {
    message = words.slice(0, maxWords).join(' ');
  }

  // Natural text transformations
  if (Math.random() < 0.7) {
    message = message.charAt(0).toLowerCase() + message.slice(1);
  }

  message = message
    .replace(/\byou are\b/gi, 'ur')
    .replace(/\byou're\b/gi, 'ur')
    .replace(/\byour\b/gi, 'ur')
    .replace(/\byou\b/gi, Math.random() > 0.5 ? 'u' : 'you')
    .replace(/\bdon't\b/gi, 'dont')
    .replace(/\bcan't\b/gi, 'cant')
    .replace(/\bI'm\b/gi, 'im')
    .replace(/\bwon't\b/gi, 'wont')
    .replace(/\bdidn't\b/gi, 'didnt')
    .replace(/\bnever mind\b/gi, 'nvmm')
    .replace(/\bgoing to\b/gi, 'gonna')
    .replace(/\bwant to\b/gi, 'wanna')
    .replace(/\btrying to\b/gi, 'tryna');

  // Sometimes remove ending punctuation
  if (Math.random() < 0.6) {
    message = message.replace(/[.!?]+\s*$/, '');
  }

  // Occasionally add casual prefix
  if (Math.random() < 0.15 && attemptNumber === 1) {
    const prefixes = ['lol ', 'okay ', 'umm ', 'wait '];
    message = prefixes[Math.floor(Math.random() * prefixes.length)] + message.charAt(0).toLowerCase() + message.slice(1);
  }

  return message;
}
}

module.exports = new FollowupScheduler();