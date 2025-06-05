import { User } from "../models/user.models.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import bcryptjs from "bcryptjs";

export const signUp = async (req, res) => {
    const {email, password,name } = req.body;

    try{
        if(!email || !password || !name){
            throw new Error('All fields are required');
        }
        const userAlreadyExists = await User.findOne({email});
        console.log("userAlreadyExists", userAlreadyExists)

        if(userAlreadyExists){
            return res.status(400).json({success:false, message: 'User already exists'})
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = generateVerificationCode();

        const user = new User({
          email,
          password: hashedPassword,
          name,
          verificationToken,
          verificationTokenExpireAt: Date.now() + 24 * 60 *60 *1000
        });

        await user.save();

        //jwt
        generateTokenAndSetCookie(res, user._id);
        sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
          success: true,
          message: "User created successfully",
          user: {
            ...user._doc,
            password:undefined
          }
        })
    }catch(error){
        res.status(400).json({success: false, message: error.message})
    }
};

export const logIn = async (req, res) => {
  const {email, password} = req.body;
  try{
    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({success: false, message: "Invalid credentials"});
    }
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(400).json({success: false, message: "Invalid credentials"});
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  }catch(error){

  }
};

export const logOut = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({success: true, message: "Logged out successfully"});
};
