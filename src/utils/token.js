const jwt = require("jsonwebtoken");
const { SECRET_KEY, REFRESH_KEY } = require("../config");

const token = {
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user._id, //new objectid
      },
      SECRET_KEY,
      { expiresIn: "1d" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user._id,
      },
      REFRESH_KEY,
      { expiresIn: "1d" }
    );
  },
};

module.exports = token;
