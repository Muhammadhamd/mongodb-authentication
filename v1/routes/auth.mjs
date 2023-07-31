import express from "express";
const router = express.Router();
import path from "path";
import mongoose from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const __dirname = path.resolve();
const SECRET = process.env.SECRET || "topsecret";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true
    }
})

const Usermodel = mongoose.model('Users' , userSchema)

router.post("/register", async (req, res) => {
    const { newPassword, newFullName, newUserName, newEmail } = req.body;
  
    console.log(`data:{
      ${newPassword} ,
      ${newUserName} ,
      ${newEmail} ,
      ${newFullName}
    }`);
  
    if (!newPassword || !newUserName || !newEmail || !newFullName) {
      res.status(400).send(
        `required fields missing, request example: 
        {
          "firstName": "John",
          "lastName": "Doe",
          "email": "abc@abc.com",
          "password": "12345"
        }`
      );
      return;
    }
  
    try {
      const user = await Usermodel.findOne({ $or: [{ email: newEmail }, { username: newUserName }] });
  
      if (user) {
        // User with provided email or username found
        console.log("user already exists: ", user);
        res.status(400).send({ message: "User already exists. Please try a different email or username." });
        return;
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        console.log("Hashed Password:", hashedPassword);
  
        await Usermodel.create({
          username: newUserName,
          name: newFullName,
          email: newEmail,
          password: hashedPassword,
        });
  
        console.log(Usermodel);
        res.status(201).json({ message: "User registered successfully." });
      }
    } catch (error) {
      console.error("Error during user registration:", error);
      res.status(500).json({ error: "Failed to register user." });
    }
  });

 
router.post("/login", async (req, res) => {
  const { userAddress, userPassword } = req.body;

  try {
    const data = await Usermodel.findOne(
      { $or: [{ email: userAddress }, { username: userAddress }] },
      "username name email password"
    );

    if (!data) {
      console.log("User not found");
      return res.status(401).send({ message: "Incorrect email or password" });
    }

    const isMatch = await bcrypt.compare(userPassword, data.password);

    if (isMatch) {
      console.log("Password matches");

      const token = jwt.sign({
        _id: data._id,
        email: data.email,
        iat: Date.now() / 1000 - 30,
        exp: Date.now() / 1000 + (60 * 60 * 24),
      }, SECRET);
      console.log('token', token);

      res.cookie('token', token, {
        maxAge: 86_400_000,
        httpOnly: true,
      });

      res.send({
        message: "Login successfully",
        profile: {
          email: data.email,
          username: data.username,
          name: data.name
        }
      });
    } else {
      console.log("Password did not match");
      return res.status(401).send({ message: "Incorrect email or password" });
    }
  } catch (err) {
    console.log("DB error:", err);
    res.status(500).send({ message: "Login failed, please try later" });
  }
});


router.get("/registration",(req ,res ,next)=>{
    
    res.sendFile(path.join(__dirname , "public/auth.html"))
})

export default router