const axios = require('axios');

const scheduleDailyEngagements = () => {
  const timers = [];

  // Generate random milliseconds within each of the 4 segments of a 24-hour day
  const segments = [
    [0, 6 * 60 * 60 * 1000],       // 00:00 - 06:00
    [6 * 60 * 60 * 1000, 12 * 60 * 60 * 1000],  // 06:00 - 12:00
    [12 * 60 * 60 * 1000, 18 * 60 * 60 * 1000], // 12:00 - 18:00
    [18 * 60 * 60 * 1000, 24 * 60 * 60 * 1000]  // 18:00 - 24:00
  ];

  for (let i = 0; i < 4; i++) {
    const [start, end] = segments[i];
    const delay = Math.floor(Math.random() * (end - start) + start); // random in segment

    const timer = setTimeout(async () => {
      try {
        await axios.post(`${process.env.BASE_URL}/auto-engagement/daily-engagement`);
        console.log(`✅ Daily engagement triggered [Slot ${i + 1}] at ${new Date().toLocaleTimeString()}`);
      } catch (err) {
        console.error(`❌ Engagement [Slot ${i + 1}] failed:`, err.message);
      }
    }, delay);

    timers.push(timer);
    console.log(`🕒 Slot ${i + 1} scheduled in ${Math.round(delay / 60000)} minutes`);
  }

  return timers;
};

// Reschedule daily at midnight
const runScheduler = () => {
  let activeTimers = scheduleDailyEngagements();

  setInterval(() => {
    console.log('🔁 Resetting next day’s engagement schedule...');
    activeTimers.forEach(clearTimeout);
    activeTimers = scheduleDailyEngagements();
  }, 24 * 60 * 60 * 1000); // 24 hours
};

runScheduler();
