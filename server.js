const mongoose=require("mongoose");
const express=require("express");
const cors=require("cors");
const multer=require("multer");
const jwt=require("jsonwebtoken");
const bcrypt=require("bcrypt");
const dotenv=require("dotenv");
const path=require("path");

dotenv.config();
let app=express();
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      
      cb(null,`${Date.now()}_${file.originalname}`);
    },
  });
  
  const upload = multer({ storage: storage });

  app.use('/uploads', express.static('uploads'));
  app.use(express.static(path.join(__dirname,"./client/build")));

let connectedToDB=async()=>{
  try{
    await mongoose.connect(process.env.mdburl);
    console.log("Successfully connected to MDB");
  }catch(err){
    console.log("Unable to connect MDB");
}
}; 
let usersSchema=new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    passWord:String,
    age:Number,
    profilePic:String,
});
let User=new mongoose.model("user",usersSchema);

let authoriseUser=(req,res,next)=>{
    console.log("Authorise user");
    next();
};
app.use(authoriseUser);

app.post("/signup",upload.single("profilePic"),async(req,res)=>{
console.log("received data");
console.log(req.body);
console.log(req.file);

let hashedPassword=await bcrypt.hash(req.body.passWord,10);

try{
    let newUser=new User({
      firstName:req.body.firstName, 
      lastName:req.body.lastName,
      email:req.body.email,
      passWord:hashedPassword,
      age:req.body.age,
      profilePic:req.file.path,
    });

 let userData=await User.find().and({email:req.body.email})   

 if(userData.length>0){
  res.json({status:"Failure",msg:"User account already exists"});
 }else{
  await User.insertMany([newUser]);
 console.log("User created successfully");

 res.json({status:"Success",msg:"User created successfully"});
 }
}catch(err){
console.log("Unable to insert user into DB");

res.json({status:"Failure",msg:"Unable to create user"});

};
});

app.post("/validateLogin",upload.none(),async(req,res)=>{

    let userData=await User.find().and({email:req.body.email});

    if(userData.length>0){
      let isPasswordCorrect=await bcrypt.compare(req.body.passWord,userData[0].passWord)
      if(isPasswordCorrect===true){

       let encryptedCredentials=jwt.sign({email:userData[0].email,passWord:userData[0].passWord},"JGM");

         console.log(encryptedCredentials);

       res.json({
        status:"Success",
        data:userData,
        token:encryptedCredentials,
      });
      }else{
        res.json({status:"Failure",msg:"Invalid password"});
      }
    }else{
    res.json({status:"Failure",msg:"Invalid Username"});
}
    // res.json(["dummy"]);
});

app.post("/validateToken",upload.none(),async(req,res)=>{

console.log(req.body);

try{
  let decryptedCredentials=jwt.verify(req.body.token,"JGM");
  console.log(decryptedCredentials);

  let userDetails=await User.find().and({email:decryptedCredentials.email});
  
  console.log(userDetails);
  
  if(userDetails.length>0){
    if(userDetails[0].passWord==decryptedCredentials.passWord){
      res.json({status:"Success",data:userDetails});
    }else{
      res.json({status:"Failure",msg:"Invalid Password"});
    }
  }else{
    res.json({status:"Failure",msg:"Invalid Token"});
  }
}catch(err){
res.json({status:"Failure",msg:"Invalid Token"});
}
});

app.patch("/editProfile",upload.single("profilePic"),async(req,res)=>{
try{

 if(req.body.firstName.length>0){
  await User.updateMany(
    {email:req.body.email},
    {
      firstName:req.body.firstName,
    }
  );
 }
 
 if(req.body.lastName.length>0){
  await User.updateMany(
    {email:req.body.email},
    {
      lastName:req.body.lastName,
    }
  );
 }

 if(req.body.passWord.length>0){
  await User.updateMany(
    {email:req.body.email},
    {
      passWord:req.body.passWord,
    }
  );
 }
 if(req.body.age.length>0){
  await User.updateMany(
    {email:req.body.email},
    {
      age:req.body.age,
    }
  );
 }
 if(req.file.path.length>0){
  await User.updateMany(
    {email:req.body.email},
    {
      profilePic:req.file.path,
    }
  );
 }
  res.json({status:"Success",msg:"User details updated successfully"});

}catch(err){
  console.log(err);

  res.json({status:"Failure",msg:"Unable to updated details"});
}
  
});

app.delete("/deleteUser",async(req,res)=>{
try{
  await User.deleteMany({email:req.query.email});
  res.json({status:"Success",msg:"User deleted successfully"});
}catch(err){
  res.json({status:"Failure",msg:"Unable to delete user"});
}
})

app.listen(process.env.port,()=>{
    console.log("Listen to port 2000");
})
connectedToDB();