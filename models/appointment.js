const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
    name: {
        type: String,
        required:true
    },
    hospitalOrDoctor: {
        type: Number,
        default: -1,
        required: true
    },
    date: {
        type: Date
    },
    slotStart: {
        type:Number,
    },
    address: {
        type: String
    },
    symptoms:
        {
            type: String,
            required:true
    },
    contact: {
        type: String,
        required:true
    },
    email: {
        type:String
    }

})


module.exports = mongoose.model('Appointment', appointmentSchema);