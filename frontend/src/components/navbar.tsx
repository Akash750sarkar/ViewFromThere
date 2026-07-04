"use client";

import Link from "next/link";
import { CircleUserRoundIcon, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { loading, isAuth } = useAppData();
  console.log("Navbar Rendered");
  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white shadow-md z-50">
      <div className="mx-auto h-full flex justify-between items-center px-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          ViewFromThere
        </Link>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Desktop Navbar */}
        <ul className="hidden md:flex justify-center items-center space-x-6 text-gray-700">
          <li>
            <Link href="/blogs" className="hover:text-blue-500">
              Home
            </Link>
          </li>

          {/* <li>
            <Link href="/blogs" className="hover:text-blue-500">
              Blogs
            </Link>
          </li> */}

          <li>
            <Link href="/blog/saved" className="hover:text-blue-500">
              Saved
            </Link>
          </li>

          {!loading && (
            <li>
              {isAuth ? (
                <Link href="/profile" className="hover:text-blue-500">
                  <CircleUserRoundIcon />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hover:text-blue-500 flex items-center gap-2"
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>

      {/* Mobile Navbar */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <ul className="flex flex-col justify-center items-center space-y-4 p-4 text-gray-700 bg-white shadow-md">
          <li>
            <Link
              href="/blogs"
              className="hover:text-blue-500"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          </li>

          {/* <li>
            <Link
              href="/blogs"
              className="hover:text-blue-500"
              onClick={() => setIsOpen(false)}
            >
              Blogs
            </Link>
          </li> */}

          <li>
            <Link
              href="/blog/saved"
              className="hover:text-blue-500"
              onClick={() => setIsOpen(false)}
            >
              Saved
            </Link>
          </li>

          {!loading && (
            <li>
              {isAuth ? (
                <Link
                  href="/profile"
                  className="hover:text-blue-500 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <CircleUserRoundIcon size={20} />
                  <span>Profile</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hover:text-blue-500 flex items-center gap-2"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
