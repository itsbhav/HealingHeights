const router=require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
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
    const newUser = await User.create({
      username: req.body.username,
      password: await bcrypt.hash(req.body.password, 10),
    })
    console.log(`New User ${req.body.username} created!`);
    newUser.password = "";
    res.cookie('userinfo', newUser, { httpOnly: true,  expires:0 });
    //put sameSite:None while deployment
    res.render("dashboard", { newUser });
  } 
  catch (err) {
    res.sendStatus(500);
  }
};
router.get("/",(req,res)=>{
    res.render("register");
})
.post("/",handleNewUser)
module.exports=router;