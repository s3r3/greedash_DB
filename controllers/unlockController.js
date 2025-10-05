const pool = require("../config/db");

exports.unlockStake = async (req, res) => {
  const staking_id = req.params.staking_id;
  const client = await pool.connect();
  try {
    const stakeRes = await client.query(
      "SELECT user_id, staked_amount, end_date, status FROM stakings WHERE id = $1",
      [staking_id]
    );
    if (stakeRes.rows.length === 0 || stakeRes.rows[0].user_id !== req.user_id)
      throw new Error("Invalid staking");
    if (stakeRes.rows[0].status === "unlocked")
      throw new Error("Already unlocked");

    const end_date = new Date(stakeRes.rows[0].end_date);
    if (new Date() < end_date) throw new Error("Lock period not over");

    await client.query(
      "UPDATE stakings SET status = 'unlocked' WHERE id = $1",
      [staking_id]
    );
    await client.query(
      "UPDATE users SET balance_egd = balance_egd + $1 WHERE id = $2",
      [stakeRes.rows[0].staked_amount, req.user_id]
    );

    res.json({
      success: true,
      unlocked_amount: stakeRes.rows[0].staked_amount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
