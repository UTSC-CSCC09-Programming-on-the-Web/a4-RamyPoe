import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";

export const Token = sequelize.define(
  "Token",
  {
    tokenId: {
      type: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiryTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    issuedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false },
);
