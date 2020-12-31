var mongoose = require("mongoose");
var Schema = mongoose.Schema;

commentSchema = new Schema({
    commentContent: String,
    userId: String,
    blogId: String,
    replyTo: { type: String, default: ""}
}, {timestamps:true});

Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;