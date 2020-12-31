var express = require("express");
var categoryController = require('../controllers/categoryController');
var router = express.Router();

router.get('/:id', categoryController.category_wise_blogs);

module.exports = router;