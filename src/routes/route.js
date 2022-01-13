const express=require('express')
const userController=require('../controllers/userController')
const answerController=require('../controllers/answerController')
const questionController=require('../controllers/questionController')
const middleware=require('../middlewares/middleware')


const router=express.Router()

router.post('/register', userController.create_user)
router.post('/login',userController.login_user)
router.get('/user/:userId/profile',middleware.authorize,middleware.authenticate,userController.user_profile)
router.put('/user/:userId/profile',middleware.authorize,middleware.authenticate,userController.update_user)
////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/user/:userId/questions',middleware.authorize,middleware.authenticate, questionController.create_question)
router.get('/questions', questionController.find_question)
router.get('/questions/:questionId', questionController.find_question_by_id)
router.put('/questions/:questionId',middleware.authorize,middleware.authenticate, questionController.update_question)
router.delete('/questions/:questionId',middleware.authorize,middleware.authenticate, questionController.delete_question)
/////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/answer',middleware.authorize,middleware.authenticate, answerController.create_answer)
router.get('/questions/:questionId/answer', answerController.find_answer_by_question)
router.put('/answer/:answerId',middleware.authorize,middleware.authenticate, answerController.update_answer)
router.delete('/answers/:answerId',middleware.authorize,middleware.authenticate, answerController.delete_answer)
///////////////////////////////////////////////////////////////////////////////////////////////////////////






module.exports=router