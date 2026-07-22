import express from "express";
import { addComment, deleteComment, getAllBlogs, getAllComments, getBlogReactions, getSavedBlog, getSingleBlog, reactToBlog, saveBlog } from "../controllers/blog.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.get("/blog/all", getAllBlogs);
router.get("/blog/:id", getSingleBlog);
router.post("/comment/:id",isAuth,addComment);
router.get("/comment/:id",getAllComments);
router.delete("/comment/:commentId",isAuth,deleteComment);
router.post("/save/:blogid",isAuth,saveBlog)
router.get("/blog/saved/all",isAuth,getSavedBlog)
router.get("/reaction/:blogid", isAuth, getBlogReactions);
router.post("/reaction/:blogid", isAuth, reactToBlog);

export default router;
