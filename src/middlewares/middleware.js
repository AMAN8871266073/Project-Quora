const jwt = require('jsonwebtoken')
const Mongoose = require('mongoose')
//////////////////////////////////////////////////////////////////////
const isValid = function (value) {
    if (typeof value === 'undefined' || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
const isValidId = function (userId) {
    return Mongoose.isValidObjectId(userId)
}
////////////////////////////////////////////////////////////////////////////
const authenticator = function (req, res, next) {
    try {
        let id = req.params.userId
        if(!id){
            id=req.body.userId
        }
        let userId = id.trim()
        if (!(isValid(userId))) {
            return res.status(400).send({ 'msg': 'user id is required' })
        }
        if (!(isValidId(userId))) {
            return res.status(400).send({ 'msg': 'invalid user Id' })
        }
        let token = req.headers.authorization
        if (!token) {
            return res.status(400).send({ 'msg': 'token is required' })
        }
        let arr = token.split(" ")
        if (arr[0] == 'Bearer') {
            token = arr[1]
        }
        let decoded = jwt.verify(token, 'AmanTandon');
        if (decoded) {
            if (decoded.userId == userId) {
                next()
            } else {
                return res.status(402).send({ "msg": 'authentication failed' })
            }
        } else {
            return res.status(402).send({ 'msg': 'Authorization failed' })
        }
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}

module.exports.authenticator = authenticator