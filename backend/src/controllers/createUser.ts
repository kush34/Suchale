import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/userModel";

export const createUser = async (username,email,password)=>{
    try{
        if(!username || !password || !email) return false;
        let dbUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (dbUser){
            console.log("user already exists")
            return false;
        }
          
        const hash = await bcrypt.hash(password,10);
        let newDBuser = await User.create({
            username,
            email,
            password:hash
        })
        return newDBuser || false;
        
    }catch(error){
        console.log(error);
        return false;
    }
}