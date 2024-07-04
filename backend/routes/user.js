const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const bcrypt = require("bcrypt");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db");

const app = express();
app.use(express.json());

const router = express.Router();
const salt = bcrypt.genSaltSync(10);

const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string().max(50),
  lastName: zod.string().max(50),
  password: zod.string().min(8),
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string().min(8),
});

const updateBody = zod.object({
  firstName: zod.string().max(50).optional(),
  lastName: zod.string().max(50).optional(),
  password: zod.string().min(8).optional(),
});

router.post("/signup", async function (req, res) {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({ error: "Invalid Inputs" });
    return;
  }

  const existingUser = await User.findOne({
    username: req.body.username,
  });
  if (existingUser) {
    res.status(411).json({ error: "Username already exists" });
    return;
  }

  const user = await User.create({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: await bcrypt.hash(req.body.password, salt),
  });

  const userId = user._id;

  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign({ userId }, JWT_SECRET);

  res.json({
    message: "User Created Successfully",
    token: token,
  });
});

router.post("/signin", async function (req, res) {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({ error: "Invalid Inputs" });
    return;
  }

  const user = await User.findOne({
    username: req.body.username,
  });

  if (!user) {
    res.status(411).json({ error: "Username does not exist" });
  } else {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET
    );

    res.json({
      token: token,
    });
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    res.status(411).json({ error: "Invalid Password" });
    return;
  }
});

router.put("/", authMiddleware, async function (req, res) {
  const { success } = updateBody.safeParse(req.body);
  if (!success) {
    res.status(411).json({ error: "Error while updating inputs" });
    return;
  }
  await User.updateOne({ _id: req.userId }, req.body);
  res.json({
    message: "User Updated Successfully",
  });
});

router.get("/bulk", authMiddleware, async function (req, res) {
  const filter = req.query.filter || "";

  const users = await User.find({
    $or: [
      {
        firstName: {
          $regex: filter,
          $options: "i",
        },
      },
      {
        lastName: {
          $regex: filter,
          $options: "i",
        },
      },
    ],
  });

  res.json({
    user: users.map((user) => ({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id,
    })),
  });
});

module.exports = router;
