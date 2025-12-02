import bcrypt from "bcrypt";
import User, { IContact, IUser } from "../models/userModel";
import jwt from "jsonwebtoken";
import { createUser } from "../controllers/createUser";
import Group, { IGroup } from "../models/groupModel";
import Message, { IMessage } from "../models/messageModel";
import crypto from "crypto"
import redis from "../utils/redis";
import sendOtp from "../controllers/sendOtp";
import admin from "../config/firebase";
import Post from "../models/postModel";

interface ServiceResponse {
  statusCode: number;
  body: Record<string, any>;
}

const EmailToOtp = new Map<string, number>();

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<ServiceResponse> => {
  if (!username || !email || !password)
    return { statusCode: 403, body: { message: "not enough data" } };

  const emailExists = await User.findOne({ email });
  if (emailExists)
    return { statusCode: 401, body: { message: "email already exists" } };

  const usernameExists = await User.findOne({ username });
  if (usernameExists)
    return { statusCode: 401, body: { status: "3" } };

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hashedPassword } as IUser);

  return { statusCode: 200, body: { status: "200" } };
};


interface LoginPayload {
  username: string;
  password: string;
}

export const loginUser = async (payload: LoginPayload) => {
  const { username, password } = payload;

  const dbUser = await User.findOne({ username });
  if (!dbUser) return { status: "error", code: 404, message: "User not found" };

  const passwordMatch = await bcrypt.compare(password, dbUser.password);
  if (!passwordMatch) return { status: "error", code: 401, message: "Invalid credentials" };

  const jwtSecret = process.env.jwt_Secret;
  if (!jwtSecret) throw new Error("JWT secret missing in environment");

  const token = jwt.sign(
    {
      username: dbUser.username,
      email: dbUser.email,
      id: dbUser._id
    },
    jwtSecret,
    { expiresIn: "7d" }
  );

  return { status: "success", token };
};


interface VerifyOtpPayload {
  email: string;
  otp: string | number;
  username: string;
  password: string;
}


export const verifyOtpService = async (payload: VerifyOtpPayload) => {
  const { email, otp, username, password } = payload;

  if (!email || !otp || !username || !password) {
    return { status: "error", code: 401, message: "Not enough data" };
  }

  if (!EmailToOtp.has(email)) {
    return { status: "error", code: 400, message: "Unauthorized access" };
  }

  const storedOtp = EmailToOtp.get(email);
  if (storedOtp !== Number(otp)) {
    return { status: "error", code: 400, message: "Invalid OTP" };
  }

  const newUser = await createUser(username, email, password);
  if (!newUser) {
    return { status: "error", code: 400, message: "Something went wrong" };
  }

  // OTP verified and user created
  EmailToOtp.delete(email);

  return { status: "success", message: "OTP verified successfully and account created" };
};

export const usernameCheck = async (username: string) => {
  let dbUser = await User.findOne({ username: username });
  if (dbUser) return { status: "0", code: 400, message: "username taken" }
  else {
    return { status: "1", code: 200, message: "username available" }
  }
}


export const getUserList = async (username: string) => {
  const dbUser = await User.findOne({ username });
  if (!dbUser) return { error: "User not found" };

  // Fetch contacts
  // const contacts = dbUser.contacts || [];

  const contactIds = dbUser.contacts.map(c => c.userId);

  const resUser = await User.find({ _id: { $in: contactIds } }, "username profilePic");

  // Fetch groups
  const resGrp = await Group.find({ users: dbUser._id }, "name profilePic");

  // Fetch online users from Redis
  const onlineUsersMap = new Map(Object.entries(await redis.hgetall("onlineUsers")));
  resUser.forEach(contact => {
    // @ts-ignore: adding status dynamically
    contact.status = onlineUsersMap.has(contact.username) ? "Online" : "Offline";
  });

  // Last 1-on-1 messages
  const lastMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          { fromUser: username, toUser: { $in: resUser.map(u => u.username) } },
          { toUser: username, fromUser: { $in: resUser.map(u => u.username) } }
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ["$fromUser", username] }, "$toUser", "$fromUser"]
        },
        lastMessage: { $first: "$$ROOT" }
      }
    }
  ]);

  // Last group messages
  const groups = dbUser.groups || [];
  const lastGroupMessages = await Message.aggregate([
    { $match: { groupId: { $in: groups } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$groupId", lastMessage: { $first: "$$ROOT" } } }
  ]);

  // Map last messages for easier access
  const lastMsgMap: Record<string, IMessage> = {};
  lastMessages.forEach(m => {
    lastMsgMap[m._id] = m.lastMessage;
  });

  const lastGroupMsgMap: Record<string, IMessage> = {};
  lastGroupMessages.forEach(g => {
    lastGroupMsgMap[g._id.toString()] = g.lastMessage;
  });

  // Combine data
  const updatedContacts = resUser.map(contact => ({
    ...contact.toObject(),
    lastMessage: lastMsgMap[contact.username] || null
  }));

  const updatedGroups = resGrp.map(grp => ({
    ...grp.toObject(),
    isGroup: true,
    lastMessage: lastGroupMsgMap[grp._id.toString()] || null
  }));

  return [...updatedGroups, ...updatedContacts];
};



export const searchUsers = async (query: string) => {
  if (!query) return [];

  // Case-insensitive search for usernames starting with the query
  const users = await User.find({ username: new RegExp("^" + query, "i") })
    .limit(15)
    .select("username email profilePic");

  return users;
};


export const updateProfilePic = async (username: string, filePath: string) => {
  const updatedUser = await User.findOneAndUpdate(
    { username },
    { profilePic: filePath },
    { new: true }
  );

  return updatedUser;
};



export const addContactService = async (username: string, contactUsername: string) => {
  if (username === contactUsername) {
    return { status: "error", code: 400, message: "Cannot add yourself as a contact" };
  }

  const contactUser = await User.findOne({ username: contactUsername });
  if (!contactUser) {
    return { status: "error", code: 404, message: "Contact user not found" };
  }

  const curUser = await User.findOne({ username });
  if (!curUser) {
    return { status: "error", code: 404, message: "Current user not found" };
  }

  // Check if already in contacts
  if (curUser.contacts.some(c => c.userId.equals((contactUser)._id))) {
    return { status: "error", code: 400, message: "User already in contacts" };
  }

  const newContact: IContact = {
    userId: (contactUser as any)._id,
    lastMessage: null
  };
  curUser.contacts.push(newContact);
  await curUser.save();

  return { status: "success", code: 200, message: "User added successfully" };
};



export const getUserInfoService = async (username: string) => {
  const user = await User.findOne({ username }).select("-password");
  return user;
};

export const subscribeService = async (username: string, subscription: Record<string, any>) => {
  if (!subscription || typeof subscription !== "object") {
    return { status: "error", code: 400, message: "Invalid subscription object" };
  }

  const updatedUser = await User.findOneAndUpdate(
    { username },
    { pushSubscription: subscription },
    { new: true }
  );

  if (!updatedUser) {
    return { status: "error", code: 404, message: "User not found" };
  }

  return { status: "success", code: 200, message: "Subscription updated", user: updatedUser };
};


export const sendMailService = async (email: string, username: string, password: string) => {
  if (!email || !username || !password) {
    return { status: "error", code: 401, message: "Not enough data" };
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return { status: "error", code: 400, message: "User already exists" };
  }

  const OTP = crypto.randomInt(100000, 1000000);
  EmailToOtp.set(email, OTP);

  sendOtp(email, OTP);

  return { status: "success", code: 200, message: `OTP sent to user email: ${email}` };
};

export const firebaseTokenVerify = async (token: string) => {
  if (!token) {
    return { status: "error", code: 400, message: "Token is required!" };
  }

  const decoded = await admin.auth().verifyIdToken(token);

  let user = await User.findOne({ email: decoded.email });

  // If user does NOT exist → create one
  let resToken: string;
  const jwtSecret = process.env.jwt_Secret;
  if (!jwtSecret) throw new Error("JWT secret missing in environment");

  if (!user) {
    const baseName = decoded.name?.toLowerCase().replace(/\s+/g, "_") || "user";

    let username = baseName;
    let exists = await User.findOne({ username });

    // Generate a unique username

    while (exists) {
      const suffix = Math.floor(Math.random() * 10000);
      username = `${baseName}_${suffix}`;
      exists = await User.findOne({ username });
    }

    // Create fake password because schema requires it
    const fakePassword = Math.random().toString(36).slice(-12);

    user = await User.create({
      username,
      email: decoded.email,
      password: fakePassword,
      profilePic: decoded.picture || undefined,
    });

    console.log("New user created:", username);
    resToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        id: user._id
      },
      jwtSecret,
      { expiresIn: "7d" }
    );
  } else {
    resToken = jwt.sign(
      {
        username: user.username,
        email: user.email,
        id: user._id
      },
      jwtSecret,
      { expiresIn: "7d" }
    );
  }

  return {
    status: "success",
    code: 200,
    message: "Token verified",
    token: resToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
    }
  };
};


export const getUserProfile = async (username: string) => {

  const user = await User.findOne({ username }).select(
    "username fullName bio profilePic followers following"
  );

  if (!user) {
    return { status: "error", code: 404, message: "User not found" };
  }

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .select("media content engagement")
    .lean();

  return {
    status: "succes", code: 200, data: {
      user: {
        username: user.username,
        fullName: user.fullName,
        bio: user.bio,
        profilePic: user.profilePic,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        posts: posts.map((p) => ({
          _id: p._id,
          media: p.media,
          content: p.content,
          engagement: p.engagement,
          user: {
            username: user.username,
            profilePic: user.profilePic,
          },
        })),
      },
    }
  };
}
