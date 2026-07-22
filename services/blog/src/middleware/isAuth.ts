import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser {
  _id: string;
  email?: string;
  name?:string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Please Login - No auth header",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    console.log("Auth Header:", authHeader);
console.log("Extracted Token:", token);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SEC as string,
    ) as JwtPayload;

    if (!decoded || !decoded.id) {
      res.status(401).json({
        message: "Invalid Token",
      });
      return;
    }

    req.user = {
      _id: decoded.id,
      email: decoded.email,
      name:decoded.name,
    };

    next();
  } catch (error) {
    console.log("JWT Verification Error:", error);

    res.status(401).json({
      message: "Please Login - JWT error",
    });
  }
};
