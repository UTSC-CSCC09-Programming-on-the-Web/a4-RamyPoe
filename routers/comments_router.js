import { Router } from "express";
import { Comment } from "../models/Comments.js";
import { Image } from "../models/Images.js";
import { checkAuth } from "../middleware/auth.js";
import { User } from "../models/Users.js";

export const commentsRouter = Router();
export const commentsSubRouter = Router({ mergeParams: true });

commentsRouter.delete("/:commentId", checkAuth, async (req, res) => {
  const commentId = req.params.commentId;
  if (!commentId) {
    return res.status(400).json({ error: `Field commentId is required` });
  }
  if (isNaN(commentId)) {
    return res
      .status(422)
      .json({ error: "Invalid commentId parameter, must be a number" });
  }

  // Nested to include image, and image's user
  const comment = await Comment.findByPk(commentId, {
    include: { all: true, nested: true },
  });
  if (!comment) {
    return res
      .status(404)
      .json({ error: `Comment with commentId=${imageId}) not found.` });
  }

  if (
    comment.userId !== req.auth.userId &&
    comment.Image.userId !== req.auth.userId
  ) {
    return res.status(403).json({
      error:
        "Cannot delete comment from other uses in gallery that's not owned",
    });
  }

  await comment.destroy();
  res.json(comment);
});

commentsSubRouter.post("/", checkAuth, async (req, res) => {
  const { content } = req.body;
  const imageId = req.params.imageId;
  if (!imageId || !content) {
    return res
      .status(400)
      .json({ error: "Fields imageId, author, and content are required." });
  }
  if (isNaN(imageId)) {
    return res
      .status(422)
      .json({ error: "Invalid imageId parameter, must be a number" });
  }
  const userId = req.auth.userId;

  const image = await Image.findByPk(imageId);
  if (!image) {
    return res
      .status(404)
      .json({ error: `Image with imageId=${imageId} does not exist.` });
  }
  const comment = await Comment.create({ imageId, userId, content });
  res.json(comment);
});

commentsSubRouter.get("/", checkAuth, async (req, res) => {
  const imageId = req.params.imageId;
  if (isNaN(imageId)) {
    return res
      .status(422)
      .json({ error: "Invalid imageId parameter, must be a number" });
  }
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  if ((req.query.page && page < 0) || (req.query.limit && limit <= 0)) {
    return res
      .status(400)
      .json({ error: "Invalid page and/or limit parameter." });
  }

  const image = await Image.findByPk(imageId);
  if (!image) {
    return res
      .status(404)
      .json({ error: `Image with imageId=${imageId} does not exist.` });
  }
  const commentsRaw = await Comment.findAll({
    where: { imageId },
    include: {
      model: User,
      attributes: ["username"],
    },
    offset: page * limit,
    limit: limit,
    order: [["postedDate", "DESC"]],
  });
  const total = await Comment.count({ where: { imageId } });

  const comments = commentsRaw.map((comment) => {
    const c = comment.toJSON();
    c.username = c.User?.username;
    delete c.User;
    return c;
  });

  res.json({ total, comments });
});
