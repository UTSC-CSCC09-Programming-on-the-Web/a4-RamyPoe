import bcrypt from "bcrypt";
import { Router } from "express";
import { User } from "../models/Users.js";
import { Token } from "../models/Tokens.js";
import { checkAuth } from "../middleware/auth.js";
import crypto from "crypto";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = 60 * 60 * 2; // 2 Hours
export const usersRouter = Router();

usersRouter.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Fields username and password are required." });
  }
  const exists = await User.findOne({ where: { username } });
  if (exists) {
    return res
      .status(422)
      .json({ error: "Username already taken! Try again." });
  }

  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const passwordHash = bcrypt.hashSync(password, salt);
  const user = await User.create({ username, password: passwordHash });
  res.json({ userId: user.userId, username: user.username });
});

usersRouter.post("/token", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Fields username and password are required." });
  }
  const user = await User.findOne({ where: { username } });
  if (user === null ? true : !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Incorrect username or password." });
  }

  // Generate token
  let uuid = crypto.randomUUID();
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const tokenHash = bcrypt.hashSync(uuid, salt);
  let token = await Token.create({
    tokenHash,
    userId: user.userId,
    expiryTime: TOKEN_EXPIRY,
  });
  res.json({
    token: btoa(`${token.tokenId}%${uuid}`),
    userId: user.userId,
    issuedDate: token.issuedDate,
    expiryTime: token.expiryTime,
  });
});

usersRouter.post("/revoke", checkAuth, async (req, res) => {
  const tokenEntity = await Token.findByPk(req.auth.tokenId);
  if (tokenEntity !== null) {
    await tokenEntity.destroy();
  }
  res.json({ msg: "Token has been revoked." });
});

usersRouter.get("/", async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  if ((req.query.page && page < 0) || (req.query.limit && limit <= 0)) {
    return res
      .status(422)
      .json({ error: "Invalid page and/or limit parameter." });
  }

  const users = await User.findAll({
    attributes: ["userId", "username"],
    offset: page * limit,
    limit: limit,
    order: [["createdDate", "DESC"]],
  });
  const total = await User.count();

  res.json({ total, users });
});
