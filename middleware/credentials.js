const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "https://www.twitter.com",
    "https://www.google.com" 
];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        }
        else {
            callback(new Error("Error by CORS"));
        }
    },
    credentials:true,
    optionsSuccessStatus: 200
}