import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
    user_id:{
        type:String,
        required:true,        
    },
    meetingCode:{
        type:String,
        unique:true,
        required:true
    },
    date:{
        type:Date,
        default: Date.now
    }
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export {Meeting};