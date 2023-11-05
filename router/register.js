const router=require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const handleNewUser = async (req, res) => {
    console.log("hi")
    console.log(req.body.username);
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
    console.log(newUser);
    res.status(201).json({ message: `user ${newUser.username} created! `});
  } 
  catch (err) {
    await errorLogger(err);
    res.sendStatus(500);
  }
};
router.get("/",(req,res)=>{
    res.render("register");
})
.post("/",handleNewUser)
module.exports=router;