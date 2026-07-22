"use client";

import React, {
  ReactNode,
  useState,
  createContext,
  useEffect,
  useContext,
} from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const user_service = "http://localhost:5000";
export const author_service = "http://localhost:5001";
export const blog_service = "http://localhost:5002";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedIn: string;
  bio: string;
  followers?: string[];
  following?: string[];
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  author: string;
  created_at: string;
}

interface SavedBlogType {
  id: string;
  userid: string;
  blogid: string;
  create_at: string;
}

// interface AppContextType {
//   user: User | null;
//   isAuth: boolean;
//   loading: boolean;
//   blogLoading: boolean;
//   blogs: Blog[] | null;

//   setUser: React.Dispatch<React.SetStateAction<User | null>>;
//   setLoading: React.Dispatch<React.SetStateAction<boolean>>;
//   setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
//   fetchBlogs: () => Promise<void>;
//   logoutUser: () => Promise<void>;
//   setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
//   searchQuery: string;
//   setCategory: React.Dispatch<React.SetStateAction<string>>;
//   savedBlogs: SavedBlogType[]|null;
//   getSavedBlogs: ()=> Promise<void>
// }

interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  blogLoading: boolean;
  blogs: Blog[] | null;

  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  fetchBlogs: (page?: number) => Promise<void>;
  logoutUser: () => Promise<void>;

  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;

  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;

  savedBlogs: SavedBlogType[] | null;
  getSavedBlogs: () => Promise<void>;

  page: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [category, setCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  useEffect(() => {
    const fetchUser = async () => {
      console.log("fetchUser called");
      try {
        const token = Cookies.get("token");
        console.log("Token:", token);
        if (!token) {
          return;
        }

        const { data } = await axios.get(`${user_service}/api/v1/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(data);
        setIsAuth(true);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    getSavedBlogs();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, category]);

  useEffect(() => {
    fetchBlogs(page);
  }, [searchQuery, category, page]);

  async function fetchBlogs(pageNumber = 1) {
    setBlogLoading(true);

    try {
      const { data } = await axios.get(
        `${blog_service}/api/v1/blog/all?searchQuery=${searchQuery}&category=${category}&page=${pageNumber}&limit=${limit}`,
      );

      setBlogs(data.blogs);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setBlogLoading(false);
    }
  }

  const [savedBlogs, setSavedBlogs] = useState<SavedBlogType[] | null>(null);

  async function getSavedBlogs() {
    const token = Cookies.get("token");
    try {
      const { data } = await axios.get(
        `${blog_service}/api/v1/blog/saved/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSavedBlogs(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("User Logged Out");
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        blogLoading,
        blogs,
        setUser,
        setLoading,
        setIsAuth,
        fetchBlogs,
        logoutUser,
        category,  
        setCategory,
        setSearchQuery,
        searchQuery,
        savedBlogs,
        getSavedBlogs,
        page,
        totalPages,
        setPage,
      }}
    >
      <GoogleOAuthProvider clientId="1058731274583-0637jet008nradf6ber4qjdu9aj8qtdr.apps.googleusercontent.com">
        {" "}
        {children}
        <Toaster />{" "}
      </GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
};
