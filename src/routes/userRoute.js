const Router = require("express").Router;
const userController = require("../controllers/userController");

const userRoute = Router();

userRoute.get("/api/users/me", userController.me);
userRoute.post("/api/users", userController.create); // sign up
userRoute.post("/api/users/sign-in", userController.signIn); // sign in

module.exports = userRoute;
