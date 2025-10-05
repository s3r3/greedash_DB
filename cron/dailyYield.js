// cron/dailyYield.js
const cron = require("node-cron");
const pool = require("../config/db");

const dailyYieldJob = cron.schedule("0 0 * * *", async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Calculate Daily Yields for Active Stakings
    const stakings = await client.query(
      `SELECT s.id, s.staked_amount, p.daily_yield
       FROM stakings s
       JOIN packages p ON s.package_id = p.id
       WHERE s.status = 'active'`
    );
    const today = new Date().toISOString().split("T")[0];

    for (const stake of stakings.rows) {
      const amount = stake.staked_amount * stake.daily_yield;
      await client.query(
        "INSERT INTO rewards (staking_id, date, amount) VALUES ($1, $2, $3)",
        [stake.id, today, amount]
      );
    }

    // 2. Distribute Revenue Pool
    const poolRes = await client.query(
      "SELECT total_fee FROM revenue_pool WHERE date = $1 AND distributed = FALSE",
      [today]
    );

    if (poolRes.rows.length > 0) {
      const total_fee = poolRes.rows[0].total_fee;
      const total_staked =
        (await client.query("SELECT get_total_staked()"))?.rows[0]
          ?.get_total_staked || 0;

      if (total_staked > 0) {
        for (const stake of stakings.rows) {
          const share = (stake.staked_amount / total_staked) * total_fee;
          await client.query(
            "INSERT INTO rewards (staking_id, date, amount) VALUES ($1, $2, $3)",
            [stake.id, today, share]
          );
        }
      }

      await client.query(
        "UPDATE revenue_pool SET distributed = TRUE WHERE date = $1",
        [today]
      );
    }

    await client.query("COMMIT");
    console.log("Daily cron job completed");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Cron job error:", err.message);
  } finally {
    client.release();
  }
});

module.exports = dailyYieldJob;
