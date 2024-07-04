const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account, User } = require("../db");
const mongoose = require("mongoose");
const zod = require("zod");

const router = express.Router();

const transferBody = zod.object({
  amount: zod.number().min(1),
  to: zod.string(),
});

router.get("/balance", authMiddleware, async function (req, res) {
  const account = await Account.findOne({
    userId: req.userId,
  });

  res.json({
    balance: account.balance,
  });
});

router.post("/transfer", authMiddleware, async function (req, res) {
  const session = await mongoose.startSession();

  session.startTransaction();

  const { success } = transferBody.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      error: "Invalid amount",
    });
  }

  const { amount, to } = req.body;

  const account = await Account.findOne({ userId: req.userId }).session(
    session
  );

  if (!account || account.balance < amount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Insufficient balance",
    });
  }

  const toAccount = await Account.findOne({ userId: to }).session(session);

  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid account",
    });
  }

  await Account.updateOne(
    {
      userId: req.userId,
    },
    {
      $inc: { balance: -amount },
    }
  ).session(session);

  await Account.updateOne(
    {
      userId: to,
    },
    {
      $inc: { balance: amount },
    }
  ).session(session);

  await session.commitTransaction();

  const recipient = await User.findById(to);
  res.json({
    message: "Transfer successful",
  });
});

module.exports = router;
