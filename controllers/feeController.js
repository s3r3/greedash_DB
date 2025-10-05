const pool = require("../config/db");

exports.addFee = async (req, res) => {
  const { tx_amount } = req.body;
  const fee = tx_amount * 0.1;
  const today = new Date().toISOString().split("T")[0];
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO revenue_pool (date, total_fee) VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET total_fee = revenue_pool.total_fee + EXCLUDED.total_fee`,
      [today, fee]
    );
    res.json({ success: true, added_fee: fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
