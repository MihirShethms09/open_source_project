var express = require("express");
var router = express.Router();
var commentController = require('../controllers/commentController');

router.get('/', commentController.comment_index);

router.get('/:id', commentController.comment_details);

router.post('/', commentController.comment_general_post);

router.put('/:id', commentController.comment_put);

router.delete('/:id', commentController.comment_delete);

module.exports = router;