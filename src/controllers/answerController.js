const answerModel = require('../models/answerModel')
const mongoose = require("mongoose")
const questionModel = require('../models/questionModel')
const userModel= require('../models/userModel')

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
    if (typeof value === 'undefined' || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}
let isValidId = function (id) {
    return mongoose.isValidObjectId(id)
}
const create_answer = async function (req, res) {
    try {
        let requestBody = req.body
        let uId = requestBody.userId
        let isUserExist=await userModel.findOne({_id:uId})
        if(!isUserExist){
            return res.status(404).send({'msg':'user doesnot exist with given id'})
        }
        let newCreditScore=isUserExist.creditScore+200
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ 'msg': 'invalid request body' })
        }
        let qId = requestBody.questionId
        if (!qId) {
            return res.status(400).send({ 'msg': "question Id is required" })
        }
        if (!isValidId(qId)) {
            return res.status(400).send({ 'msg': 'invalid question Id' })
        }
        isQuestionExist=await questionModel.findOne({_id:qId,isDeleted:false})
        if(!isQuestionExist){
            return res.status(404).send({'msg':'question not found with given question id'})
        }
        if(isQuestionExist){
            let questionerId=isQuestionExist.askedBy
            if(questionerId==uId){
                return res.status(400).send({'msg':'questioner is not allowed to answer'})
            }
        }
        let answer = requestBody.text.trim()
        if (!isValid(answer)) {
            return res.status(400).send({ 'msg': 'please provide answer' })
        }
        let doc = {
            answeredBy: uId,
            text: answer,
            questionId: qId
        }
        let answerDoc = await answerModel.create(doc)
        if (answerDoc) {
        let updatedUser=await userModel.findOneAndUpdate({_id:uId},{creditScore:newCreditScore})
            return res.status(202).send({ 'answered': answerDoc })
        }
        return res.status(401).send({ 'msg': 'answer not registered successfully' })
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////
const find_answer_by_question = async function (req, res) {
    try {
        let questionId = req.params.questionId
        if (!questionId) {
            return res.status(400).send({ 'msg': "question Id is required" })
        }
        if (!isValidId(questionId)) {
            return res.status(400).send({ 'msg': 'invalid question Id' })
        }
        let answerList = await answerModel.find({ questionId: questionId,isDeleted:false }).select({text:1,_id:0}).sort({createdAt:-1})
        if (answerList.length > 0) {
            return res.status(200).send({ 'answers': answerList })
        }return res.status(404).send('answer not found for given questions')
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////
const update_answer=async function(req,res){
    try{
        let userId = req.body.userId
        let answerId = req.params.answerId
        let query=req.query
        if (!isValidRequestBody(query)) {
            return res.status(400).send({ 'msg': 'invalid query' })
        }
        let updatedAnswer=query.answer.trim()
        if (!isValid(updatedAnswer)) {
            return res.status(400).send({ 'msg': 'please provide answer' })
        }
        if (!answerId) {
            return res.status(400).send({ 'msg': 'answer id is required' })
        }
        if (!(mongoose.isValidObjectId(answerId))) {
            return res.status(400).send({ 'msg': 'invalid answer id' })
        }
        let document = await answerModel.find({ _id: answerId,isDeleted:false })
        if (!document) {
            return res.status(404).send({ 'msg': "answer not found with given id" })
        }
        let answeredBy = document.answeredBy
        if (!(answeredBy == userId)) {
            return res.status(401).send('unauthenticated access denied')
        }
        let updated=await answerModel.findOneAndUpdate({_id:answerId,isDeleted:false},{text:updatedAnswer},{new:true})
        if(updated){
            return res.status(201).send({'msg':"answer updated successfully"})
        }
        return res.status(400).send({'msg':'answer not updated successfully'})
    }catch(err){
        return res.status(500).send({'error':err})
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////
const delete_answer=async function(req,res){
    try{
        let userId = req.body.userId
        let answerId = req.params.answerId
        if (!isValidRequestBody(req.body)) {
            return res.status(400).send({ 'msg': 'invalid request body' })
        }
        if (!answerId) {
            return res.status(400).send({ 'msg': 'answer id is required' })
        }
        if (!(mongoose.isValidObjectId(answerId))) {
            return res.status(400).send({ 'msg': 'invalid answer id' })
        }
        if (!userId) {
            return res.status(400).send({ 'msg': 'answer id is required' })
        }
        if (!(mongoose.isValidObjectId(userId))) {
            return res.status(400).send({ 'msg': 'invalid answer id' })
        }
        let document = await answerModel.findOne({ _id: answerId,isDeleted:false })
        if (!document) {
            return res.status(404).send({ 'msg': "answer not found with given id" })
        }
        let answeredBy = document.answeredBy
        if (!(answeredBy == userId)) {
            return res.status(401).send('unauthenticated access denied')
        }
        let updated=await answerModel.findOneAndUpdate({_id:answerId,isDeleted:false},{isDeleted:true},{new:true})
        if(updated){
            return res.status(201).send({'msg':"answer deleted successfully"})
        }
        return res.status(400).send({'msg':'answer not deleted successfully'})
    }catch(err){
        return res.status(500).send({'error':err})
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = { create_answer,find_answer_by_question, update_answer, delete_answer }