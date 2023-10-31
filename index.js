const express= require("express")
const path = require('path')
const app=express()
app.use(express.static("public"));

app.listen(3000, ()=>{
    console.log("server started on port 3000");
})

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
    res.redirect("/");
})

app.get("/symptom_analyzer", (req,res)=>{
    res.redirect("/");
})

app.get("/book_your_visit", (req,res)=>{
    res.redirect("/");
})

app.get("/blood_reserves", (req,res)=>{
    res.redirect("/");
})

app.get("/signin", (req,res)=>{
    res.redirect("/");
})