import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { redisClient } from "../server.js";
import { sql } from "../utils/db";
import TryCatch from "../utils/TryCatch";
import axios from "axios";

// export const getAllBlogs = TryCatch(async (req, res) => {
//   const { searchQuery = "", category = "" } = req.query;

//   const cacheKey = `blog:${searchQuery}:${category}`;

//   const cached = await redisClient.get(cacheKey);

//   if (cached) {
//     console.log("Serving from Redis cache");
//     res.json(JSON.parse(cached));
//     return;
//   }

//   let blogs;

//   if (searchQuery && category) {
//     blogs =
//       await sql`SELECT* FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) AND category=${category} ORDER BY create_at DESC`;
//   } else if (searchQuery) {
//     blogs =
//       await sql`SELECT* FROM blogs WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"}) ORDER BY create_at DESC`;
//   } else if (category) {
//     blogs =
//       await sql`SELECT* FROM blogs WHERE category=${category} ORDER BY create_at DESC`;
//   } else {
//     blogs = await sql`SELECT* FROM blogs ORDER BY create_at DESC`;
//   }

//   console.log("Serving from db");

//   await redisClient.set(cacheKey, JSON.stringify(blogs), { EX: 3600 });

//   res.json(blogs);
// });

export const getAllBlogs = TryCatch(async (req, res) => {
  const { searchQuery = "", category = "", page = "1", limit = "12" } = req.query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const offset = (pageNumber - 1) * limitNumber;

  const cacheKey = `blog:${searchQuery}:${category}:page:${pageNumber}:limit:${limitNumber}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    res.json(JSON.parse(cached));
    return;
  }

  let blogs;
  let totalResult;

  if (searchQuery && category) {
    blogs = await sql`
      SELECT * FROM blogs
      WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})
      AND category = ${category}
      ORDER BY create_at DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    totalResult = await sql`
      SELECT COUNT(*) FROM blogs
      WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})
      AND category = ${category}
    `;
  } else if (searchQuery) {
    blogs = await sql`
      SELECT * FROM blogs
      WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})
      ORDER BY create_at DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    totalResult = await sql`
      SELECT COUNT(*) FROM blogs
      WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})
    `;
  } else if (category) {
    blogs = await sql`
      SELECT * FROM blogs
      WHERE category = ${category}
      ORDER BY create_at DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    totalResult = await sql`
      SELECT COUNT(*) FROM blogs
      WHERE category = ${category}
    `;
  } else {
    blogs = await sql`
      SELECT * FROM blogs
      ORDER BY create_at DESC
      LIMIT ${limitNumber}
      OFFSET ${offset}
    `;

    totalResult = await sql`
      SELECT COUNT(*) FROM blogs
    `;
  }

  const totalBlogs = Number(totalResult[0].count);
  const totalPages = Math.ceil(totalBlogs / limitNumber);

  const response = {
    blogs,
    page: pageNumber,
    limit: limitNumber,
    totalBlogs,
    totalPages,
  };

  await redisClient.set(cacheKey, JSON.stringify(response), { EX: 3600 });

  res.json(response);
});

export const getSingleBlog = TryCatch(async (req, res) => {
  const blogid = req.params.id;

  const cacheKey = `blog:${blogid}`;

  const cached = await redisClient.get(cacheKey);

  if (cached) {
    console.log("Serving single blog from Redis cache");
    res.json(JSON.parse(cached));
    return;
  }

  const blog = await sql`SELECT * FROM blogs WHERE id = ${blogid}`;

  if(blog.length === 0)
  {
    res.status(404).json({
      message:"No blog with this id",
    })
    return;
  }

  const { data } = await axios.get(
    `${process.env.USER_SERVICE}/api/v1/user/${blog[0].author}`,
  );

  const responseData={ blog: blog[0], author: data }

  await redisClient.set(cacheKey,JSON.stringify(responseData),{EX:3600});

  res.json(responseData);
});


export const addComment = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const {id: blogid} = req.params;
  const {comment} = req.body;

  await sql`INSERT INTO comments(comment, blogid, userid, username) VALUES (${comment},${blogid},${req.user?._id},${req.user?.name}) RETURNING *`

  res.json({
    message:"Comment Added",
  })
})

export const getAllComments = TryCatch(async(req,res)=>{
  const {id} = req.params

  const comments = await sql`SELECT * FROM comments WHERE blogid=${id} ORDER BY create_at DESC`;

  res.json(comments);

})

export const deleteComment = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const {commentId} = req.params

  const comment = await sql`SELECT * FROM comments WHERE id=${commentId}`
  if (comment.length === 0) {
  res.status(404).json({ message: "Comment not found" });
  return;
}
  if(comment[0].userid!==req.user?._id)
  {
    res.status(401).json({
      message:"you are not owner of this comment",
    });
    return;
  }
  await sql`DELETE FROM comments WHERE id=${commentId}`
  res.json({
    message:"Comment Deleted",
  })
})

export const saveBlog = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const {blogid}=req.params;
  const userid = req.user?._id

  if(!blogid || !userid){
    res.status(400).json({
      message:"Misisng blog id or userid",
    })
    return ;
  }
  const existing = await sql`SELECT* FROM savedblogs WHERE userid=${userid} AND blogid=${blogid}`;
  
  if(existing.length===0){
    await sql`INSERT INTO savedblogs (blogid,userid) VALUES (${blogid},${userid})`;
    res.json({
    message:"Blog Saved",
  })
  return;
  }else{
    await sql`DELETE FROM savedblogs WHERE userid = ${userid} AND blogid=${blogid}`;
    res.json({
    message:"Blog Unsaved",
  })
  return;
  }
})

export const getSavedBlog = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const blogs = await sql`SELECT * FROM savedblogs WHERE userid = ${req.user?._id}`;
  res.json(blogs);
})

