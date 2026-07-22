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
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import Cookies from "js-cookie";
import { redirect, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import BlogCard from "@/components/BlogCard";

const ProfilePage = () => {
  const { user, setUser, logoutUser, blogs, blogLoading } = useAppData();

  const logoutHandler = () => {
    logoutUser();
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setloading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    instagram: user?.instagram || "",
    facebook: user?.facebook || "",
    linkedin: user?.linkedIn || "",
    bio: user?.bio || "",
  });

  if (!user) return redirect("/login");
  const myBlogs = blogs?.filter((blog) => blog.author === user._id) || [];

  const clickHandler = () => {
    inputRef.current?.click();
  };

  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setloading(true);
        const token = Cookies.get("token");
        const { data } = await axios.post(
          `${user_service}/api/v1/user/update/pic`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        toast.success(data.message);
        setloading(false);
        Cookies.set("token", data.token, {
          expires: 5,
          secure: true,
          path: "/",
        });
        setUser(data.user);
      } catch (error) {
        console.error(error);
        toast.error("Image Update Failed");
        setloading(false);
      }
    }
  };

  const handleFormSubmit = async () => {
    try {
      setloading(true);
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${user_service}/api/v1/user/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success(data.message);
      setloading(false);
      Cookies.set("token", data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });
      setUser(data.user);
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Update Failed");
      setloading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      {loading ? (
        <Loading />
      ) : (
        <Card className="w-full max-w-xl mx-auto shadow-lg border rounded-2xl p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Profile</CardTitle>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar
                className="w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer"
                onClick={clickHandler}
              >
                <AvatarImage src={user?.image} alt="profile pic" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={inputRef}
                  onChange={changeHandler}
                />
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

              <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full justify-center">
                <Button onClick={logoutHandler}>Logout</Button>
                <Button onClick={() => router.push("/blog/new")}>
                  Add Blog
                </Button>

                <Dialog
                  open={open}
                  onOpenChange={(isOpen) => {
                    if (isOpen) {
                      setFormData({
                        name: user?.name || "",
                        instagram: user?.instagram || "",
                        facebook: user?.facebook || "",
                        linkedin: user?.linkedIn || "",
                        bio: user?.bio || "",
                      });
                    }
                    setOpen(isOpen);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant={"outline"}>Edit</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Input
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Instagram</Label>
                        <Input
                          value={formData.instagram}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instagram: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Facebook</Label>
                        <Input
                          value={formData.facebook}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              facebook: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>LinkedIn</Label>
                        <Input
                          value={formData.linkedin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              linkedin: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        onClick={handleFormSubmit}
                        className="w-full mt-4"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      )}

      <section className="w-full max-w-6xl mx-auto mt-8">
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">My Blogs</h2>
          <p className="text-sm text-gray-500">
            {myBlogs.length} {myBlogs.length === 1 ? "blog" : "blogs"} published
          </p>
        </div>

        {blogLoading ? (
          <Loading />
        ) : myBlogs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {myBlogs.map((blog) => (
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
              You have not published any blogs yet.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default ProfilePage;
