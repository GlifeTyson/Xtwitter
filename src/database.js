const { MongoClient, ServerApiVersion } = require("mongodb");

const connectDb = async () => {
  const DB_NAME = process.env.DB_NAME;
  const DB_URI = process.env.DB_URI;

  // // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(DB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  // Send a ping to confirm a successful connection
  // await client.db("admin").command({ ping: 1 });
  console.log("Connected to MongoDB");

  const db = client.db(DB_NAME);
  const mongo = {
    User: db.collection("users"),
    Post: db.collection("posts"),
    Comment: db.collection("comments"),
  };
  return {
    client,
    db,
    mongo,
  };
};

module.exports = connectDb;
