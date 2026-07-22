"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  author_service,
  Blog,
  blog_service,
  useAppData,
  user_service,
  User,
} from "@/context/AppContext";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Bookmark,
  Edit,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Trash2Icon,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Comment {
  id: string;
  userid: string;
  comment: string;
  create_at: string;
  username: string;
}

const BlogPage = () => {
  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs } = useAppData();
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const [loading, setLoading] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(
    null,
  );

  async function fetchComment() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${blog_service}/api/v1/comment/${id}`);

      setComments(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComment();
  }, [id]);

  const [comment, setComment] = useState("");

  async function addCommet() {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${blog_service}/api/v1/comment/${id}`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(data.message);
      setComment("");
      fetchComment();
    } catch (error) {
      toast.error("Problem while adding comment");
    } finally {
      setLoading(false);
    }
  }

  async function fetchReactions() {
    try {
      const token = Cookies.get("token");

      if (!token) {
        return;
      }

      const { data } = await axios.get(
        `${blog_service}/api/v1/reaction/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLikes(data.likes);
      setDislikes(data.dislikes);
      setUserReaction(data.userReaction);
    } catch (error) {
      console.log(error);
    }
  }

  async function reactToBlog(reaction: "like" | "dislike") {
    try {
      const token = Cookies.get("token");

      const { data } = await axios.post(
        `${blog_service}/api/v1/reaction/${id}`,
        { reaction },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLikes(data.likes);
      setDislikes(data.dislikes);
      setUserReaction(data.userReaction);
    } catch (error) {
      toast.error("Please login to react");
    }
  }

  async function fetchSingleBlog() {
    try {
      setLoading(true);
      const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`);
      setBlog(data.blog);
      setAuthor(data.author);
      setFollowerCount(data.author.followers?.length || 0);
      setIsFollowing(data.author.followers?.includes(user?._id) || false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const deleteComment = async (id: string) => {
    if (confirm("Are you sure you want to delete this comment")) {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const { data } = await axios.delete(
          `${blog_service}/api/v1/comment/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success(data.message);
        fetchComment();
      } catch (error) {
        toast.error("Problem while deleting comment");
      } finally {
        setLoading(false);
      }
    }
  };

  async function deleteBlog() {
    if (confirm("Are you sure you want to delete this blog")) {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        const { data } = await axios.delete(
          `${author_service}/api/v1/blog/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success(data.message);
        router.push("/blogs");
        setTimeout(() => {
          fetchBlogs();
        }, 4000);
      } catch (error) {
        toast.error("Problem while deleting comment");
      } finally {
        setLoading(false);
      }
    }
  }

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedBlogs && savedBlogs?.some((b) => b.blogid === id)) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [savedBlogs, id]);

  async function followAuthor() {
    if (!author) return;

    try {
      setLoading(true);
      const token = Cookies.get("token");

      const { data } = await axios.post(
        `${user_service}/api/v1/user/follow/${author._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setIsFollowing(data.isFollowing);
      setFollowerCount(data.followerCount);
      toast.success(data.message);
    } catch (error) {
      toast.error("Problem while following author");
    } finally {
      setLoading(false);
    }
  }

  async function saveBlog() {
    const token = Cookies.get("token");
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${blog_service}/api/v1/save/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(data.message);
      setSaved(!saved);
      getSavedBlogs();
    } catch (error) {
      toast.error("Problem while saving blog");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleBlog();
    fetchReactions();
  }, [id]);

  useEffect(() => {
    if (blog) {
      console.log("Full blog object:", blog);
      console.log("blogContent value:", blog.blogcontent);
    }
  }, [blog]);

  if (!blog) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-3">
      {/* Blog Card */}
      <Card>
        <CardHeader>
          <div className="text-gray-600 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="flex items-center gap-2"
                href={`/profile/${author?._id}`}
              >
                <img
                  src={author?.image}
                  className="w-8 h-8 rounded-full"
                  alt=""
                />
                <span className="font-medium text-gray-700">
                  {author?.name}
                </span>
              </Link>

              <span className="text-sm text-gray-500">
                {followerCount} followers
              </span>

              {isAuth && blog.author !== user?._id && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={followAuthor}
                  className={
                    isFollowing
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white"
                      : "border-blue-500 text-blue-500 hover:bg-blue-50"
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuth && (
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={loading}
                  onClick={saveBlog}
                >
                  {saved ? (
                    <Bookmark className="h-5 w-5 fill-blue-500 text-blue-500" />
                  ) : (
                    <Bookmark className="h-5 w-5" />
                  )}
                </Button>
              )}

              {blog.author === user?._id && (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => router.push(`/blog/edit/${id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={deleteBlog}
                    disabled={loading}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
        </CardHeader>

        <CardContent>
          <img
            src={blog.image}
            alt=""
            className="w-full h-84 object-cover rounded-lg mb-4"
          />

          <div className="mb-8 rounded-xl border-l-4 border-blue-500 bg-blue-50 px-6 py-4">
            <p className="text-2xl font-bold leading-8 text-gray-700 ">
              {blog.description}
            </p>
          </div>

          <div
            className="prose max-w-none prose-img:mx-auto prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto prose-img:my-6"
            dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
          />
        </CardContent>
      </Card>

      {/* Like / Dislike Card */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              disabled={!isAuth || loading}
              onClick={() => reactToBlog("like")}
              className={`flex items-center gap-2 ${
                userReaction === "like"
                  ? "border-blue-500 text-blue-500 hover:bg-blue-50"
                  : ""
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Like
              <span className="font-semibold">{likes}</span>
            </Button>

            <Button
              variant={userReaction === "dislike" ? "destructive" : "outline"}
              disabled={!isAuth || loading}
              onClick={() => reactToBlog("dislike")}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="w-4 h-4" />
              Dislike
              <span className="font-semibold">{dislikes}</span>
            </Button>
          </div>

          {!isAuth && (
            <p className="text-sm text-gray-500 mt-3">
              Login to like or dislike this blog.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Leave Comment */}
      {isAuth && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Leave a Comment</h3>
          </CardHeader>

          <CardContent>
            <Label htmlFor="comment">Your Comment</Label>

            <Input
              id="comment"
              placeholder="Type Your Comment"
              className="my-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <Button onClick={addCommet} disabled={loading}>
              {loading ? "Adding Comment..." : "Post Comment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">All Comments</h3>
        </CardHeader>

        <CardContent>
          {comments.length > 0 ? (
            comments.map((e, i) => (
              <div key={i} className="border-b py-2 flex items-center gap-3">
                <div>
                  <p className="font-semibold flex items-center gap-1">
                    <span className="border border-gray-400 rounded-full p-1">
                      <User2 />
                    </span>

                    {e.username}
                  </p>

                  <p>{e.comment}</p>

                  <p className="text-xs text-gray-500">
                    {new Date(e.create_at).toLocaleString()}
                  </p>
                </div>

                {e.userid === user?._id && (
                  <Button
                    onClick={() => deleteComment(e.id)}
                    variant="destructive"
                    disabled={loading}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p>No Comments Yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPage;
