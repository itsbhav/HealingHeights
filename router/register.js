const router=require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const Appointment = require("../models/appointment");
const handleNewUser = async (req, res,next) => {
  if (!req?.body?.username || !req?.body?.password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }
  // finding Duplicate
  const duplicate = await User.findOne({ username: req.body.username }).exec();
  if (duplicate) return res.sendStatus(409);
  try {
    const x =uuidv4();
    const newUser = await User.create({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
      uuid: x,
      name: req.body.name,
      dob: req.body.dob,
      city:req.body.city
    })
    console.log(`New User ${req.body.username} created!`);
    const user = {
            id: newUser._id,
            uuid:newUser.uuid
        }
   const appointments = await Appointment.find({ userId: newUser._id });
   res.cookie("userinfo",user,{httpOnly:true,expires:0})
   res.render("dashboard", { user:newUser, appointments:appointments});
  } 
  catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};
router.get("/",(req,res)=>{
    res.render("register");
})
.post("/",handleNewUser)
module.exports=router;