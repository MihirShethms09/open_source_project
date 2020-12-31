var Category = require('../models/categories');

const category_wise_blogs = (req, res) => {
    var categoryId = req.params.id;
    Category.findOne({_id: categoryId}, 'blogIds')
    .populate('blogIds')
    .exec(function(err, blog) {
        res.send(blog.blogIds);
    })
}
 
module.exports = {
    category_wise_blogs
}