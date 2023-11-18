const router=require("express").Router();
const User=require("../models/user")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require('uuid');
const loginUser = async (req, res,next) => {
    if (!req?.body?.username||!req?.body?.password) {
        res.status(400).json({ "message": "username and password are required" });
    }
    const getUser = await User.findOne({ username: req.body.username }).exec();
    // console.log(getUser);
    if (!getUser) {
        return res.sendStatus(401);
    }
    const match = await bcrypt.compare(req.body.password,getUser.password);
    if (match) {
        const x = uuidv4();
        getUser.uuid = x;
        await getUser.save();
        // console.log(getUser);
        const user = {
            id: getUser._id,
            uuid:getUser.uuid
        }
        res.cookie("userinfo",user,{httpOnly:true,expires:0})
        res.render("dashboard", { user });
    }
    else {
        res.sendStatus(401);
    }
}
router.get("/",(req,res)=>{
    res.render("login");
})
.post("/",loginUser)

module.exports = router;
