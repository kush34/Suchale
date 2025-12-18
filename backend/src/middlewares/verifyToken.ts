import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import { Socket } from 'socket.io';
import * as cookie from "cookie";

interface AuthRequest extends Request {
  username?: string;
  email?: string;
  id?: string
}

const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies.token;
    // console.log(cookieToken)
    const token = (authHeader && authHeader.split(' ')[1]) || cookieToken;

    if (!token) return res.status(401).send('Please Login First');

    // process.env.jwt_Secret can be undefined in some environments; assert or fail early
    const secret = process.env.jwt_Secret;
    if (!secret) return res.status(500).send('Server misconfiguration: missing JWT secret');

    const result = jwt.verify(token as string, secret as jwt.Secret) as any;
    if (!result) return res.status(401).send('pls login again');

    const userDB = await User.findById(result.id);
    if (!userDB) return res.status(401).send('invalid token.');

    req.username = result.username;
    req.email = result.email;
    req.id = result.id;

    next();
  } catch (error) {
    // error has unknown type in strict mode
    if (error instanceof Error) console.log(error.message);
    else console.log(error);
    return res.status(401).send('Invalid token');
  }
};



export const verifySocketToken = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    // console.log(rawCookie)
    if (!rawCookie) {
      return next(new Error("No cookies. Not logged in."));
    }

    const parsed = cookie.parse(rawCookie);
    // console.log(parsed)  
    const token = parsed.token;
    // console.log(token)  

    if (!token) {
      return next(new Error("Missing auth token"));
    }

    const secret = process.env.jwt_Secret;
    if (!secret) {
      return next(new Error("Missing JWT secret"));
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
      email: string;
    };

    socket.data.user = decoded;

    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Invalid or expired token"));
  }
};

export default verifyToken;