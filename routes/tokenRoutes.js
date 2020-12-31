var express = require("express");
var router = express.Router();
var tokenController = require('../controllers/tokenController');

router.get('/', tokenController.token_index);

router.get('/:id', tokenController.token_details);

router.post('/', tokenController.token_post);

router.put('/:id', tokenController.token_update);

router.delete('/:id', tokenController.token_delete);

module.exports = router;