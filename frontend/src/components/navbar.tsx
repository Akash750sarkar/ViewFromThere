"use client";

import Link from "next/link";
import { Bookmark, CircleUserRoundIcon, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppContext";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { loading, isAuth } = useAppData();
  console.log("Navbar Rendered");
  return (
    <nav className="fixed top-0 left-0 w-full bg-[#e7dabd] shadow-md z-50">
      <div className="mx-auto flex h-20 items-center justify-between px-8">
        {/* logo */}
        <Link
          href="/blogs"
          className="flex items-center gap-3 group select-none bg-[#305867] px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="relative h-12 w-12 overflow-hidden rounded-lg ring-1 ring-white/20">
            <Image
              src="/logo2.png"
              alt="ViewFromThere Logo"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>

          <div className="flex flex-col leading-none">
            <h1
              className="text-[1.4rem] font-bold tracking-tight text-[#f4ede1]"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              ViewFromThere
            </h1>

            <p className="mt-1 text-[11px] tracking-widest uppercase text-[#c9b896] ml-0.5">
              Stories • Journeys • Memories
            </p>
          </div>
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
            <Link
              href="/blog/saved"
              className="flex items-center gap-2 transition-colors hover:text-blue-500"
            >
              <Bookmark size={17} />
              <span>Saved</span>
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
                  className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-stone-100 hover:text-[#355C6B]"
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
