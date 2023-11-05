const router=require("express").Router();
const User=require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const loginUser = async (req, res) => {
    if (!req?.body?.username||!req?.body?.password) {
        res.status(400).json({ "message": "username and password are required" });
    }
    const getUser = await User.findOne({ username: req.body.username }).exec();
    if (!getUser) {
        return res.sendStatus(401);
    } 
    const match = await bcrypt.compare(req.body.password,getUser.password);
    if (match) {
        // JWT Auth
        const accesToken = jwt.sign(
            {
                "userInfo": {
                    "username": getUser.username
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "55s" }
        );
        const refreshToken = jwt.sign(
            { "username": getUser.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
        );
        // Saving refreshToken
        getUser.refreshToken = refreshToken;
        const newInfo = await getUser.save();
        console.log(newInfo);
        // secure:true--->https
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite:'None',maxAge: 24 * 60 * 60 * 1000 });
        res.json({ accesToken });
    }
    else {
        res.sendStatus(401);
    }
}
router.get("/",(req,res)=>{
    res.render("login");
})
.post("/",loginUser)

module.exports=router;