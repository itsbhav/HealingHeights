require("dotenv").config()
const express= require("express")
const path = require('path')
const app = express()
const ejs = require("ejs");
const cors=require('cors')
const Dlist = require("./data/Doctor");
const { medDict } = require("./data/Medicine");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
const corsOptions=require("./middleware/credentials");
const Appointment = require("./models/appointment");
const User = require('./models/user');
const { verifyLogin } = require('./middleware/verifylogin');
const { count } = require("console");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
        })
    } catch (err) {
        console.error(err);
    }
}
connectDB()
app.use(cors(corsOptions))
app.use((req, res, next) => {
    res.header("Allow-Access-Control-Credentials", true);
    next();
});
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/signin", require("./router/login"));
app.use("/register", require("./router/register"));

app.get("/", async(req,res)=>{
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    // console.log(loginValidation.getUser);
    if (loginValidation.login) {
        const appointments = await Appointment.find({ userId: loginValidation.getUser._id });
        return res.render('dashboard', { cookieData: cookie.userinfo, user: loginValidation.getUser, appointments: appointments })
    }
    res.sendFile(path.join(__dirname,"public","index1.html"));
})
app.get("/blood_reserves", (req,res)=>{
    res.sendFile(path.join(__dirname,"public","blood_reserves.html"));
})
app.get("/home", (req,res)=>{
    res.redirect("/");
})

app.get("/healing_heights", (req,res)=>{
    res.redirect("/");
})

app.get("/pharmacy", (req,res)=>{
    res.render("pharmacy",{data:medDict});
})
app.get("/pharmacy/:id", (req, res) => {
    res.json({Hello:"Medicine "+`${req.params.id}`})
})

app.get("/book_your_visit", async (req, res) => {
     const data = { data: Dlist.list };
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    if(loginValidation.login)return res.render('appointment',{data,userinfo:cookie.userinfo,cred:true})
    res.render("appointment", { data, userinfo:{id:"-1"},cred:false});
})

app.post("/book_your_visit", async (req, res) => {
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    if (loginValidation.login) { 
         const createAppointment = await Appointment.create(
             {
                userId: loginValidation.getUser._id,
                name: req.body.Name,
                hospitalOrDoctor: req.body.Hospital,
                date: req.body.date || new Date(),
                slotStart: req.body.freeSlots || 8,
                address: req.body.userAdd || "",
                symptoms: req.body.Symptoms,
                contact: req.body.tel,
                email: req.body.email || ""
                            }
                        );
            loginValidation.getUser.appointments.push(createAppointment._id);
            await loginValidation.getUser.save();
         const appointments = await Appointment.find({ userId: loginValidation.getUser._id });
        return res.render("dashboard", { cookieData:cookie.userinfo,user:loginValidation.getUser,appointments:appointments });
     }
    return res.sendStatus(401);          
})
app.get("/symptom_analyzer",async (req, res) => {
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    if (loginValidation.login) {
        const appointments = await Appointment.find({ userId: loginValidation.getUser._id });
        return res.render('dashboard', { cookieData: cookie.userinfo, user: loginValidation.getUser, appointments: appointments })
    }
    res.redirect("/signin");
})
app.get("/detailed_info", async (req, res) => {
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    if (loginValidation.login) return res.render('detailed_info', { user: loginValidation.getUser });
    res.redirect("/signin");
});
app.get("/edit", async (req, res) => {
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    if (loginValidation.login) return res.render('edit', { user: loginValidation.getUser });
    res.redirect("/signin");
})
app.post("/logout", async (req, res) => {
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    if (loginValidation.login) {
        loginValidation.getUser.uuid = "";
        await loginValidation.getUser.save();
        res.clearCookie('userinfo', { httpOnly: true, expires: 0 });
        console.log("user logged out");
    };
    res.redirect("/");
})
app.post("/edit", async (req, res) => {
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    if (loginValidation.login) {
        loginValidation.getUser.name = req.body.Name;
        await loginValidation.getUser.save();
        console.log(loginValidation.getUser);
        return res.render('detailed_info', { user: loginValidation.getUser })
    };
    res.redirect("/signin");
})
app.post('/cancel/:id', async (req, res) => {
    const id = req?.params?.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.sendStatus(404);
    const apt= await Appointment.findOne({ _id: id });
    apt.status = "cancelled";
    await apt.save();
    return res.redirect("/");
})
mongoose.connection.once("open", () => {
    console.log("connected to MongoDB");
    app.listen(3000, () => {
    console.log("server running at Port 3000")
});

})