import User from '../models/userModel.js';
import crypto from "crypto"
import { createUser } from "../controllers/createUser.js"
import { sendOtp } from "../controllers/sendOtp.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Group from "../models/groupModel.js";
import redis from "../utils/redis.js";
import Message from '../models/messageModel.js';
const EmailToOtp = new Map();

export const register = async (req, res) => {
    try {
        //username
        //email
        //password
        //profile pic

        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            res.status(403).send("not enough data"); //missing information
            return;
        }
        let dbUser = await User.findOne({ email });
        if (dbUser) {
            res.status(401).send("something went wrong"); // user already exist
            return;
        }
        let dbUserName = await User.findOne({ username });
        if (dbUserName) {
            return res.status(401).send({
                "status": "3",
            }); // userName already exist
        }

        //hashing password and storing it in db
        const hashedPassword = await bcrypt.hash(password, 10);

        const createdUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        res.status(200).send({
            "status": "200",
        });
    }
    catch (err) {
        res.status(500).send("something went wrong")
    }
}

export const login = async (req, res) => {
    let { username, password } = req.body;
    // console.log(username,password);
    if (!username || !password) {
        res.status(403).send({
        })
        return;
    }
    let dbUser = await User.findOne({ username });

    if (!dbUser) {
        res.status(404).send({
        })
        return;
    }
    bcrypt.compare(password, dbUser.password, (err, result) => {
        if (err) throw err;
        if (result) {
            let token = jwt.sign({
                username: dbUser.username,
                email: dbUser.email
            }, process.env.jwt_Secret);
            res.status(200).send({
                "status": "1",
                "token": token
            });
        } else {
            res.send({
                "status": "2",
            })
        }
    });
}

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp, password, username } = req.body;
        if (!email || !otp || !password || !username) {
            res.status(401).send("not enough data");
            return;
        }
        if (EmailToOtp.has(email)) {
            if (EmailToOtp.get(email) === Number(otp)) {
                let newUser = await createUser(username, email, password);
                if (newUser) {
                    EmailToOtp.delete(email);
                    res.status(200).send("OTP verified successfully and Account created");
                } else {
                    res.status(400).send("Something went wrong! :(");
                }
            }
            else {
                res.status(400).send("invalid Otp");
            }
        } else {
            res.status(400).send("unauthorized access");
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("something went wrong");
    }
}

export const usernameCheck = async (req, res) => {
    try {
        let { username } = req.body;
        let dbUser = await User.findOne({ username: username });
        if (dbUser) res.status(200).send({
            "status": "0",
        })
        else {
            res.status(200).send({
                "status": "1",
            })
        }
    } catch (error) {
        res.status(500).send("something went wrong");
    }
}


export const userList = async (req, res) => {
    try {
        const username = req.username;
        const dbUser = await User.findOne({ username });
        if (!dbUser) {
            return res.status(404).send({ error: "user not found!" })
        }

        const contacts = dbUser.contacts;
        const resUser = await User.find(
            { _id: { $in: contacts } },
            'username profilePic'
        );

        const groups = dbUser.groups;
        console.log("Groupd of User", groups)
        const resGrp = await Group.find(
            { users: dbUser._id },
            'name profilePic'
        );
        const onlineUsers = new Map(Object.entries(await redis.hgetall("onlineUsers")));
        resUser.forEach(contact => {
            contact.status = onlineUsers.has(contact.username) ? "Online" : "Offline";
        });

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
                        $cond: [
                            { $eq: ["$fromUser", username] },
                            "$toUser",
                            "$fromUser"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);
        const lastGroupMessage = await Message.aggregate([
            {
                $match: {
                    groupId: { $in: groups }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$groupId",
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);
        console.log("lastGroupMessage", lastGroupMessage)

        const lastMsgMap = {};
        lastMessages.forEach(m => {
            lastMsgMap[m._id] = m.lastMessage;
        });

        const lastGroupMsgMap = {};
        lastGroupMessage.forEach(g => {
            lastGroupMsgMap[g._id.toString()] = g.lastMessage;
        });

        const updatedContacts = resUser.map(contact => ({
            ...contact.toObject(),
            lastMessage: lastMsgMap[contact.username] || null
        }));

        const updatedGroups = resGrp.map(grp => ({
            ...grp.toObject(),
            isGroup: true,
            lastMessage: lastGroupMsgMap[grp._id.toString()] || null
        }));

        const response = [...updatedGroups, ...updatedContacts];

        res.json({ response });
    } catch (error) {
        console.error(error);
    }
};

export const search = async (req, res) => {
    try {
        const { query } = req.body;


        // Case-insensitive search for usernames starting with the query
        const users = await User.find({ username: new RegExp("^" + query, "i") })
            .limit(15)
            .select("username email profilePic");

        res.json(users);
    } catch (error) {
        console.error(error);
    }
}

export const profilePic = async (req, res) => {
    try {
        let username = req.username;
        let DBuser = await User.findOneAndUpdate(
            { username },
            {
                profilePic: req.file.path
            },
            { new: true }
        );
        res.json({
            url: req.file.path
        })
    } catch (error) {
        res.status(500).send("something went wrong");
    }
}

export const addContact = async (req, res) => {
    try {
        const username = req.username;
        const { contact } = req.body;

        if (!contact) {
            return res.status(400).send({ error: "contact which is username of the friend you want to add to your contact is required." })
        }
        const dbUser = await User.findOne({ username: contact });
        if (!dbUser) {
            return res.status(404).send({ error: "Could not find the contact to be added to your contacts" })
        }

        const curUser = await User.findOne({ username });

        if (username === contact) {
        }

        if (curUser.contacts.includes(dbUser._id)) {
        }

        curUser.contacts.push(dbUser._id);
        await curUser.save();

        res.send({ message: "User added successfully" })
    } catch (error) {
        console.error("Error in /addContact:", error);
    }
}

export const userInfo = async (req, res) => {
    try {
        let username = req.username;
        let dbUser = await User.findOne({ username }).select('-password');
        if (dbUser) {
            res.status(200).send(dbUser);
        }
    } catch (error) {
        res.status(500).send("something went wrong");
    }
}

export const subscribe = async (req, res) => {
    try {
        const { subscription } = req.body;
        const username = req.username;
        if (!subscription || !username || typeof subscription !== 'object') return res.status(400).send({ error: "Subscription and Username required to enbable notification" })
        console.log(`API hit ${subscription.endpoint} from User :${username}`)

        const dbUser = await User.findOneAndUpdate({ username }, { pushSubscription: subscription }, { new: true });

        if (!dbUser) return res.status(404).send({ error: "User not found" })
        console.log(`Subscription Update:${dbUser}`)
        return res.status(200).json({ success: true, message: "Subscription updated" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Something went wrong on the server while updating / creating notification subscription" })
    }
}

export const sendMail = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        console.log(`POST /sendOtp Route Hit`)
        console.log(`Email:${email} UserName:${username}, Password:${password}`)
        if (!email || !username || !password) {
            res.status(401).send("not enough data");
            return;
        }
        let DBuser = await User.findOne({
            $or: [{ username: username }, { email: email }]
        });
        if (DBuser) {
            res.status(400).send("something went wrong");
            return;
        }
        const OTP = crypto.randomInt(100000, 1000000);
        EmailToOtp.set(email, OTP);
        sendOtp(email, OTP);
        console.log(OTP);
        res.status(200).send(`OTP sent to user email:${email}`)
    } catch (error) {
        console.log(error);
        res.status(500).send(`something went wrong`)
    }
}