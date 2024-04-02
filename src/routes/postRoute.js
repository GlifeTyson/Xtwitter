const Router = require("express").Router;
const postController = require("../controllers/postController");

const postRoute = Router();

postRoute.get("/api/posts", postController.list);
postRoute.get("/api/posts/:id", postController.view);
postRoute.post("/api/posts", postController.create);
postRoute.patch("/api/posts/:id", postController.update);
postRoute.delete("/api/posts/:id", postController.delete);

module.exports = postRoute;
