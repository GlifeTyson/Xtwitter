const express = require("express");
const connectDb = require("./database");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

//4 routes
const userRoute = require("./routes/userRoute");
const postRoute = require("./routes/postRoute");

var bodyParser = require("body-parser");
const { SECRET_KEY } = require("./config");
const { generateRefreshToken } = require("./utils/token");
const requiredLogin = require("./middleware/requireLogin");
const withContext = require("./middleware/withContent");
const commentRoute = require("./routes/commentRoute");

async function run() {
  try {
    const { client, db, mongo } = await connectDb();

    const app = express();

    const addUser = async (req, res, next) => {
      // console.log("run addUser");
      const token = req.headers["x-token"];
      if (token) {
        try {
          const { id } = jwt.verify(token, SECRET_KEY);
          req.userId = id;
        } catch (err) {
          // const refreshToken = req.headers["x-refresh-token"];
          // const newTokens = await generateRefreshToken(user);
          // if (newTokens) {
          //   res.set("Access-Control-Expose-Headers", "x-token");
          //   res.set("x-token", newTokens);
          // }
          // req.user = newTokens.user;
        }
      }

      next();
    };

    app.use(addUser);

    app.use(withContext);

    app.use(express.static(__dirname + "/uploads"));
    app.use(cors());
    app.use(bodyParser.json()); // for parsing application/json
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(userRoute);
    app.use(requiredLogin, postRoute);
    app.use(requiredLogin, commentRoute);
    app.listen(3000, () => {
      console.log("Express Server running on http://localhost:3000");
    });
  } catch (error) {
    // Ensures that the client will close when you finish/error
    console.log(error);
  }
}
run().catch(console.dir);
