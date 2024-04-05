const Router = require("express").Router;
const postController = require("../controllers/postController");

const postRoute = Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Hàm kiểm tra tùy chỉnh chỉ chấp nhận các tệp có phần mở rộng là .jpeg hoặc .jpg
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG/PNG files are allowed"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

postRoute.get("/api/posts", postController.list);
postRoute.get("/api/posts/:id", postController.view);
postRoute.post("/api/posts", upload.single("image"), postController.create);
postRoute.patch("/api/posts/:id", postController.update);
postRoute.delete("/api/posts/:id", postController.delete);

module.exports = postRoute;
