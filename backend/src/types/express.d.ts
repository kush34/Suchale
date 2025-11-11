import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    username?: string; // optional because middleware might not set it
  }
}
