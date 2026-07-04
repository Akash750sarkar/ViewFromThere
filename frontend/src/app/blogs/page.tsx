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
        <div className="container mx-auto px-4"> 
          <section className="border-b py-10 md:py-14">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Travel Journal
            </p>

            <div className="mt-3 max-w-4xl">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Travel stories from people who were actually there.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                ViewFromThere is a place for honest travel writing, lived
                experiences, hidden routes, quiet journeys, and practical notes
                from the road.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <a href="#latest-stories">Start Reading</a>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/blog/new" className="flex items-center gap-2">
                  <PenLine size={17} />
                  Write a Story
                </Link>
              </Button>
            </div>
          </section>

          <section id="latest-stories" className="py-8">
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
