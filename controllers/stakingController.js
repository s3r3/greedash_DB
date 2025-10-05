const pool = require("../config/db");

exports.purchaseStake = async (req, res) => {
  const { package_name, amount } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const pkgRes = await client.query(
      "SELECT id, daily_yield FROM packages WHERE name = $1 AND min_stake <= $2",
      [package_name, amount]
    );
    if (pkgRes.rows.length === 0) throw new Error("Invalid package");

    const package_id = pkgRes.rows[0].id;
    const start_date = new Date();
    const end_date = new Date(start_date);
    end_date.setDate(end_date.getDate() + 365);

    await client.query(
      "UPDATE users SET balance_egd = balance_egd - $1 WHERE id = $2",
      [amount, req.user_id]
    );

    const stakeRes = await client.query(
      "INSERT INTO stakings (user_id, package_id, staked_amount, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [
        req.user_id,
        package_id,
        amount,
        start_date.toISOString().split("T")[0],
        end_date.toISOString().split("T")[0],
      ]
    );

    await client.query("COMMIT");
    res.json({
      success: true,
      staking_id: stakeRes.rows[0].id,
      end_date: end_date.toISOString().split("T")[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
