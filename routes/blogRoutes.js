var express = require("express");
var router = express.Router();
var blogController = require('../controllers/blogController');

//to retrieve all the blogs
router.get('/', blogController.blog_index);

//to retrieve popular blogs
router.get('/popularBlogs', blogController.blog_popular);

//to retrive recent blogs
router.get('/recentBlogs', blogController.blog_recent);

//to retrieve a specific blog
router.get('/:id', blogController.blog_details);

//to create a blog
router.post('/', blogController.blog_post);

//to update a specific blog
router.put('/:id', blogController.blog_update);

//to delete a specific blog
router.delete('/:id', blogController.blog_delete);

module.exports = router;