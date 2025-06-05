import { User } from "../models/user.models.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";

export const signUp = async (req, res) => {
    const {email, password,name } = req.body;

    try{
        if(!email || !password || !name){
            throw new Error('All fields are required');
        }
        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success:false, message: 'User already exists'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = generateVerificationCode();

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

    }catch(error){
        res.status(400).json({success: false, message: error.message})
    }
};

export const logIn = (req, res) => {
  res.send("login Route");
};

export const logOut = (req, res) => {
  res.send("logout Route");
};
