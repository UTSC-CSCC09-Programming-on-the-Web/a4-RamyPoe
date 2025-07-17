import { Router } from "express";
import { checkAuth } from "../middleware/auth.js";
import { Image } from "../models/Images.js";
import { Comment } from "../models/Comments.js";
import { User } from "../models/Users.js";
import path from "path";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
export const imagesRouter = Router();
export const imagesSubRouter = Router({ mergeParams: true });

const validateParamNumber = (res, paramName, param) => {
  if (!param) {
    return res.status(400).json({ error: `Field ${paramName} is required` });
  }
  if (isNaN(param)) {
    return res
      .status(422)
      .json({ error: `Invalid ${paramName} parameter, must be a number` });
  }
};

imagesRouter.post(
  "/",
  checkAuth,
  upload.single("picture"),
  async (req, res) => {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Field title is required" });
    }

    const userId = req.auth.userId;
    const image = await Image.create({ title, userId, picture: req.file });
    delete image.picture;
    res.json(image);
  },
);

imagesRouter.delete("/:imageId", checkAuth, async (req, res) => {
  const imageId = req.params.imageId;
  validateParamNumber(res, "imageId", imageId);

  const image = await Image.findByPk(imageId);
  if (!image) {
    return res
      .status(404)
      .json({ error: `Image with imageId=${imageId} not found.` });
  }

  if (image.userId !== req.auth.userId) {
    return res
      .status(403)
      .json({ error: "Cannot delete image from different gallery" });
  }

  await Comment.destroy({ where: { imageId } });
  await image.destroy();
  delete image.picture;
  res.json(image);
});

imagesRouter.get("/:imageId", async (req, res) => {
  const imageId = req.params.imageId;
  validateParamNumber(res, "imageId", imageId);

  const image = await Image.findByPk(imageId);
  if (!image) {
    return res
      .status(404)
      .json({ error: `Image with imageId=${imageId} not found.` });
  }
  delete image.picture;
  res.json(image);
});

imagesRouter.get("/:imageId/picture", async (req, res) => {
  const { imageId } = req.params;
  validateParamNumber(res, "imageId", imageId);

  const image = await Image.findByPk(imageId);
  if (!image) {
    return res
      .status(404)
      .json({ error: `Image with imageId=${imageId} not found.` });
  }
  res.setHeader("Content-Type", image.picture.mimetype);
  res.sendFile(image.picture.path, { root: path.resolve() });
});

imagesSubRouter.get("/", async (req, res) => {
  const { userId } = req.params;
  validateParamNumber(res, "userId", userId);
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  if ((req.query.page && page < 0) || (req.query.limit && limit <= 0)) {
    return res
      .status(422)
      .json({ error: "Invalid page and/or limit parameter." });
  }

  const user = await User.findByPk(userId);
  if (user === null) {
    return res
      .status(404)
      .json({ error: `User with userId=${userId} not found.` });
  }

  const images = await Image.findAll({
    attributes: { exclude: ["picture"] },
    offset: page * limit,
    limit: limit,
    order: [["postedDate", "DESC"]],
    where: { userId },
  });
  const total = await Image.count({ where: { userId } });

  res.json({ total, images });
});
