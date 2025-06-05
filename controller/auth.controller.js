import { User } from "../models/user.models.js";

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

        const hashedPassword = await bcrypt.hash(password, 10)
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
