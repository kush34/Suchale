import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    username?: string;
    email?: string;
    id?: string;
  }
}
