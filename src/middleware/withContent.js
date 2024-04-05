const { ObjectId } = require("mongodb");
const connectDb = require("../database");

const withContext = async (req, res, next) => {
  const { db, mongo } = await connectDb();
  const userId = req.userId;
  const user = userId
    ? await mongo.User.findOne({
        _id: new ObjectId(userId),
        deletedAt: null,
      })
    : null;
  req.context = {
    db,
    mongo,
    user,
  };
  next();
};

module.exports = withContext;
