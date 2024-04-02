const { ObjectId } = require("mongodb");
const Joi = require("joi");
const schema = Joi.object({
  offset: Joi.number().min(0),
  limit: Joi.number().positive(),
  orderBy: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]+_(ASC|DESC)")),
});
const postController = {
  // GET /api/posts?offset=0&limit=20&orderBy=createdAt_DESC&filter={"userId":"66027325cfb5c042462d7d43"}
  list: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { offset, limit, orderBy, filter } = req.query;
      const filterObj = JSON.parse(filter || "{}");

      //validate with joi
      const { error } = schema.validate({
        offset,
        limit,
        orderBy,
      });
      // console.log(error);
      if (error) {
        //
        return res.json({ message: error });
      }
      //check if userId user put in is ObjectID ?
      if (!ObjectId.isValid(filterObj.userId)) {
        //
        return console.log("filterObj.userId is not valid");
      }
      //find with filter
      const userId = new ObjectId(filterObj.userId);
      const postCursor = await mongo.Post.find({
        userId: userId,
        deletedAt: null,
      });
      const [field, direction] = orderBy.split("_");
      postCursor.sort({ [field]: direction === "DESC" ? -1 : 1 });
      postCursor.skip(parseInt(offset));
      postCursor.limit(Math.min(limit, 1000));
      const posts = await postCursor.toArray();

      res.json({ message: "Get posts success", data: { posts } });
    } catch (error) {
      res
        .json({
          message: error.message,
        })
        .status(422);
    }
  },
  //GET /api/posts/:id
  view: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      const findPost = await mongo.Post.findOne({ _id: new ObjectId(id) });
      res.status(200).json({ data: findPost });
    } catch (error) {
      res.status(422).json({ message: error.message });
    }
  },

  //POST /api/posts
  create: async (req, res) => {
    try {
      const { mongo, user } = req.context || {};
      const { content, imageUrl } = req.body;
      if (content.length == 0) {
        return res.status(400).json({ message: "Fill in content" });
      }
      const postCreate = {
        _id: new ObjectId(),
        userId: user._id,
        content: content,
        imageUrl: imageUrl ? imageUrl : null,
        createdAt: Date.now(),
        deletedAt: null,
        updatedAt: null,
      };

      await mongo.Post.insertOne(postCreate);
      res
        .status(200)
        .json({ message: "Created Post Success", data: postCreate });
    } catch (error) {
      res.json({ message: error.message }).status(422);
    }
  },

  //PATCH /api/posts/:id
  update: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { content } = req.body;
      const { id } = req.params;
      const parseId = new ObjectId(id);
      if (!content || !id) {
        return res
          .status(400)
          .json({ message: "Fill in content or not found id" });
      }
      const post = await mongo.Post.updateOne(
        { _id: parseId },
        {
          $set: { content: content, updatedAt: Date.now() },
        }
      );
      const postUpdated = await mongo.Post.findOne({ _id: parseId });
      res.status(200).json({ data: postUpdated });
    } catch (error) {
      res.status(422).json({ message: error.message });
    }
  },

  //DELETE /api/posts/:id
  delete: async (req, res) => {
    try {
      const { mongo } = req.context || {};
      const { id } = req.params;
      const parseId = new ObjectId(id);
      if (!id) {
        return res.status(400).json({ message: "Note id ?" });
      }
      await mongo.Post.findOneAndUpdate(
        { _id: parseId },
        {
          $set: { deletedAt: Date.now() },
        }
      );
      const postUpdated = await mongo.Post.findOne({ _id: parseId });
      res.status(200).json({ data: postUpdated });
    } catch (error) {
      res.status(422).json({ message: error.message });
    }
  },
};

module.exports = postController;
