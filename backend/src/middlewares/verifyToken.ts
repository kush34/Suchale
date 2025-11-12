import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    username?: string;
    email?: string;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).send('Please Login First');

        // process.env.jwt_Secret can be undefined in some environments; assert or fail early
        const secret = process.env.jwt_Secret;
        if (!secret) return res.status(500).send('Server misconfiguration: missing JWT secret');

        const result = jwt.verify(token as string, secret as jwt.Secret) as any;
        if (!result) return res.status(401).send('pls login again');

        req.username = result.username;
        req.email = result.email;

        next();
    } catch (error) {
        // error has unknown type in strict mode
        if (error instanceof Error) console.log(error.message);
        else console.log(error);
        return res.status(401).send('Invalid token');
    }
};

export default verifyToken;