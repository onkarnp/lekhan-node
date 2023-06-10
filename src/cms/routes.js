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
router.get('/users', checkToken, controller.getAllUsers);
// get user by id 
router.get('/users/:id', checkToken, controller.getUserById);
// add new user 
router.post('/users', checkToken, controller.addUser);
// Update user 
router.put('/users/:id', checkToken, controller.updateUser);
// delete user 
router.delete('/users/:id', checkToken, controller.deleteUser);
// get user by mail and password
router.post('/login', controller.loginByMailPassword);
// to check ig logged in already -- using cookie
router.get('/user', checkToken, controller.checkIfLoggedIn)
// to logout
router.post('/logout', checkToken, controller.logoutUsingCookie);


// For articles
// get all articles 
router.get('/articles', checkToken, controller.getArticles);
// get article by id 
router.get('/articles/:id', controller.getArticleById);
// create articles 
router.post('/articles', checkToken, controller.createArticle);
// Update articles 
router.put('/articles/:id', checkToken, controller.updateArticle);
// delete article 
router.delete('/articles/:id', checkToken, controller.deleteArticleById);
// To get published articles 
router.get('/published', controller.getPublishedArticles);
// To save content
router.post('/save', upload.single('file'), controller.saveArticle);
// To publish content
router.post('/publish',  controller.publishArticle);




// For metadata table
// get all metadata 
router.get('/metadata', checkToken, controller.getMetadata);
// get article metadata 
router.get('/metadata/:id', checkToken, controller.getMetadataById);
// update article metadata -working
router.put('/metadata/:id', checkToken, controller.updateMetadataById);
// delete article metadata -working
router.delete('/metadata/:id', checkToken, controller.deleteMetadataById);
 

//For usertype table
router.get('/usertypes', controller.getUsertypes);


module.exports = router



