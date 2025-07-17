import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Comment } from "./Comments.js";
import { Image } from "./Images.js";
import { Token } from "./Tokens.js";

export const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false },
);

User.hasMany(Image, {
  foreignKey: "userId",
});
Image.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(Comment, {
  foreignKey: "userId",
});
Comment.belongsTo(User, {
  foreignKey: "userId",
});

User.hasMany(Token, {
  foreignKey: "userId",
});
Token.belongsTo(User, {
  foreignKey: "userId",
});
