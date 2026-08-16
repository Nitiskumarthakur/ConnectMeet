import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

export const register = async (req, res) => {
    const { name, username, password } = req.body.userData;
    // console.log(req.body.userData)
    try {
        const existingUser = await User.findOne({ username });
        // console.log(existingUser)
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "User already exits" });
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashPassword
        });
        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User Registered" });

    } catch (err) {
        res.json({ message: `Something wrong ${err}` });
    }
}

export const login = async (req, res) => {

    const { username, password } = req.body.userData;
    if (!username || !password) {
        return res.status(400).json({ message: "Please provide" });
    }
    try {
        const user = await User.findOne({username});
        if(!user){
            return res.status(401).json({message:"User not Found"});
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Password"
            });
        }
        //To generate the random token with 20 digit length in the String.
        let token = crypto.randomBytes(20).toString("hex");
        user.token = token;
        await user.save();
        return res.status(200).json({token, username, message: "User Login", });            

    } catch (err) {
        console.log("54: ",err);
        res.json({ message: `Something wrong ${err}` });
    }
}

export const addUserHinstory = async (req,res)=>{
    const {token, meetingCode} = req.body;
    try{
        const user = await User.findOne({token:token});

        //This line code not Needed, bacuase  I store token come to frontend using to useEffect.
        // if(!user){
        //     return res.status(404).json(({message:"User not Found!"}));
        // }

        const meeting_code = await Meeting.findOne({meetingCode:meetingCode});
        if(meeting_code){
            return res.status(409).json({message:"meetingCode already Exists!"});
        }

        const newMeeting = new Meeting({
            user_id:user.username,
            meetingCode:meetingCode
        });
        await newMeeting.save();
        res.status(201).json({message:"User history Added!"})
    }catch(e){
        res.status(500).json({message:`Someting went wrong ${e}`});
    }
}

export const getUserHistory = async(req, res)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    // console.log(token);
    try{
        const user = await User.findOne({token:token});
        const history = await Meeting.find({user_id:user.username});
        res.status(201).json({history});
    }catch(e){
        res.json({message:`Someting went wrong ${e}`});
    }
}