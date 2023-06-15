const { Router } = require('express')
const {checkToken} = require("./token_validation");
const multer = require('multer')
const controller = require('./controller')
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024,
    }
});

// For users
// get all users 
router.get('/users', controller.getAllUsers);
// get user by id 
router.get('/users/:id', controller.getUserById);
// add new user 
router.post('/users', controller.addUser);
// Update user 
router.put('/users/:id', controller.updateUser);
// delete user 
router.delete('/users/:id', controller.deleteUser);
// get user by mail and password
router.post('/login', controller.loginByMailPassword);
// to check ig logged in already -- using cookie
router.get('/user', controller.checkIfLoggedIn)
// to logout
router.post('/logout', controller.logoutUsingCookie);


// For articles
// get all articles 
router.get('/articles',  controller.getArticles);
// get article by id 
router.get('/articles/:id', controller.getArticleById);
// create articles 
router.post('/articles',  controller.createArticle);
// Update articles 
router.put('/articles/:id',  controller.updateArticle);
// delete article 
router.delete('/articles/:id',  controller.deleteArticleById);
// To get published articles 
router.get('/published', controller.getPublishedArticles);
// To save content
router.post('/save', upload.single('file'), controller.saveArticle);
// To save edited content
router.post('/save_edited', upload.single('file'), controller.saveEditedArticle);
// To publish edited content
router.post('/publish_edited', controller.publishEditedArticle);

// To publish content
router.post('/publish',  controller.publishArticle);
// To get all articles for an author
router.get('/all', controller.getAllArticles);
// To get saved articles for an author
router.get('/saved', controller.getSavedArticles);
// To get finalized articles for an author
router.get('/finalized', controller.getFinalizedArticles);
// To get QA requested articles for an author
router.get('/qarequested', controller.getQARequestedArticles);
// To get QA checked articles for an author
router.get('/qachecked', controller.getQACheckedArticles);
// To get CR checked articles for an author
router.get('/crrequested', controller.getCRRequestedArticles);
//To get articles published by particular author
router.get('/user_published', controller.getUserPublishedArticles);
//To assign QA for a content
router.get('/assignqa', controller.assignQA);







// For metadata table
// get all metadata 
router.get('/metadata',  controller.getMetadata);
// get article metadata 
router.get('/metadata/:id',  controller.getMetadataById);
// update article metadata
router.put('/metadata/:id',  controller.updateMetadataById);
// delete article metadata
router.delete('/metadata/:id',  controller.deleteMetadataById);
 

//For usertype table
router.get('/usertypes', controller.getUsertypes);


module.exports = router



