import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    profilePic: {
        type: String,
        required: true,
        default: "https://placehold.co/400x400"
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
},{timestamps:true});


const Group = mongoose.model('Group',groupSchema)

export default Group;