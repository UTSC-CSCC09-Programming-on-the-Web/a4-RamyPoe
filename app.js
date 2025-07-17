import express from "express";
import bodyParser from "body-parser";
import { sequelize } from "./datasource.js";
import { imagesRouter, imagesSubRouter } from "./routers/images_router.js";
import {
  commentsSubRouter,
  commentsRouter,
} from "./routers/comments_router.js";
import { usersRouter } from "./routers/users_router.js";

export const app = express();
const PORT = 80;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}
app.use(express.static("static"));

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

// https://stackoverflow.com/questions/25260818/rest-with-express-js-nested-router
imagesRouter.use("/:imageId/comments", commentsSubRouter);
usersRouter.use("/:userId/images", imagesSubRouter);
app.use("/api/images", imagesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});


/* final catch-all route to index.html defined last */
app.get('/*', (req, res) => {
  res.sendFile('/index.html', { root: "static" });
})

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
