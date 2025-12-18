import { Request, Response } from 'express';
import * as userService from "../services/userService";
import User from '../models/userModel';
import Post from '../models/postModel';


interface RegisterBody {
    username: string;
    email: string;
    password: string;
}

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const result = await userService.registerUser(username, email, password);
        res.status(result.statusCode).json(result.body);
    } catch (error) {
        console.log(`Error /user/create ${error}`)
        res.status(500).json({ message: "something went wrong" });
    }
};

interface LoginBody {
    username: string;
    password: string;
}

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: "error", message: "Username and password required" });
    }

    try {
        const result = await userService.loginUser({ username, password });

        if (result.status === "error") {
            return res.status(Number(result.code)).json({ status: "error", message: result.message });
        }
        res.cookie('token', result.token, {
            httpOnly: process.env.NODE_ENV != "dev",
            secure: process.env.NODE_ENV != "dev",
            sameSite: 'lax'
        }
        )
        res.cookie('refreshtoken', result.refreshtoken, {
            httpOnly: process.env.NODE_ENV != "dev",
            secure: process.env.NODE_ENV != "dev",
            sameSite: 'lax'
        })

        return res.status(200).json({ status: "success", token: result.token });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
interface VerifyOtpBody {
    email: string;
    otp: string | number;
    username: string;
    password: string;
}

export const verifyOtp = async (req: Request<{}, {}, VerifyOtpBody>, res: Response) => {
    try {
        const result = await userService.verifyOtpService(req.body);

        if (result.status === "error") {
            return res.status(Number(result.code)).json({ status: "error", message: result.message });
        }

        return res.status(200).json({ status: "success", message: result.message });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Something went wrong" });
    }
};

interface UsernameBody {
    username: string;
}
export const usernameCheck = async (req: Request<{}, {}, UsernameBody>, res: Response) => {
    try {
        const { username } = req.body;
        let result = await userService.usernameCheck(username);
        return res.status(Number(result.code)).send({ status: result.status, message: result.message })
    } catch (error) {
        res.status(500).send("something went wrong");
    }
}



export const userList = async (req: Request, res: Response) => {
    try {
        // req.username is set from auth middleware
        const username = req.username;
        if (!username) return res.status(401).json({ status: "error", message: "Unauthorized" });

        const response = await userService.getUserList(username);

        if ("error" in response) {
            return res.status(404).json({ status: "error", message: response.error });
        }

        res.json({ status: "success", response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};


interface SearchBody {
    query: string;
}

export const search = async (req: Request<{}, {}, SearchBody>, res: Response) => {
    try {
        const { query } = req.body;

        if (!query || query.trim() === "") {
            return res.status(400).json({ status: "error", message: "Query is required" });
        }

        const users = await userService.searchUsers(query);

        res.status(200).json({ status: "success", users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};


interface ProfilePicRequest extends Request {
    username?: string;
    file?: Express.Multer.File;
}

export const profilePic = async (req: ProfilePicRequest, res: Response) => {
    try {
        const username = req.username;
        const filePath = req.file?.path;

        if (!username) return res.status(401).json({ status: "error", message: "Unauthorized" });
        if (!filePath) return res.status(400).json({ status: "error", message: "File not uploaded" });

        const updatedUser = await userService.updateProfilePic(username, filePath);

        if (!updatedUser) return res.status(404).json({ status: "error", message: "User not found" });

        res.status(200).json({ status: "success", url: filePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Something went wrong" });
    }
};

interface AddContactRequest extends Request {
    username?: string;
}

interface AddContactBody {
    contact: string;
}

export const addContact = async (req: AddContactRequest, res: Response) => {
    try {
        const username = req.username;
        const { contact } = req.body as AddContactBody;

        if (!username) return res.status(401).json({ status: "error", message: "Unauthorized" });
        if (!contact) {
            return res.status(400).json({ status: "error", message: "Contact username is required" });
        }

        const result = await userService.addContactService(username, contact);

        res.status(result.code).json({ status: result.status, message: result.message });
    } catch (error) {
        console.error("Error in /addContact:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};


interface CustomRequest extends Request {
    username?: string;
}

export const userInfo = async (req: CustomRequest, res: Response) => {
    try {
        const username = req.username;
        if (!username) return res.status(401).json({ status: "error", message: "Unauthorized" });

        const user = await userService.getUserInfoService(username);
        if (!user) return res.status(404).json({ status: "error", message: "User not found" });

        res.status(200).json({ status: "success", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Something went wrong" });
    }
};

export const subscribe = async (req: CustomRequest, res: Response) => {
    try {
        const username = req.username;
        const { subscription } = req.body;

        if (!username) return res.status(401).json({ status: "error", message: "Unauthorized" });

        const result = await userService.subscribeService(username, subscription);
        res.status(result.code).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Something went wrong on the server" });
    }
};

interface SendMailBody {
    email: string;
    username: string;
    password: string;
}

export const sendMail = async (req: Request<{}, {}, SendMailBody>, res: Response) => {
    try {
        const { email, username, password } = req.body;

        const result = await userService.sendMailService(email, username, password);
        res.status(result.code).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Something went wrong" });
    }
};


interface firebaseTokenVerifyPayload {
    token: string;
}


export const firebaseTokenVerify = async (req: Request<{}, {}, firebaseTokenVerifyPayload>, res: Response) => {
    try {
        const { token } = req.body;

        const result = await userService.firebaseTokenVerify(token);
        if (result.status === "error") return res.status(Number(result.code)).send()
        res.cookie('token', result.token, {
            httpOnly: process.env.NODE_ENV != "dev",
            secure: process.env.NODE_ENV != "dev",
            sameSite: 'lax'
        }
        )
        res.cookie('refreshtoken', result.refreshtoken, {
            httpOnly: process.env.NODE_ENV != "dev",
            secure: process.env.NODE_ENV != "dev",
            sameSite: 'lax'
        })
        res.status(result.code).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Something went wrong" });
    }
}

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const userId = req.id;

        if (!username) return res.status(400).send({ message: "username required to get profile of user." })
        let result;
        if (userId) {
            result = await userService.getUserProfile(username, userId);
        } else {
            result = await userService.getUserProfile(username);
        }

        return res.status(Number(result.code)).send(result)
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const blockUser = async (req: Request, res: Response) => {
    try {
        const { usernameToBlock } = req.params
        const userId = req.id;
        if (!usernameToBlock) return res.status(400).send({ message: "/user/block/:usernameToBlock is required to block a user." })

        const result = await userService.blockUserByUsername(usernameToBlock.toString(), userId as string);
        return res.status(Number(result.code)).send(result);

    } catch (error) {
        console.log(`Error: /user/block/:usernameToBlock userService:blockUser ${error}`)
        return res.status(500).send({ message: "Couldnt block the user" })
    }
}

export const followUserByUsername = async (req: Request, res: Response) => {
    try {
        const { usernameToFollow } = req.params;
        const userId = req.id;
        if (!userId) return res.status(400).send({ success: "error", code: 400, message: "You need to login to access this endpoint." });

        if (!usernameToFollow || usernameToFollow.trim() === "" || typeof usernameToFollow !== "string") return res.send({ error: "pls send usernameToFollow at /followUser/:usernameToFollow" });
        const result = await userService.followUserByUsername(userId.toString(), usernameToFollow);
        res.status(Number(result.code)).send(result);
    } catch (error) {
        console.log(`Error: /user/followUser/:usernameToFollow userService:followUserByUsername ${error}`)
        return res.status(500).send({ message: "Couldnt block the user" })
    }
}

export const unFollowUserByUsername = async (req: Request, res: Response) => {
    try {
        const { usernameToUnfollow } = req.params;
        const userId = req.id;
        if (!userId) return res.status(400).send({ success: "error", code: 400, message: "You need to login to access this endpoint." });

        if (!usernameToUnfollow || usernameToUnfollow.trim() === "" || typeof usernameToUnfollow !== "string") return res.send({ error: "pls send usernameToFollow at /followUser/:usernameToFollow" });
        const result = await userService.unFollowUserByUsername(userId.toString(), usernameToUnfollow);
        res.status(Number(result.code)).send(result);
    } catch (error) {
        console.log(`Error: /user/followUser/:usernameToFollow userService:followUserByUsername ${error}`)
        return res.status(500).send({ message: "Couldnt block the user" })
    }
}