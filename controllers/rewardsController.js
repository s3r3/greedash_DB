const pool = require("../config/db");

exports.getRewards = async (req, res) => {
  if (parseInt(req.params.user_id) !== req.user_id)
    return res.status(403).json({ error: "Forbidden" });
  const client = await pool.connect();
  try {
    const rewardsRes = await client.query(
      `SELECT r.amount, r.date, r.claimed, s.staked_amount, p.daily_yield
       FROM rewards r
       JOIN stakings s ON r.staking_id = s.id
       JOIN packages p ON s.package_id = p.id
       WHERE s.user_id = $1`,
      [req.user_id]
    );
    const total = rewardsRes.rows.reduce(
      (sum, row) => sum + parseFloat(row.amount),
      0
    );
    res.json({ total_rewards: total, details: rewardsRes.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

exports.swapRewards = async (req, res) => {
  const { staking_id, amount, to_usdt } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const rewardRes = await client.query(
      "SELECT amount FROM rewards WHERE staking_id = $1 AND claimed = FALSE",
      [staking_id]
    );
    if (
      rewardRes.rows.reduce((sum, r) => sum + parseFloat(r.amount), 0) < amount
    )
      throw new Error("Insufficient rewards");

    await client.query(
      "UPDATE rewards SET claimed = TRUE WHERE staking_id = $1",
      [staking_id]
    );

    if (to_usdt) {
      
    } else {
      await client.query(
        "UPDATE users SET balance_egd = balance_egd + $1 WHERE id = $2",
        [amount, req.user_id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
