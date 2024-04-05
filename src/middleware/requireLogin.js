const requiredLogin = (req, res, next) => {
  // console.log(req);
  // console.log("run requiredLogin");
  const { user } = req.context || {};
  if (!user) {
    return res
      .json({
        message: "Unauthorized",
      })
      .status(401);
  }
  next();
};

module.exports = requiredLogin;
