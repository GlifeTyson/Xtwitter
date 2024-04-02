const connectDb = require("../database");
const userValidator = require("../validator/userValidator");
const { hashPassword, compareSync } = require("../utils/index");
const bcrypt = require("bcrypt");
const omit = require("lodash/omit");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/token");

const userController = {
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const usersCursor = mongo.User.find({ deleteAt: null });

      usersCursor.sort({ createdAt: -1 });
      usersCursor.skip(0);
      usersCursor.limit(10);
      const users = await usersCursor.toArray();
      res.json(users).status(200);
    } catch (error) {
      console.log(error);
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
    // res.json([]).status(200);
  },
  view: async (req, res) => {
    try {
      const { client, db } = await connectDb();
      const collectionUser = db.collection("user");
      const { id } = req.params;
      const currentUser = await collectionUser.findOne({ _id: id });
      res.json(currentUser);
    } catch (error) {
      console.log(error);
    }
  },

  create: async (req, res) => {
    const { mongo } = req.context || {};
    const args = req.body;
    // console.log(args);
    const { error } = userValidator.validate(req.body);
    // console.log(value);
    if (error) {
      return res.json({ message: "Fail at validation" }).status(400);
    }
    if (password !== cPassword) {
      return res.json({ message: "Password does not match" });
    }
    let nameCheck = await mongo.User.findOne({
      name: args.name,
      deletedAt: null,
    });
    if (nameCheck) {
      return res.json({ message: "Username have been registed" }).status(400);
    }
    let emailCheck = await mongo.User.findOne({
      email: args.email,
      deletedAt: null,
    });
    if (emailCheck) {
      return res.json({ message: "Email have been registed" }).status(400);
    }

    // res.send("Good at validation").status(200);
    const newUser = {
      _id: new ObjectId(),
      name: args.name,
      email: args.email,
      password: hashPassword(args.password),
      createdAt: Date.now(),
      active: true,
    };

    await mongo.User.insertOne(newUser);
    if (newUser.active == false) {
      return res
        .json({
          message: "Go to Mail to active user",
          data: omit(newUser, ["_id", "password"]),
        })
        .status(200);
    } else {
      return res
        .json({
          message: "Created success",
          data: omit(newUser, ["_id", "password"]),
        })
        .status(200);
    }
  },
  update: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { name, password, cPassword } = req.body;
      const findUser = await mongo.User.findOne({ name: req.body.name });
      if (!findUser) {
        return res.json({ message: "User not found" }).status(400);
      }
      if (password != cPassword) {
        return res.json({ message: "Password not match" }).status(422);
      }
      await mongo.User.updateOne(
        { name: name },
        {
          $set: { password: hashPassword(password), updatedAt: Date.now() },
        }
      );
      return res.json({ message: "success" }).status(200);
    } catch (error) {
      res.json({ message: error.message }).status(400);
    }
  },
  delete: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      //parse id bc find query _id need ObjectID type to compare not String
      const parseId = new mongodb.ObjectId(id);
      const userFound = mongo.User.find({ _id: parseId });
      const user = await userFound.toArray();
      if (user.length == 0) {
        res
          .json({
            message: "Not found to delete",
          })
          .status(422);
      }

      await mongo.User.updateOne(
        { _id: parseId },
        {
          $set: { deletedAt: Date.now() },
        }
      );
      //   //   await mongo.Diary.findOneAndDelete({ _id: parseId });
      res.json({ message: "Soft Deleted successfully" }).status(200);
    } catch (error) {
      return res.json({ message: error.message }).status(422);
      // res.json([]).status(200);
    }
  },

  signIn: async (req, res) => {
    const { mongo } = req.context || {};
    const { email, password } = req.body;
    let userLogin = await mongo.User.findOne({
      email: email,
      deletedAt: null,
    });
    if (!userLogin) {
      return res.json({ message: "User not found" }).status(422);
    }
    const validPass = compareSync(password, userLogin.password);
    if (!validPass) {
      return res.json({ message: "Wrong password" }).status(400);
    }
    res.cookie("Bearer", generateAccessToken(userLogin));
    return res
      .json({
        message: "Login Success",
        data: {
          email: userLogin.email,
          _id: userLogin._id,
          accessToken: generateAccessToken(userLogin),
          refreshToken: generateRefreshToken(userLogin),
        },
      })
      .status(200);
  },
};

module.exports = userController;
