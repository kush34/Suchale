import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import User from '../models/userModel.js';
import crypto from "crypto"
import { createUser } from "../controllers/createUser.js"
import { sendOtp } from "../controllers/sendOtp.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import upload from "../middlewares/multer.js";
import { onlineUsers } from "../index.js";
import Group from "../models/groupModel.js";
const router = express.Router();

const EmailToOtp = new Map();

router.post('/create', async (req, res) => {
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
})

router.post("/sendOtp", async (req, res) => {
    try {

        const { email, username, password } = req.body;
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
})
router.post('/verifyOtp', async (req, res) => {
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
                    EmailToOtp.delete(email); // after account creation
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
})
router.post('/usernameCheck', async (req, res) => {
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

})


router.post('/login', async (req, res) => {

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


})

router.get('/userList', verifyToken, async (req, res) => {
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
        resUser.forEach((contact) => {
            contact.status = onlineUsers.has(contact.username) ? "Online" : "Offline";
        });
        const updatedGroups = resGrp.map(grp => ({
            ...grp.toObject(),
            isGroup: true
        }));
        let response = [...updatedGroups, ...resUser]
        res.send({ response })
    }
})

router.post("/search", verifyToken, async (req, res) => {
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
});

router.post("/profilepic", verifyToken, upload.single('file'), async (req, res) => {
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
})
router.post('/addContact', verifyToken, async (req, res) => {
    try {
        const username = req.username;
        const { contact } = req.body;

        // Check if user to be added exists
        const dbUser = await User.findOne({ username: contact });
        if (!dbUser) return res.status(404).json({ message: "User does not exist" });

        // Get current user
        const curUser = await User.findOne({ username });
        if (!curUser) return res.status(404).json({ message: "Current user not found" });

        // Prevent adding oneself as a contact
        if (username === contact) {
            return res.status(400).json({ message: "Cannot add yourself as a contact" });
        }

        // Check if already a contact
        if (curUser.contacts.includes(dbUser._id)) {
            return res.status(400).json({ message: "User already in contacts" });
        }

        // Add to contacts
        curUser.contacts.push(dbUser._id);
        await curUser.save();

        res.status(200).json({ message: "Contact added successfully" });

    } catch (error) {
        console.error("Error in /addContact:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/userInfo", verifyToken, async (req, res) => {
    try {
        let username = req.username;
        let dbUser = await User.findOne({ username }).select('-password');
        if (dbUser) {
            res.status(200).send(dbUser);
        }
    } catch (error) {
        res.status(500).send("something went wrong");
    }

});

export default router;