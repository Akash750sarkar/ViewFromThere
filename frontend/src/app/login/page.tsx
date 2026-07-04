"use client";

import React, { useEffect } from "react";
import { useGoogleLogin, CodeResponse } from "@react-oauth/google";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAppData, user_service } from "@/context/AppContext";
import Loading from "@/components/Loading";

const LoginPage = () => {
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData();
  const router = useRouter();

  // console.log(user);

  useEffect(() => {
    if (isAuth) {
      router.replace("/");
    }
  }, [isAuth, router]);

  const responseGoogle = async (authResult: CodeResponse) => {
    setLoading(true);
    try {
      const result = await axios.post(`${user_service}/api/v1/login`, {
        code: authResult.code,
      });

      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      toast.success(result.data.message);

      setIsAuth(true);
      setLoading(false);
      setUser(result.data.user);
      router.replace("/");
    } catch (error) {
      console.error(error);
      toast.error("Problem while logging you in");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: responseGoogle,
    onError: () => {
      toast.error("Google Login Failed");
    },
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>

          <CardDescription className="text-base">
            Login to continue your journey with ViewFromThere
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          <Button
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 text-base font-medium cursor-pointer"
            onClick={() => googleLogin()}
          >
            <Image src="/Google.png" width={20} height={20} alt="Google Logo" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Secure authentication powered by Google
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
