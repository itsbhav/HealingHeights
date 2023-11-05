require("dotenv").config()
const express= require("express")
const path = require('path')
const app = express()
const ejs = require("ejs");
const cookieParser = require('cookie-parser');
const Dlist = require("./data/Doctor");
const { medDict } = require("./data/Medicine");
const mongoose = require("mongoose");
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
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/signin",require("./router/login"));
app.use("/register",require("./router/register"));

app.get("/", (req,res)=>{
    res.sendFile("index.html");
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

app.get("/symptom_analyzer", (req,res)=>{
    res.redirect("/");
})

app.get("/book_your_visit", (req, res) => {
    const data = { data: Dlist.list };
    res.render("appointment",{data})
})

app.post("/book_your_visit", (req, res) => {
    res.json({ Hello: "hello" });
})

app.get("/blood_reserves", (req,res)=>{
    res.redirect("/");
})



mongoose.connection.once("open", () => {
    console.log("connected to MongoDB");
    app.listen(3000, () => {
    console.log("server running at Port 3000")
});
})