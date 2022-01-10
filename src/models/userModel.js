const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    lname: {
        type: String,
        required:true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            }, message: 'email should be a valid email id'
        }
    },
    phone: {
        type: String,
        unique: true,
        sparse:true,
        //default:false,
         validate: {
            validator: function (phone) {
                //if(phone==false)return true
                return /^[6-9]\d{9}$/.test(phone)
            }, message: 'invalid mobile number'
        }
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    creditScore:{type:Number,
        min:0,
        default:500
    }
}, { timestamp: true })
module.exports = mongoose.model('quoraUser', userSchema)