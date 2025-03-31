import express from "express";
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/create', async (req,res)=>{
    try{
        //username
        //email
        //password
        //profile pic
        
        let {username,email,password,profilepic} = req.body;

        if(!username || !email || !password || !profilepic ){
            res.status(403).send("not enough data"); //missing information
            return;
        }
        let dbUser = await User.findOne({email});
        if(dbUser){
            res.status(401).send("something went wrong"); // user already exist
            return;
        }
        let dbUserName = await User.findOne({username});
        if(dbUserName){
            res.status(401).send("username already exits"); // userName already exist
            return;
        }

        //hashing password and storing it in db
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt,async  (err, hash) => {
            if (err) throw err;
            
            let createdUser = await User.create({
                username,
                email,
                password:hash,
                profilePic:profilepic
            }) 
            console.log(createdUser);
            });
        });
        res.status(200).send("user created");
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("something went wrong")
    }
})

export default router;