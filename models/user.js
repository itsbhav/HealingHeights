const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        default:"Ram"
    },
    dob: {
        type: Date,
        required:true
    },
    city: {
        type:String
    },
    weight: {
        type:Number
    },
    height: {
        type:Number
    },
    isDiabetic: {
        type: Boolean
    },
    diseases: [{
        type: String
    }],
    otherComments: [
        {
            type:String
        }
    ],
    activeAppointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Appointment'
    }],
    inactiveAppointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Appointment'
    }],
    cancelledAppointments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Appointment'
    }]


})


module.exports = mongoose.model('User', userSchema);