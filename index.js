const express= require("express")
const path = require('path')
const app = express()
const ejs = require("ejs");
const Dlist = require("./data/Doctor");
const { medDict } = require("./data/Medicine");
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req,res)=>{
    res.sendFile("index.html");
})

app.get("/home", (req,res)=>{
    res.redirect("/");
})

app.get("/signin", (req,res)=>{
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


app.listen(3000, ()=>{
    console.log("server started on port 3000");
})