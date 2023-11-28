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
const httpProxy = require('http-proxy');
const fs = require('fs');
const medicines = require("./data/Medicine.json");
const proxy = httpProxy.createProxyServer();
const Razorpay = require('razorpay');

const flaskBackendUrl = 'http://127.0.0.1:5000';
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
const razorpay = new Razorpay({
  key_id: 'your_razorpay_key_id',
  key_secret: 'your_razorpay_key_secret',
});
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
app.use('/static', async (req, res) => {
    // Forward static file requests to Flask
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    // console.log(loginValidation.getUser);
    if (loginValidation.login) {
      return proxy.web(req, res, { target: flaskBackendUrl });
    }
    return res.redirect("/signin");
});
app.post('/predict', async (req, res) => {
    const cookie = req.cookies;
    const loginValidation = await verifyLogin(cookie);
    // console.log(loginValidation.getUser);
    if (loginValidation.login) {
      return proxy.web(req, res, { target: flaskBackendUrl });
    }
    return res.redirect("/signin");
    
});
app.get('/pharmacy', (req, res) => {
  res.render('allMedicines', { medicines });
});
app.get('/pharmacy/:id', (req, res) => {
  const medicineId = parseInt(req.params.id);
  const medicine = medicines.find((med) => med.id === medicineId);
  res.render('medicineDetails', { medicine });
});

app.get("/search", (req, res) => {
    const filteredMedicines = medicines.filter(medicine => {
        const searchTerm = (req.query.search || '').toLowerCase();
        const matchName = medicine.name.toLowerCase().includes(searchTerm);
        const matchDescription = medicine.description.toLowerCase().includes(searchTerm);
        const matchUsage = medicine.usage.toLowerCase().includes(searchTerm);
        return matchName || matchDescription || matchUsage;
    });
    res.render("allMedicines", { medicines: filteredMedicines });
});

app.post('/addToCart/:id', (req, res) => {
  const medicineId = parseInt(req.params.id);
  const cart = req.cookies.cart || [];
  cart.push(medicineId);
  res.cookie('cart', cart);
  res.redirect('/pharmacy');
});

app.get('/cart', (req, res) => {
  const cart = req.cookies.cart || [];
  const cartMedicines = cart.map((id) => medicines.find((med) => med.id === id));
  res.render('cart', { cartMedicines });
});
app.post('/razorpay', async (req, res) => {
  const cart = req.cookies.cart || [];
  const cartMedicines = cart.map((id) => medicines.find((med) => med.id === id));

  const amountInPaise = cartMedicines.reduce((total, medicine) => {
    return total + Math.round(medicine.price * 100);
  }, 0);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: 'order_receipt',
    payment_capture: 1,
  };

  try {
      const response = await razorpay.orders.create(options);
      console.log(response);
    const orderId = response.id;
    res.render('razorpay', {  amount: amountInPaise });  //orderId, keyId: razorpay.key_id,
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).send(`Internal Server Error, Since Razorpay is not accepting new merchants as of now, will be activated at the earliest.`);
  }
});

app.post('/razorpay/success', (req, res) => {
  res.clearCookie('cart');
  res.render('success');
});

// Razorpay cancel route
app.get('/razorpay/cancel', (req, res) => {
  res.render('cancel');
});

app.get("/cash", (req, res) => {
    const cart = req.cookies.cart || [];
  const cartMedicines = cart.map((id) => medicines.find((med) => med.id === id));

  const amountInPaise = cartMedicines.reduce((total, medicine) => {
    return total + Math.round(medicine.price * 100);
  }, 0);
    res.render("cash", { amount: amountInPaise });
})
app.post("/cash", (req, res) => {
    const cart = req.cookies.cart || [];
    const cartMedicines = cart.map((id) => medicines.find((med) => med.id === id));
    var x = "Orders for \t";
    cartMedicines.forEach((med) => {
        x += `${med.id}, \t`
    });
    x += `recieved for ${req.body.Add} by ${req.body.name}\n`;
    fs.appendFileSync(path.join(__dirname, "data", "orders.txt"), x);
    res.clearCookie('cart');
    res.send("Done");
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
        return res.redirect("/static");
    }
   return res.redirect("/signin");
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
        loginValidation.getUser.dob = req.body.dob;
        loginValidation.getUser.city = req.body.city;
        loginValidation.getUser.weight = req.body.weight;
        loginValidation.getUser.height = req.body.height;
        loginValidation.getUser.isDiabetic = req.body.isDiabetic==="on"?"true":"false";
        loginValidation.getUser.bloodGroup = req.body.bloodGroup;
        loginValidation.getUser.diseases = req.body.diseases.split(',');
        loginValidation.getUser.otherComments = req.body.otherComments.split(',');
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
app.get("/request", (req, res) => {
    fs.readFile(path.join(__dirname, "data", "request.json"), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        // Step 2: Parse the JSON data
        const jsonData = JSON.parse(data);
       return  res.render("request",{data:jsonData});
    });
   
})
app.post("/request", (req, res) => {
    const newObject = {
  name: req.body.name,
  tel: req.body.tel,
  bloodGroup: req.body.bloodGroup,
  email: req.body?.email || ""
    };
    fs.readFile(path.join(__dirname,"data","request.json"), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Step 2: Parse the JSON data
        const jsonData = JSON.parse(data);

        // Step 3: Add the new object to the array
        jsonData.push(newObject);

        // Step 4: Write the updated data back to the file
        fs.writeFile(path.join(__dirname,"data","request.json"), JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Data added to reqlist.json successfully.');
            }
        });
         // res.redirect("/blood_reserves");
        return res.render("request", { data: jsonData });
    });
   
})
app.get("/donate", (req, res) => {
    fs.readFile(path.join(__dirname, "data", "request.json"), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        // Step 2: Parse the JSON data
        const jsonData = JSON.parse(data);
       return res.render("donate",{data:jsonData});
    });
})
app.post("/donate", (req, res) => {
    const newObject = {
        name: req.body.name,
        tel: req.body.tel,
        bloodGroup: req.body.bloodGroup,
        email: req.body?.email || ""
    };
    fs.readFile(path.join(__dirname, "data", "donate.json"), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        // Step 2: Parse the JSON data
        const jsonData = JSON.parse(data);

        // Step 3: Add the new object to the array
        jsonData.push(newObject);

        // Step 4: Write the updated data back to the file
        fs.writeFile(path.join(__dirname, "data", "donate.json"), JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Data added to reqlist.json successfully.');
            }
        });
        // res.redirect("/blood_reserves");
    });
    fs.readFile(path.join(__dirname, "data", "request.json"), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        // Step 2: Parse the JSON data
        const jsonData = JSON.parse(data);
        return res.render("donate", { data: jsonData });
    });
});
mongoose.connection.once("open", () => {
    console.log("connected to MongoDB");
    app.listen(3000, () => {
    console.log("server running at Port 3000")
});

})

proxy.on('error', (err, req, res) => {
    console.error(err);
    res.status(500).send('Proxy Error');
});
