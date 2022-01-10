const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const answerSchema = new mongoose.Schema({
    answeredBy: {
        type: ObjectId,
        ref: 'quoraUser',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    questionId: {
        type: ObjectId,
        ref: 'questions',
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })
module.exports = mongoose.model('answers', answerSchema)