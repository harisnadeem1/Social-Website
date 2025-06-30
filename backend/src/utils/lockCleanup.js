const pool =require("../config/db.js");

const releaseExpiredLocks = async () => {
  const expirationMs = 2 * 60 * 1000;
  const now = new Date();

  try {
    const res = await pool.query(`
      UPDATE conversations
      SET locked_by = NULL, lock_time = NULL
      WHERE locked_by IS NOT NULL
      AND (EXTRACT(EPOCH FROM ($1 - lock_time)) * 1000) > $2
      RETURNING id
    `, [now, expirationMs]);

    if (res.rowCount > 0) {
      console.log(`Released ${res.rowCount} expired lock(s).`);
    }
  } catch (err) {
    console.error("Error releasing expired locks:", err);
  }
};

module.exports = {releaseExpiredLocks}


