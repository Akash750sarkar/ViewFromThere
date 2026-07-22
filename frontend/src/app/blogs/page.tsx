"use client";

import BlogCard from "@/components/BlogCard";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppData } from "@/context/AppContext";
import { Filter, PenLine } from "lucide-react";
import Link from "next/link";
import React from "react";
const Blogs = () => {
  const { toggleSidebar } = useSidebar();
  const { loading, blogLoading, blogs, page, totalPages, setPage } =
    useAppData();

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="mx-auto w-[93%] max-w-[1500px]">
          <section className="mt-8 grid items-center gap-16 rounded-[36px] border border-stone-200 bg-[#e6dece] px-12 py-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-[#e6d0a8] px-4 py-2 text-sm font-medium text-[#355C6B]">
                🌍 Real stories from real travellers
              </span>

              <div className="mt-3 max-w-4xl">
                <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                  Travel <span className="text-[#355C6B]">stories </span>from
                  people who were actually there.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                  ViewFromThere is a place for honest travel writing, lived
                  experiences, hidden routes, quiet journeys, and practical
                  notes from the road.
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="bg-[#305867] px-8 py-6 text-base">
                  <a href="#latest-stories">Start Reading</a>
                </Button>

                <Button asChild  className="bg-[#305867] px-8 py-6 text-base">
                  <Link href="/blog/new" className="flex items-center gap-2">
                    <PenLine size={17} />
                    Write a Story
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex justify-end">
              <img
                src="/hero.png"
                alt="Travel Camera"
                className="h-[560px] w-full max-w-[700px] rounded-[32px] object-cover object-[32%]"
              />
            </div>
          </section>

          <section id="latest-stories" className="mt-8 py-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Fresh from the road
                </p>
                <h2 className="text-3xl font-bold text-gray-900">
                  Latest Stories
                </h2>
              </div>

              <Button
                onClick={toggleSidebar}
                variant="outline"
                className="flex items-center gap-2 px-4"
              >
                <Filter size={18} />
                <span>Filter</span>
              </Button>
            </div>

            {blogLoading ? (
              <Loading />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {blogs?.length === 0 && (
                    <p className="text-gray-600">No Blogs Yet</p>
                  )}

                  {blogs?.map((blog) => (
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

                {blogs && blogs.length > 0 && (
                  <div className="mb-6 mt-10 flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      disabled={page <= 1 || blogLoading}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      disabled={page >= totalPages || blogLoading}
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Blogs;
