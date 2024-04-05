const { ObjectId } = require("mongodb");

const commentController = {
  list: async () => {},
  view: async () => {},
  create: async () => {
    try {
      const { mongo, user } = req.context || {};
      const { content, postId, replyToCommentId } = req.body;
      if (content.length === 0) {
        return res.status(400).json({ message: "Fill in content" });
      }
      if (postId.length === 0) {
        return res.status(400).json({ message: "Post ID cant be null" });
      }
      const commentCreate = {
        _id: new ObjectId(),
        content: content,
        userId: user._id,
        postId: new ObjectId(postId),
        createdAt: Date.now(),
        deletedAt: null,
        updatedAt: null,
        replyToCommentId: replyToCommentId
          ? new ObjectId(replyToCommentId)
          : null,
      };

      await mongo.Comment.insertOne(commentCreate);
    } catch (error) {
      res.status(422).json({ message: error.message });
    }
  },
  update: async () => {},
  delete: async () => {},
};

module.exports = commentController;
