var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User = require('./users');
var Comment = require('./comments');

blogSchema = new Schema({
    blogTitle: String,
    blogContent: String,
    blogCategory: [String],
    xMinsRead: Number,
    noOfViews: {type: Number, default: 0},
    author: { type: Schema.Types.ObjectId, ref: 'User'},
    commentIds: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
}, {timestamps: true});

Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;