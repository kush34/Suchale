import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    fromUser:{
        type:String,
        required:true,
    },
    toUser:{
        type:String,
        required:true,
    },
    content:String,
    read: { type: Boolean, default: false }
},{
    timestamps:true,
})

const Message = new mongoose.model('Message',messageSchema);

export default Message;