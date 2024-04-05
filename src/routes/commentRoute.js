const Router = require("express").Router;
const commentController = require("../controllers/commentController");

const commentRoute = Router();

commentRoute.post("/api/comments", commentController.create);
// userRoute.post("/api/users/sign-in", commentController.signIn);

module.exports = commentRoute;
