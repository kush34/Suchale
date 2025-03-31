import express from "express";
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();

router.post('/create', async (req,res)=>{
    try{
        //username
        //email
        //password
        //profile pic
        
        let {username,email,password} = req.body;

        if(!username || !email || !password ){
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
            res.status(401).send({
                "status":"3",
                "message":"username already taken"
            }); // userName already exist
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
            }) 
            console.log(createdUser);
            });
        });
        res.status(200).send({
            "status":"200",
            "message":"user created"
        });
    }
    catch(err){
        console.log(err.message);
        res.status(500).send("something went wrong")
    }
})


router.post('/usernameCheck', async (req,res)=>{
    try{
        let {username} = req.body;
        let dbUser = await User.findOne({username:username});
        if(dbUser) res.status(200).send({
            "status":"0",
            "message":"username not available"
        })
        else{
            res.status(200).send({
                "status":"1",
                "message":"username available"
            })
        }
    }catch(error){
        res.status(500).send("something went wrong");
    }
    
})


router.post('/login',async (req,res)=>{
    
    let {username,password} = req.body;
    console.log(username,password);
    if(!username || !password) {
        res.status(403).send({
            "message":"not enough resource"
        })
        return;
    }
    let dbUser = await User.findOne({username}).select("-password");
    
    if(!dbUser){
        res.status(404).send({
            "message":"something went wrong"
        })
        return;
    }

    let token = jwt.sign({
        username : dbUser.username,
        email : dbUser.email
    },process.env.jwt_Secret);

    res.status(200).send(token);
    
})


export default router;