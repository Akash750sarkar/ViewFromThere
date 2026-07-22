"use client";
import Loading from "@/components/Loading";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData, User, user_service } from "@/context/AppContext";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import BlogCard from "@/components/BlogCard";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const { blogs, blogLoading } = useAppData();

  const { id } = useParams();

  async function fetchUser() {
    try {
      const { data } = await axios.get(`${user_service}/api/v1/user/${id}`);
      setUser(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [id]);

  if (!user) {
    return <Loading />;
  }

  const authorBlogs = blogs?.filter((blog) => blog.author === user._id) || [];

  return (
    <div className="min-h-screen p-4">
      <Card className="w-full max-w-xl mx-auto shadow-lg border rounded-2xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer">
              <AvatarImage src={user?.image} alt="profile pic" />
            </Avatar>
            <div className="w-full space-y-2 text-center">
              <p className="text-xl font-semibold text-gray-900">
                {user?.name}
              </p>
            </div>
            <div className="flex justify-center gap-2 w-full">
              <div className="border rounded-md px-3 py-1.5 text-center bg-gray-50 min-w-20">
                <p className="text-base font-semibold text-gray-900 leading-none">
                  {user?.followers?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Followers</p>
              </div>

              <div className="border rounded-md px-3 py-1.5 text-center bg-gray-50 min-w-20">
                <p className="text-base font-semibold text-gray-900 leading-none">
                  {user?.following?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Following</p>
              </div>
            </div>
            {user?.bio && (
              <div className="w-full space-y-2 text-center">
                <p>{user.bio}</p>
              </div>
            )}
            <div className="flex gap-4 mt-3">
              {user?.instagram && (
                <a
                  href={user.instagram}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="text-pink-500 text-2xl" />
                </a>
              )}
              {user?.facebook && (
                <a
                  href={user.facebook}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebook className="text-blue-500 text-2xl" />
                </a>
              )}
              {user?.linkedIn && (
                <a
                  href={user.linkedIn}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  <FaLinkedin className="text-blue-700 text-2xl" />
                </a>
              )}
            </div>
          </CardContent>
        </CardHeader>
            </Card>

      <section className="w-full max-w-6xl mx-auto mt-8">
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Blogs by {user.name}
          </h2>
          <p className="text-sm text-gray-500">
            {authorBlogs.length} {authorBlogs.length === 1 ? "blog" : "blogs"} published
          </p>
        </div>

        {blogLoading ? (
          <Loading />
        ) : authorBlogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {authorBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                image={blog.image}
                title={blog.title}
                desc={blog.description}
                id={blog.id}
                time={blog.created_at}
              />
            ))}
          </div>
        ) : (
          <Card className="max-w-xl mx-auto">
            <CardContent className="py-6 text-center text-gray-500">
              This author has not published any blogs yet.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
