import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    fromUser:{
        type:String,
        required:true,
    },
    toUser:{
        type:String,
    },
    groupId:{
        type:mongoose.Schema.Types.ObjectId
    },
    content:String,
    read: { type: Boolean, default: false }
},{
    timestamps:true,
})

const Message = new mongoose.model('Message',messageSchema);

export default Message;