const userModel = require('../models/userModel')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const saltRounds = 10;

////////////////////////////////////////////////////////////////////////////////

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
    if (typeof value === 'undefined' || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidNumber = function (phone) {
    return /^[6-9]\d{9}$/.test(phone)
}
const isValidEmail = function (email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
////////////////////////////////////////////////////////////////////////////////////////////
const registrar = async function (req, res) {
    try {
        let requestBody = req.body
        let userData = {}
        const { fname, lname, email, phone, password,creditScore } = requestBody
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ 'msg': 'valid request Body is required' })
        }
        if (email) {
            let Email = email.trim()
            if (!isValid(Email)) {
                return res.status(400).send({ 'msg': "email is required" })
            }
            if (!(isValidEmail(Email))) {
                return res.status(400).send({ 'msg': 'invalid email Id' })
            }
            let isUniqueEmail = await userModel.findOne({ email: Email })
            if (isUniqueEmail) {
                return res.status(400).send({ 'msg': "email id already used" })
            }
            userData['email'] = Email
        }
        if (phone) {
            if (!(isValidNumber(phone))) {
                return res.status(400).send({ 'msg': 'invalid mobile number' })
            }
            let isUniquePhone = await userModel.findOne({ phone: phone })
            if (isUniquePhone) {
                return res.status(400).send({ 'msg': "phone number already used" })
            }
        }
        if(creditScore){
            if(creditScore<0){
                return res.status(400).send({'msg':'invalid credit score entered'})
            }
        }
        userData['creditScore'] = creditScore

        let firstName = fname.trim()
        if (!isValid(firstName)) {
            return res.status(400).send({ 'msg': "valid first name is required" })
        }
        userData['fname'] = firstName

        let lastName = lname.trim()
        if (!isValid(lastName)) {
            return res.status(400).send({ 'msg': "valid last name is required" })
        }
        userData['lname'] = lastName


        userData['phone'] = phone
        let passcode = password.trim()
        if (!isValid(password)) {
            return res.status(400).send({ 'msg': "password is required" })
        }
        if (!(passcode.length > 7 && passcode.length < 16)) {
            return res.status(400).send({ 'msg': 'invalid password length' })
        }
        const hash = bcrypt.hashSync(passcode, saltRounds)
        userData['password'] = hash
        const userDoc = await userModel.create(userData)
        if (userDoc) {
            return res.status(202).send({ 'msg': 'user registered successfully', 'user': userDoc })
        }
        return res.status(400).send({ 'status': false, 'msg': 'user not created successfully' })

    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
const logger = async function (req, res) {
    try {
        requestBody = req.body
        if (!(isValidRequestBody(requestBody))) {
            return res.status(400).send({ 'msg': 'request body is required' })
        }
        if (!(isValid(requestBody.email))) {
            return res.status(400).send({ "msg": "password is required" })
        }
        if (!(isValidEmail(requestBody.email))) {
            return res.status(400).send({ "msg": "email is invalid" })
        }
        if (!(isValid(requestBody.password))) {
            return res.status(400).send({ "msg": "password is required" })
        }
        if (!(requestBody.password.length > 7 && requestBody.password.length < 16)) {
            return res.status(400).send({ 'msg': 'invalid password length' })
        }
        let email = requestBody.email
        let userByEmail = await userModel.findOne({email: email })
        if (userByEmail) {
            let hash = userByEmail.password
            if (!(bcrypt.compareSync(requestBody.password, hash))) {
                return res.status(400).send({ 'msg': 'wrong password' })
            }
            let userId = userByEmail._id
            let token = jwt.sign({ userId }, 'AmanTandon', { expiresIn: (60 * 60) / 2 })
            if (token) {
                res.status(200).send({ 'token': token, 'userId': userId })
            }
        } else {
            return res.status(404).send({ 'msg': 'user not found with this email Id' })
        }
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////
const detailor = async function (req, res) {
    try {
        let id = req.params.userId
        let userProfile = await userModel.findOne({_id: id })
        if (userProfile) {
            return res.status(200).send({ 'user profile': userProfile })
        }
        return res.status(404).send({ 'msg': 'user does not exist with this id' })
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////
const userUpdator = async function (req, res) {
    try {
        let userId = req.params.userId
        isUserExist = await userModel.findOne({_id: userId })
        if (!isUserExist) {
            return res.status(404).send({ 'msg': 'userDoesnot exist with this user Id' })
        }
        let query = req.query

        let data = {}
        let { fname, lname, email, phone } = query
        if (fname) {
            let firstName = fname.trim()
            if (!isValid(firstName)) {
                return res.status(400).send({ 'msg': "valid first name is required" })
            }
            data['fname'] = firstName
        }

        if (lname) {
            let lastName = lname.trim()
            if (!isValid(lastName)) {
                return res.status(400).send({ 'msg': "valid last name is required" })
            }
            data['lname'] = lastName
        }

        if (email) {
            let Email = email.trim()
            if (!isValid(Email)) {
                return res.status(400).send({ 'msg': "email is required" })
            }
            if (!(isValidEmail(Email))) {
                return res.status(400).send({ 'msg': 'invalid email Id' })
            }
            let isUniqueEmail = await userModel.findOne({ email: Email })
            if (isUniqueEmail) {
                return res.status(400).send({ 'msg': "email id already used" })
            }
            data['email'] = Email
        }
        if (phone) {
            if (!(isValidNumber(phone))) {
                return res.status(400).send({ 'msg': 'invalid mobile number' })
            }
            let isUniquePhone = await userModel.findOne({ phone: phone })
            if (isUniquePhone) {
                return res.status(400).send({ 'msg': "phone number already used" })
            }
            data['phone'] = phone
        }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ 'msg': 'nothing to update' })
        }
        
        let updatedUser = await userModel.findOneAndUpdate({ _id: userId }, data, { new: true })
        
        if (updatedUser) {
            return res.status(200).send({ 'msg': 'user updated successfully', "updated": updatedUser })
        }
        return res.status(400).send({ 'msg': 'user not updated successfully' })
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
//////////////////////////////////////////////////////////////////


module.exports = { registrar, logger, detailor, userUpdator }