import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import uploadFile from "../middleware/multer.js";
import { aiBlogResponse, aiDescriptionResponse, aiTitleResponse, createBlog, deleteBlog, updateBlog,uploadBlogContentImage, } from "../controllers/blog.js";

const router = express.Router();

router.post("/blog/new", isAuth, uploadFile, createBlog);
router.post("/blog/upload-image", isAuth, uploadFile, uploadBlogContentImage);
router.post("/blog/:id", isAuth, uploadFile, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
router.post("/ai/title",aiTitleResponse);
router.post("/ai/description",aiDescriptionResponse);
router.post("/ai/blog",aiBlogResponse);

export default router;
