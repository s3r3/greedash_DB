const pool = require("../config/db");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { wallet } = req.body;
  if (!wallet)
    return res.status(400).json({ error: "Wallet address required" });
  const client = await pool.connect();
  try {
    let userRes = await client.query("SELECT id FROM users WHERE wallet = $1", [
      wallet,
    ]);
    if (userRes.rows.length === 0) {
      userRes = await client.query(
        "INSERT INTO users (wallet) VALUES ($1) RETURNING id",
        [wallet]
      );
    }
    const token = jwt.sign(
      { user_id: userRes.rows[0].id },
      process.env.JWT_SECRET || "secret"
    );
    res.json({
      success: true,
      token,
      user_id: userRes.rows[0].id,
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
