const express=require('express')
const userController=require('../controllers/userController')
const answerController=require('../controllers/answerController')
const questionController=require('../controllers/questionController')
const middleware=require('../middlewares/middleware')


const router=express.Router()

router.post('/register', userController.registrar)
router.post('/login',userController.logger)
router.get('/user/:userId/profile',middleware.authenticator,userController.detailor)
router.put('/user/:userId/profile',middleware.authenticator,userController.userUpdator)
////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/user/:userId/questions',middleware.authenticator, questionController.questionCreator)
router.get('/questions', questionController.questionFinder)
router.get('/questions/:questionId', questionController.questionFinderById)
router.put('/questions/:questionId',middleware.authenticator, questionController.questionUpdator)
router.delete('/questions/:questionId',middleware.authenticator, questionController.questionDeletor)
/////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/answer',middleware.authenticator, answerController.answerRegistrar)
router.get('/questions/:questionId/answer', answerController.answerFinderByQuestion)
router.put('/answer/:answerId',middleware.authenticator, answerController.answerUpdator)
router.delete('/answers/:answerId',middleware.authenticator, answerController.answerDeletor)
///////////////////////////////////////////////////////////////////////////////////////////////////////////






module.exports=router