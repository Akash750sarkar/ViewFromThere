import { AuthenticatedRequest } from "../middleware/isAuth.js";
import { getCloudinaryPublicId } from "../utils/cloudinary.js";
import getBuffer from "../utils/dataUri.js";
import { sql } from "../utils/db.js";
import { invalidateChacheJob } from "../utils/rabbitmq.js";
import TryCatch from "../utils/TryCatch.js";
import cloudinary from "cloudinary";
import Groq from "groq-sdk";

export const createBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  if (!title || !description || !blogcontent || !category) {
    res.status(400).json({
      message: "title, description, blogcontent, and category are required",
    });
    return;
  }

  if (!req.user?._id) {
    res.status(401).json({
      message: "Invalid user in token",
    });
    return;
  }

  if (!file) {
    res.status(400).json({
      message: "No File to Upload",
    });
    return;
  }

  const fileBuffer = getBuffer(file);

  if (!fileBuffer || !fileBuffer.content) {
    res.status(400).json({
      message: "Failed to Generate Buffer",
    });
    return;
  }

  const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
    folder: "blogs",
  });

  const result =
    await sql`INSERT INTO blogs (title,description,image,blogcontent,category,author) VALUES (${title},${description},${cloud.secure_url},${blogcontent},${category},${req.user._id})  RETURNING *`;

    await invalidateChacheJob(["blog:*"]);

  res.json({
    message: "Blog Created",
    blog: result[0],
  });
});

// export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
//   const { id } = req.params;
//   const { title, description, blogcontent, category } = req.body;

//   const file = req.file;

//   const blog = await sql`SELECT* FROM blogs WHERE id = ${id}`;

//   if (!blog.length) {
//     res.status(404).json({
//       message: "No blog with this id",
//     });
//     return;
//   }

//   if (blog[0].author != req.user?._id) {
//     res.status(401).json({
//       message: "You are not author of this blog",
//     });
//     return;
//   }

//   let imageUrl = blog[0].image;
//   if (file) {
//     const fileBuffer = getBuffer(file);

//     if (!fileBuffer || !fileBuffer.content) {
//       res.status(400).json({
//         message: "Failed to Generate Buffer",
//       });
//       return;
//     }

//     const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
//       folder: "blogs",
//     });

//     imageUrl = cloud.secure_url;
//   }

//   const updatedBlog = await sql`UPDATE blogs SET 
//     title = ${title || blog[0].title},
//     description = ${description || blog[0].description},
//     image = ${imageUrl},
//     blogcontent = ${blogcontent || blog[0].blogcontent},
//     category = ${category || blog[0].category}

//     WHERE id = ${id}
//     RETURNING*
//   `;

//   await invalidateChacheJob(["blog:*" , `blog:${id}`]);

//   res.json({
//     message: "Blog Updated",
//     blog: updatedBlog[0],
//   });
// });


export const uploadBlogContentImage = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No File to Upload" });
      return;
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({ message: "Failed to Generate Buffer" });
      return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs/content",
    });

    res.json({
      url: cloud.secure_url,
    });
  },
);

export const updateBlog = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { title, description, blogcontent, category } = req.body;

  const file = req.file;

  const blog = await sql`SELECT* FROM blogs WHERE id = ${id}`;

  if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id",
    });
    return;
  }

  if (blog[0].author != req.user?._id) {
    res.status(401).json({
      message: "You are not author of this blog",
    });
    return;
  }

  let imageUrl = blog[0].image;
  if (file) {
    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      res.status(400).json({
        message: "Failed to Generate Buffer",
      });
      return;
    }

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
      folder: "blogs",
    });

    imageUrl = cloud.secure_url;

    // delete the old image from cloudinary, only after the new upload succeeds
    if (blog[0].image) {
      try {
        const oldPublicId = getCloudinaryPublicId(blog[0].image);
        if (oldPublicId) {
          await cloudinary.v2.uploader.destroy(oldPublicId);
        }
      } catch (err) {
        // don't fail the whole update if cleanup fails, just log it
        console.log("Failed to delete old cloudinary image:", err);
      }
    }
  }

  const updatedBlog = await sql`UPDATE blogs SET 
    title = ${title || blog[0].title},
    description = ${description || blog[0].description},
    image = ${imageUrl},
    blogcontent = ${blogcontent || blog[0].blogcontent},
    category = ${category || blog[0].category}

    WHERE id = ${id}
    RETURNING*
  `;

  await invalidateChacheJob(["blog:*" , `blog:${id}`]);

  res.json({
    message: "Blog Updated",
    blog: updatedBlog[0],
  });
});

// export const deleteBlog = TryCatch(async(req:AuthenticatedRequest,res)=>{
//   const blog = await sql`SELECT * FROM blogs WHERE id = ${req.params.id}`;

//    if (!blog.length) {
//     res.status(404).json({
//       message: "No blog with this id",
//     });
//     return;
//   }

//   if (blog[0].author != req.user?._id) {
//     res.status(401).json({
//       message: "You are not author of this blog",
//     });
//     return;
//   }

//   await sql`DELETE FROM savedblogs WHERE blogid = ${req.params.id}`;
//   await sql`DELETE FROM comments WHERE blogid = ${req.params.id}`;
//   await sql`DELETE FROM blogs WHERE id = ${req.params.id}`;

//   await invalidateChacheJob(["blog:*" , `blog:${req.params.id}`]);

//   res.json({
//     message:"Blog Deleted",
//   })

// })

export const deleteBlog = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const blog = await sql`SELECT * FROM blogs WHERE id = ${req.params.id}`;

   if (!blog.length) {
    res.status(404).json({
      message: "No blog with this id",
    });
    return;
  }

  if (blog[0].author != req.user?._id) {
    res.status(401).json({
      message: "You are not author of this blog",
    });
    return;
  }

  // delete image from cloudinary
  if (blog[0].image) {
    try {
      const publicId = getCloudinaryPublicId(blog[0].image);
      if (publicId) {
        await cloudinary.v2.uploader.destroy(publicId);
      }
    } catch (err) {
      console.log("Failed to delete cloudinary image:", err);
    }
  }

  await sql`DELETE FROM savedblogs WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM comments WHERE blogid = ${req.params.id}`;
  await sql`DELETE FROM blogs WHERE id = ${req.params.id}`;

  await invalidateChacheJob(["blog:*" , `blog:${req.params.id}`]);

  res.json({
    message:"Blog Deleted",
  })
})

export const aiTitleResponse = async(req: any, res: any) => {
  try {
    const {text} = req.body;

    const prompt = `Correct the grammar of the following blog title and return only the corrected title without any additional text, formatting, or symbols: "${text}"`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    let rawtext = response.choices[0]?.message?.content || "";
    let result = rawtext.replace(/\*\*/g, "").replace(/[\r\n]+/g, "").replace(/[*_`~]/g, "").trim();

    res.json(result);
  } catch(err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const aiDescriptionResponse = async(req: any, res: any) => {
  try {
    const {title,description} = req.body;

   const prompt = description === "" ? `Generate only one short blog description based on
this title: "${title}". Your response must be in one to two sentence, strictly under 30 words, with no options, no
greetings, and no extra text. Do not explain. Do not say 'here is'. Just return the description only.` : `Fix the
grammar in the following blog description and return only the corrected sentence. Do not add anything else:
"${description}"`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    let rawtext = response.choices[0]?.message?.content || "";
    let result = rawtext.replace(/\*\*/g, "").replace(/[\r\n]+/g, "").replace(/[*_`~]/g, "").trim();

    res.json(result);
  } catch(err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const aiBlogResponse = async(req: any, res: any) => {
  try {
    const {blog} = req.body;
    
    if(!blog){
      res.status(400).json({ message: "please provide blog" });
      return;
    }

    const prompt = `You will act as a grammar correction engine. I will provide you with blog content in rich HTML format (from Jodit Editor). Do not generate or rewrite the content with new ideas. Only correct grammatical, punctuation, and spelling errors while preserving all HTML tags and formatting. Maintain inline styles, image tags, line breaks, and structural tags exactly as they are. Return the full corrected HTML string as output.\n\n${blog}`;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
    });

    let rawtext = response.choices[0]?.message?.content || "";

    const cleanedHtml = rawtext
      .replace(/^(html|```html```)\n?/i, "")
      .replace(/```$/i, "")
      .replace(/\*\*/g, "")
      .replace(/[\r\n]+/g, "")
      .replace(/[*_`~]/g, "")
      .trim();

    res.status(200).json({ html: cleanedHtml });
  } catch(err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};