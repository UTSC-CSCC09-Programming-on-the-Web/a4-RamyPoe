import bcrypt from "bcrypt";
import { Token } from "../models/Tokens.js";
import { User } from "../models/Users.js";

const unauthorized = (res) => {
  return res.status(401).json({ error: "Not Authenticated" });
};

export const checkAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const rawToken = authHeader && authHeader.split(" ")[1];
    if (!rawToken) {
      return unauthorized(res);
    }

    const [id, token] = atob(rawToken).split("%");
    const tokenEntity = await Token.findByPk(id, {
      include: {
        model: User,
        required: true,
      },
    });

    if (tokenEntity === null) {
      return unauthorized(res);
    }
    if (
      !bcrypt.compareSync(token, tokenEntity.tokenHash) ||
      tokenEntity.issuedDate.getTime() + tokenEntity.expiryTime * 1000 <
        Date.now()
    ) {
      await tokenEntity.destroy();
      return unauthorized(res);
    }

    console.log("REQUEST AUTH", typeof tokenEntity.userId);
    req.auth = {
      userId: tokenEntity.userId,
      username: tokenEntity.User.username,
      tokenId: tokenEntity.tokenId,
    };
    next();
  } catch (error) {
    return unauthorized(res);
  }
};
