var Comment = require('../models/comments');
var Token = require('../models/tokens');
var User = require('../models/users');
var StringDecoder = require('string_decoder').StringDecoder;

const comment_index = (req, res) => {
    Comment.find().sort({createdAt: -1})
    .then(result => res.send(result))
    .catch(err => console.log(err));
}

const comment_details = (req, res) => {
    var commentId = req.params.id;
    Comment.findById(commentId)
    .then(result => res.send(result))
    .catch(err => console.log(err));
}

const comment_general_post = (req, res) => {
    var tokenId = req.headers.tokenid;
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();
        var parsedBuffer = JSON.parse(buffer);

        var commentContent = parsedBuffer.commentContent;
        var blogId = parsedBuffer.blogId;
        
        if(parsedBuffer.replyTo !== undefined)
        {
            var replyTo = parsedBuffer.replyTo;
        }
        else
        {
            var replyTo = "";
        }

        Token.findById(tokenId)
        .then(result => {
            if(result)
            {
                var userId = result.userId;
                var commentObj = {commentContent, userId, blogId, replyTo};

                var comment = new Comment(commentObj);
                comment.save()
                .then(commentResult => {
                    Blog.findById(blogId)
                    .then(blogResult => {
                        blogResult.commentIds.push(commentResult._id);
                        blogResult.save()
                        .then(() => res.send("comment created"))
                        .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
            }
            else
            {
                res.send("invalid token");
            }
        })
    })

}

const comment_put = (req, res) => {
    var tokenId = req.headers.tokenid;
    var commentId = req.params.id;
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();
        var parsedBuffer = JSON.parse(buffer);
        var updatedCommentContent = parsedBuffer.updatedCommentContent;

        Token.findById(tokenId)
        .then(tokenResult => {
            var userId = tokenResult.userId;
            Comment.findById(commentId)
            .then(commentResult => {
                commentResult.commentContent = updatedCommentContent;
                commentResult.save()
                .then(res1 => res.send("updated comment"))
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    });
}

const comment_delete = (req, res) => {
    var tokenId = req.headers.tokenid;
    var commentId = req.params.id;

    Token.findById(tokenId)
    .then(tokenResult => {
        if(tokenResult)
        {
            Comment.findById(commentId)
            .then(commentResult => {
                var blogId = commentResult.blogId;
                Blog.findById(blogId)
                .then(blogResult => {
                    var index = blogResult.commentIds.indexOf(commentId);
                    blogResult.commentIds.splice(index, index);
                    console.log(blogResult.commentIds);
                    blogResult.save()
                    .then(() => {
                        Comment.findByIdAndDelete(commentId)
                        .then(() => res.send("comment deleted"))
                        .catch(err => console.log(err));
                    })
                })
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
        else
        {
            res.send("you are not authorized to delete the comment");
        }
    })
}

module.exports = {
    comment_index,
    comment_details,
    comment_general_post,
    comment_put,
    comment_delete
}