const { Router } = require('express')
const controller = require('./controller')
const router = Router();

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
router.post('/users/login', controller.loginByMailPassword);


// For articles
// get all articles 
router.get('/articles', controller.getArticles);
// get article by id 
router.get('/articles/:id', controller.getArticleById);
// create articles 
router.post('/articles', controller.createArticle);
// Update articles 
router.put('/articles/:id', controller.updateArticle);
// delete article 
router.delete('/articles/:id', controller.deleteArticleById);


// For metadata table
// get all metadata 
router.get('/metadata', controller.getMetadata);
// get article metadata 
router.get('/metadata/:id', controller.getMetadataById);
// update article metadata -working
router.put('/metadata/:id', controller.updateMetadataById);
// delete article metadata -working
router.delete('/metadata/:id', controller.deleteMetadataById);
 

//For usertype table
router.get('/usertypes', controller.getUsertypes);


module.exports = router



