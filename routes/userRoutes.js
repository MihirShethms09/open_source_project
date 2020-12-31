var express = require("express");
var router = express.Router();
var userController = require('../controllers/userController');

router.get('/', userController.user_index);

router.get('/logout', userController.user_logout);

router.get('/:id', userController.user_details);

router.post('/register', userController.user_post);

router.post('/login', userController.user_login);

router.put('/:id', userController.user_update);

router.delete('/:id', userController.user_delete);

module.exports = router;