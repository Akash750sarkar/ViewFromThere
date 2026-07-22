"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WandSparkles } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { useParams, useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Cookies from "js-cookie";
import axios from "axios";
import { author_service, blog_service, useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";
import { blogCategories } from "../../new/page"; // adjust path if AddBlog page is elsewhere
import Loading from "@/components/Loading";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const EditBlogPage = () => {
  const editor = useRef(null);
  const router = useRouter();
  const { id } = useParams();
  const { fetchBlogs } = useAppData();

  const [content, setContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [existingImage, setExistingImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null as File | null,
    blogcontent: "",
  });

  // Fetch existing blog and pre-fill the form
  useEffect(() => {
    async function fetchBlog() {
      try {
        const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`);
        const blog = data.blog;

        setFormData({
          title: blog.title || "",
          description: blog.description || "",
          category: blog.category || "",
          image: null,
          blogcontent: blog.blogcontent || "",
        });
        setContent(blog.blogcontent || "");
        setExistingImage(blog.image || null);
      } catch (error) {
        console.log(error);
        toast.error("Failed to load blog data");
      } finally {
        setPageLoading(false);
      }
    }
    if (id) fetchBlog();
  }, [id]);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.blogcontent
    ) {
      toast.error("Please fill all the required fields before submitting");
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("blogcontent", formData.blogcontent);
    formDataToSend.append("category", formData.category);
    if (formData.image) {
      formDataToSend.append("file", formData.image);
    }

    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${author_service}/api/v1/blog/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(data.message || "Blog updated successfully");
      setTimeout(() => {
        fetchBlogs();
      }, 4000);
      router.push(`/blog/${id}`);
    } catch (error) {
      console.log((error as any).response?.data);
      toast.error("Error while updating blog");
    } finally {
      setLoading(false);
    }
  };

  const [aiTitle, setAiTitle] = useState(false);

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/title`, {
        text: formData.title,
      });
      setFormData({ ...formData, title: data });
    } catch (error) {
      toast.error("problem while fetching from ai");
      console.log(error);
    } finally {
      setAiTitle(false);
    }
  };

  const [aiDesccription, setAiDesccription] = useState(false);

  const aiDescriptionResponse = async () => {
    try {
      setAiDesccription(true);
      const { data } = await axios.post(
        `${author_service}/api/v1/ai/description`,
        {
          title: formData.title,
          description: formData.description,
        },
      );
      setFormData({ ...formData, description: data });
    } catch (error) {
      toast.error("problem while fetching from ai");
      console.log(error);
    } finally {
      setAiDesccription(false);
    }
  };

  const [aiblogLoading, setAiblogLoading] = useState(false);

  const aiBlogResponse = async () => {
    try {
      setAiblogLoading(true);
      const { data } = await axios.post(`${author_service}/api/v1/ai/blog`, {
        blog: formData.blogcontent,
      });
      setContent(data.html);
      setFormData({ ...formData, blogcontent: data.html });
    } catch (error) {
      toast.error("problem while fetching from ai");
      console.log(error);
    } finally {
      setAiblogLoading(false);
    }
  };

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typings...",
      uploader: {
        insertImageAsBase64URI: false,
        url: `${author_service}/api/v1/blog/upload-image`,
        filesVariableName: () => "file",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        format: "json",
        beforeUpload: () => {
          setImageUploading(true);
          toast.loading("Image uploading...", { id: "blog-image-upload" });
        },
        isSuccess: () => true,
        process: (resp: { url: string }) => {
          setImageUploading(false);
          toast.dismiss("blog-image-upload");

          return {
            files: [resp.url],
            path: "",
            baseurl: "",
            error: 0,
            msg: "",
          };
        },
        defaultHandlerSuccess: function (
          this: any,
          data: { files?: string[] },
        ) {
          setImageUploading(false);
          toast.dismiss("blog-image-upload");

          if (data.files?.length) {
            this.selection.insertImage(data.files[0], null, 600);
          }
        },
        error: () => {
          setImageUploading(false);
          toast.error("Image upload failed");
        },
      },
    }),
    [],
  );

  if (pageLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Edit Blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>
              Title <span className="text-red-500">*</span>
            </Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter Blog Title"
                className={
                  aiTitle ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        onClick={aiTitleResponse}
                        disabled={aiTitle}
                        variant="ghost"
                        size="icon"
                        className="bg-blue-100 h-10 w-10 hover:bg-amber-200"
                      >
                        <WandSparkles
                          className={`h-5 w-5 ${aiTitle ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Improve writing with AI</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <Label>
              Description <span className="text-red-500">*</span>
            </Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Blog Description"
                className={
                  aiDesccription ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        onClick={aiDescriptionResponse}
                        disabled={aiDesccription}
                        variant="ghost"
                        size="icon"
                        className="bg-blue-100 h-10 w-10 hover:bg-amber-200"
                      >
                        <WandSparkles
                          className={`h-7 w-7 ${aiDesccription ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {formData.description === "" ? (
                        <p>Generate the description with AI</p>
                      ) : (
                        <p>Improve writing with AI</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <Label>
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={formData.category || "Select category"}
                />
              </SelectTrigger>
              <SelectContent>
                {blogCategories?.map((e, i) => (
                  <SelectItem key={i} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <Label>
                Image Upload: Upload a new image only if you want to replace the
                current one
              </Label>
              {existingImage && !formData.image && (
                <img
                  src={existingImage}
                  alt="Current blog"
                  className="w-full h-48 object-cover rounded-lg my-2"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>

            <div>
              <Label>
                Blog Content <span className="text-red-500">*</span>
              </Label>

              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground max-w-[80%]">
                  Paste your blog or type here. You can use rich text
                  formatting. Please add images after using the text formatter
                  if needed.
                </p>

                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-blue-100 h-10 hover:bg-amber-200"
                  onClick={aiBlogResponse}
                  disabled={aiblogLoading}
                  type="button"
                >
                  <WandSparkles
                    className={aiblogLoading ? "animate-spin" : ""}
                  />
                  <span>Improve writing with AI</span>
                </Button>
              </div>

              {imageUploading && (
                <p className="mb-2 text-sm font-medium text-blue-600">
                  Image uploading...
                </p>
              )}

              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setFormData((prev) => ({
                    ...prev,
                    blogcontent: newContent,
                  }));
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBlogPage;
