const jwt = require("jsonwebtoken");
const pool = require("../config/db"); // your PostgreSQL DB connection




const verifyToken = async (req, res, next) => {





  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log(decode);

    // Fetch user from DB using decoded ID
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = rows[0]; // attaches full user including role

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {


  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};

module.exports = { verifyToken ,isAdmin};
