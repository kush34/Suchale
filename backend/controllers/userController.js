import User from '../models/userModel.js';
import crypto from "crypto"
import { createUser } from "../controllers/createUser.js"
import { sendOtp } from "../controllers/sendOtp.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Group from "../models/groupModel.js";
import redis from "../utils/redis.js";

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
            res.status(401).send({
                "status": "3",
                "message": "username already taken"
            }); // userName already exist
            return;
        }

        //hashing password and storing it in db
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) throw err;

                let createdUser = await User.create({
                    username,
                    email,
                    password: hash,
                })
                console.log(createdUser);
            });
        });
        res.status(200).send({
            "status": "200",
            "message": "user created"
        });
    }
    catch (err) {
        console.log(err.message);
        res.status(500).send("something went wrong")
    }
}

export const login = async (req, res) => {
    let { username, password } = req.body;
    // console.log(username,password);
    if (!username || !password) {
        res.status(403).send({
            "message": "not enough resource"
        })
        return;
    }
    let dbUser = await User.findOne({ username });

    if (!dbUser) {
        res.status(404).send({
            "message": "something went wrong"
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
                "message": "login successful",
                "token": token
            });
        } else {
            res.send({
                "status": "2",
                "message": "invalid credentials"
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
            "message": "username not available"
        })
        else {
            res.status(200).send({
                "status": "1",
                "message": "username available"
            })
        }
    } catch (error) {
        res.status(500).send("something went wrong");
    }
}
export const userList = async (req, res) => {
    let username = req.username;
    let dbUser = await User.findOne({ username });
    if (!dbUser) {
        res.status(404).send({
            "message": "user not found"
        })
    }
    else {
        // res.status(200).send({
        //     "contacts":dbUser.contacts
        // });
        const contacts = dbUser.contacts;
        const resUser = await User.find(
            { _id: { $in: contacts } },
            'username profilePic',
        );
        const groups = dbUser.groups;
        const resGrp = await Group.find(
            { users: dbUser._id },
            'name profilePic'
        );
        // console.log(`Groups:${resGrp}`)
        const onlineUsers = new Set(await redis.smembers("online_users"));
        resUser.forEach(contact => {
            contact.status = onlineUsers.has(contact.username) ? "Online" : "Offline";
        });

        const updatedGroups = resGrp.map(grp => ({
            ...grp.toObject(),
            isGroup: true
        }));
        let response = [...updatedGroups, ...resUser]
        res.send({ response })
    }
}

export const search = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) return res.status(400).json({ message: "Query is required" });

        // Case-insensitive search for usernames starting with the query
        const users = await User.find({ username: new RegExp("^" + query, "i") })
            .limit(15)
            .select("username email");

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
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

        const dbUser = await User.findOne({ username: contact });
        if (!dbUser) return res.status(404).json({ message: "User does not exist" });

        const curUser = await User.findOne({ username });
        if (!curUser) return res.status(404).json({ message: "Current user not found" });

        if (username === contact) {
            return res.status(400).json({ message: "Cannot add yourself as a contact" });
        }

        if (curUser.contacts.includes(dbUser._id)) {
            return res.status(400).json({ message: "User already in contacts" });
        }

        curUser.contacts.push(dbUser._id);
        await curUser.save();

        res.status(200).json({ message: "Contact added successfully" });

    } catch (error) {
        console.error("Error in /addContact:", error);
        res.status(500).json({ message: "Internal server error" });
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
        console.log(`API hit ${subscription.endpoint} from User :${username}`)
        if (!subscription || !username) return res.status(400).send({ error: "Subscription and Username required to enbable notification" })

        const dbUser = await User.findOneAndUpdate({ username }, { pushSubscription: subscription }, { new: true });

        if (!dbUser) return res.status(404).send({ error: "User not found" })
        res.status(201).json({ message: "Updated Subscription" });
        console.log(`Subscription Update:${dbUser}`)
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Something went wrong on the server while updating / creating notification subscription" })
    }
}