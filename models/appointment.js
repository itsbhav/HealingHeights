const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    hospitalOrDoctor: {
        type: String,
        required: true
    },
    date: {
        type: Date
    },
    slotStart: {
        type:Number,
    },
    address: {
        type: String,
        default:""
    },
    symptoms:{
            type: String,
    },
    contact: {
        type: String,
        required:true
    },
    email: {
        type:String
    },
    status: {
        type: String,
        default: "active",
        required:true
    },
    prescriptions: [{
        type: String
    }],
    comments: [
        {type:String}
    ]

})


module.exports = mongoose.model('Appointment', appointmentSchema);