const answerModel = require('../models/answerModel')
const questionModel = require('../models/questionModel')
const mongoose = require("mongoose")
const userModel = require('../models/userModel.js')

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValid = function (value) {
    if (typeof value === 'undefined' || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const create_question = async function (req, res) {
    try {
        requestBody = req.body
        let userId = req.params.userId
        let isUserExist=await userModel.findOne({_id:userId})
        if(!isUserExist){
            return res.status(404).send({'msg':'user doesnot exist with this user id'})
        }
        if(isUserExist){
            if(isUserExist.creditScore<100){
                return res.status(400).send({'msg':'user doesnot have minimum credit score to ask question','creditScore':isUserExist.creditScore})
            }
        }
        let newCreditScore=isUserExist.creditScore-100
        let data = {}
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ 'msg': 'valid request Body is required' })
        }
        if (!isValid(requestBody.description)) {
            return res.status(400).send({ 'msg': "valid first name is required" })
        }
        data['description'] = requestBody.description
        let tag = requestBody.tag
        if (!isValid(tag)) {
            return res.status(400).send({ 'msg': "valid first name is required" })
        }
        let arr = tag.split(" ")
        data['tag'] = arr
        data['askedBy'] = userId
        let question = await questionModel.create(data)
        if (question) {
            updateUserCredit=await userModel.findOneAndUpdate({_id:userId},{creditScore:newCreditScore})
            return res.status(202).send({ 'msg': "question posted successfully" })
        }
        return res.status(400).send("question not posted")
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////
const find_question = async function (req, res) {
    try {
        let query = req.query
        const { sort, tag } = query

        ////////// when query body is empty//////////////////////////////////////////
        if (!isValidRequestBody(query)) {
            let list = await questionModel.find({ isDeleted: false })
            let questArr = []
            if (list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                    let questObj = {}
                    let isAnswerExist = await answerModel.find({ questionId: list[i]._id, isDeleted: false }).select({ text: 1, _id: 0 }).sort({createdAt:-1})     //select({_id:0,questionId:0,answeredBy:0,isDeleted:0,createdAt:0,updatedAt:0})
                    if (isAnswerExist.length > 0) {
                        questObj['question'] = list[i].description
                        questObj['answer'] = isAnswerExist
                        questArr.push(questObj)
                    } else {
                        questObj['question'] = list[i].description
                        questArr.push(questObj)
                    }
                }
                return res.status(200).send({ 'list': questArr })
            } return res.status(404).send({ 'msg': 'questions not found' })
        }
        ////////////// when all keys in query body are undefined////////////////        
        if (!sort && !tag) {
            res.status(400).send({ 'msg': 'empty sort or tag value' })
        }
        if (tag || sort) {
            ///////////////////// when only tag query//////////////////////
            if (!sort) {
                if (!isValid(tag)) {
                    return res.status(400).send({ 'msg': 'invalid tag' })
                }
                let arr = tag.split(" ")
                let questArr = []
                let list = await questionModel.find({ isDeleted: false, tag: { $all: arr } })
                if (list.length > 0) {
                    for (let i = 0; i < list.length; i++) {
                        let questObj = {}
                        let isAnswerExist = await answerModel.find({ questionId: list[i]._id, isDeleted: false }).select({ text: 1, _id: 0 }).sort({createdAt:-1})    //select({_id:0,questionId:0,answeredBy:0,isDeleted:0,createdAt:0,updatedAt:0})
                        if (isAnswerExist.length > 0) {
                            questObj['question'] = list[i].description
                            questObj['answer'] = isAnswerExist
                            questArr.push(questObj)
                        } else {
                            questObj['question'] = list[i].description
                            questArr.push(questObj)
                        }

                    } return res.status(200).send({ 'list': questArr })
                }
                return res.status(400).send({ 'msg': 'questions not found with tag :' + " " + tag })
            }
            //////////////////// when only sort query///////////////////////
            if (!tag) {
                if (!isValid(sort)) {
                    return res.status(400).send({ 'msg': 'invalid sort condition' })
                }
                if (sort == 'descending' || sort == 'ascending') {
                    let x
                    if (sort == 'descending') {
                        x = -1
                    }
                    if (sort == 'ascending') {
                        x = 1
                    }
                    let questArr = []
                    let list = await questionModel.find({ isDeleted: false }).sort({ createdAt: x })
                    if (list.length > 0) {
                        for (let i = 0; i < list.length; i++) {
                            let questObj = {}
                            let isAnswerExist = await answerModel.find({ questionId: list[i]._id, isDeleted: false }).select({ text: 1, _id: 0 }).sort({createdAt:-1})     //select({_id:0,questionId:0,answeredBy:0,isDeleted:0,createdAt:0,updatedAt:0})
                            if (isAnswerExist.length > 0) {
                                questObj['question'] = list[i].description
                                questObj['answer'] = isAnswerExist
                                questArr.push(questObj)
                            } else {
                                questObj['question'] = list[i].description
                                questArr.push(questObj)
                            }

                        } return res.status(200).send({ 'list': questArr })
                    }
                }
                return res.status(400).send({ 'msg': 'invalid sort value entered' })
            }
            ////////////////////////// when both tag and sort query present////////////////////
            if (!isValid(tag)) {
                return res.status(400).send({ 'msg': 'invalid tag' })
            }
            let arr = tag.split(" ")
            if (!isValid(sort)) {
                return res.status(400).send({ 'msg': 'invalid sort condition' })
            }
            if (sort == 'descending' || sort == 'ascending') {
                let x
                if (sort == 'descending') {
                    x = -1
                }
                if (sort == 'ascending') {
                    x = 1
                }
                let questArr = []
                let list = await questionModel.find({ isDeleted: false, tag: { $all: arr } }).sort({ createdAt: x })
                if (list.length > 0) {
                    for (let i = 0; i < list.length; i++) {
                        let questObj = {}
                        let isAnswerExist = await answerModel.find({ questionId: list[i]._id, isDeleted: false }).select({ text: 1, _id: 0 }).sort({createdAt:-1})     //select({_id:0,questionId:0,answeredBy:0,isDeleted:0,createdAt:0,updatedAt:0})
                        if (isAnswerExist.length > 0) {
                            questObj['question'] = list[i].description
                            questObj['answer'] = isAnswerExist
                            questArr.push(questObj)
                        } else {
                            questObj['question'] = list[i].description
                            questArr.push(questObj)
                        }
                    } return res.status(200).send({ 'list': questArr })
                }
                return res.status(400).send({ 'msg': 'questions not found with given query filters' })
            } else {
                return res.status(400).send({ 'msg': 'invalid sort value' })
            }
        }
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
//////////////////////////////////////////////////////////////////////////////////////////
const find_question_by_id = async function (req, res) {
    try {
        let qId = req.params.questionId
        if (!qId) {
            return res.status(500).send({ 'msg': 'question id is required' })
        }
        if (!(mongoose.isValidObjectId(qId))) {
            return res.status(400).send({ 'msg': 'invalid question id' })
        }
        let questDetail = await questionModel.findById({ _id: qId })
        if (questDetail) {
            let result = { question: questDetail }
            let isAnswerExist = await answerModel.find({ questionId: qId,isDeleted:false }).select({ _id: 0, text: 1 }).sort({createdAt:-1})
            if (isAnswerExist) {
                result['answer'] = isAnswerExist
            } res.status(200).send({ 'question details': result })
        } else {
            return res.status(400).send({ 'msg': 'question not found' })
        }
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////
const update_question = async function (req, res) {
    try {
        let userId = req.body.userId
        let questionId = req.params.questionId
        if (!questionId) {
            return res.status(400).send({ 'msg': 'question id is required' })
        }
        if (!(mongoose.isValidObjectId(questionId))) {
            return res.status(400).send({ 'msg': 'invalid question id' })
        }
        let document = await questionModel.findOne({ _id: questionId,isDeleted:false })
        let askedById = document.askedBy
        if (!(askedById == userId)) {
            return res.status(401).send('unauthenticated access denied')
        }
        if (!document) {
            return res.status(400).send({ 'msg': "question not found with given id" })
        }
        let query = req.query
        if (!(isValidRequestBody(query))) {
            return res.status(400).send({ 'msg': 'invalid query' })
        }
        const { description, tag } = query
        if (description || tag) {
           let data = {}
            if (!tag ) {
                if (!isValid(description)) {
                    return res.status(400).send({ 'msg': 'please provide valid question' })
                }
                data['description'] = description
                let updatedQuest = await questionModel.findOneAndUpdate({ _id: questionId,isDeleted:false }, data, { new: true })
                if (updatedQuest) {
                    return res.status(200).send({ 'msg': "question updated successfully", "question": updatedQuest })
                }
                return res.status(400).send({ 'msg': 'question not updated' })
            }
            if (!description) {
                if (!isValid(tag)) {
                    return res.status(400).send({ 'msg': 'please provide valid tag' })
                }
                tagStr = tag.trim()
                tagArr = tagStr.split(" ")
                data['tag'] = tagArr
                let updatedQuest = await questionModel.findOneAndUpdate({ _id: questionId,isDeleted:false }, data, { new: true })
                if (updatedQuest) {
                    return res.status(200).send({ 'msg': "question updated successfully", "question": updatedQuest })
                }
                return res.status(400).send({ 'msg': 'question not updated' })
            } if (description && tag) {
                if (!isValid(description)) {
                    return res.status(400).send({ 'msg': 'please provide valid question' })
                }
                data['description'] = description
                if (!isValid(tag)) {
                    return res.status(400).send({ 'msg': 'please provide valid tag' })
                }
                tagStr = tag.trim()
                tagArr = tagStr.split(" ")
                data['tag'] = tagArr
                let updatedQuest = await questionModel.findOneAndUpdate({ _id: questionId,isDeleted:false }, data, { new: true })
                if (updatedQuest) {
                    return res.status(200).send({ 'msg': "question updated successfully", "question": updatedQuest })
                }
            }
            return res.status(400).send({ 'msg': 'question not updated' })
        }else{
            return res.status(400).send("empty query values provided")
        }
    } catch (err) {
        return res.status(500).send({ 'error': err })
    }
}
///////////////////////////////////////////////////////////////////////////////////////////
const delete_question=async function(req,res){
    try{
        let userId = req.body.userId
        let questionId = req.params.questionId
        if (!questionId) {
            return res.status(400).send({ 'msg': 'question id is required' })
        }
        if (!(mongoose.isValidObjectId(questionId))) {
            return res.status(400).send({ 'msg': 'invalid question id' })
        }
        let document = await questionModel.findOne({ _id: questionId,isDeleted:false })
        let askedById = document.askedBy
        if (!(askedById == userId)) {
            return res.status(401).send('unauthenticated access denied')
        }
        if (!document) {
            return res.status(400).send({ 'msg': "question not found with given id" })
        }
        let delDate=new Date()
        isDeleted=await questionModel.findOneAndUpdate({_id:questionId,isDeleted:false},{isDeleted:true,deletedAt:delDate},{new:true})
        if(isDeleted){
            return res.status(200).send('question deleted successfully')
        }
        return res.status(400).send('question deletion failed')
    }catch(err){
        return res.status(500).send({'error':err})
    }
}




module.exports = { create_question, find_question, find_question_by_id, update_question,delete_question }