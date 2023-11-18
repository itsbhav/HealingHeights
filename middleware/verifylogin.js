const User = require("../models/user");
const mongoose = require('mongoose');
const verifyLogin = async (cookie) => {
    // const cookie = req.cookies;
    if (cookie?.userinfo) {
        if (cookie.userinfo?.id?.length) {
            const user = cookie.userinfo;
            if (cookie?.userinfo) {
                if (cookie.userinfo?.id?.length) {
                    const user = cookie.userinfo;
                    if (user?.uuid) {
                        const getUser = await User.findOne({ _id: new mongoose.Types.ObjectId(user.id) }).select('-password').exec();
                        if (!getUser || getUser.uuid != user.uuid) {
                            return { login: false };
                        }
                        return { login: true, getUser };
                    }
                }
            }
        }
    }
    return { login: false };
}
module.exports = { verifyLogin };