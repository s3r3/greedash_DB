const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const authController = require("../controllers/authController");
const stakingController = require("../controllers/stakingController");
const rewardsController = require("../controllers/rewardsController");
const feeController = require("../controllers/feeController");
const unlockController = require("../controllers/unlockController");

// Auth routes
router.post("/login", authController.login);

// Staking routes
router.post("/purchase-stake", authenticate, stakingController.purchaseStake);

// Rewards routes
router.get("/rewards/:user_id", authenticate, rewardsController.getRewards);
router.post("/swap-rewards", authenticate, rewardsController.swapRewards);

// Fee routes
router.post("/add-fee", feeController.addFee);

// Unlock routes
router.post(
  "/unlock-stake/:staking_id",
  authenticate,
  unlockController.unlockStake
);

module.exports = router;
