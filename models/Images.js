import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Comment } from "./Comments.js";

export const Image = sequelize.define(
  "Image",
  {
    imageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    picture: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    postedDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { timestamps: false },
);

Image.hasMany(Comment, {
  foreignKey: "imageId",
});
Comment.belongsTo(Image, {
  foreignKey: "imageId",
});
