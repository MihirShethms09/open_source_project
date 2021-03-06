var Blog = require('../models/blogs');
var Token = require('../models/tokens');
var User = require('../models/users');
var Category = require('../models/categories');
var StringDecoder = require("string_decoder").StringDecoder;

const blog_index = (req, res) => {
    Blog.find().sort({createdAt: -1})
    .then(result => {
        if(result)
        {
            res.send(result);
        }
        else
        {
            console.log("no blogs to display");
        }
    })
    .catch(err => console.log(err));
}

const blog_details = (req, res) => {
    var blogId = req.params.id;
    Blog.findById(blogId)
    .then(result => {
        result.noOfViews++;
        result.save()
        .then(() => res.send(result))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

const blog_popular = (req, res) => {
    Blog.find().sort({noOfViews: -1})
    .then(blogResult => {
        var popularBlogs = [];
        for(let i=0;i<2;i++)
        {
            popularBlogs.push(blogResult[i]);
        }
        res.send(popularBlogs);
    })
    .catch(err => console.log(err));
}

const blog_recent = (req, res) => {
    Blog.find().sort({createdAt: -1})
    .then(blogResult => {
        var recentBlogs = []
        for(let i=0;i<2;i++)
        {
            recentBlogs.push(blogResult[i]);
        }
        res.send(recentBlogs);
    })
    .catch(err => console.log(err));
}

const blog_post = (req, res) => {
    //here we r checking the length of tokenid to be 24, bcoz the length of _id field generated by default by mongodb is 24
    var tokenId = typeof(req.headers.tokenid)=="string" && req.headers.tokenid.trim().length==24?req.headers.tokenid:false;

    var decoder = new StringDecoder('utf-8');
    var buffer = "";

    req.on("data", (data) => {
        buffer += decoder.write(data);
    })

    req.on("end", () => {
        buffer += decoder.end();
        var parsedBuffer = JSON.parse(buffer);

        var blogTitle = typeof(parsedBuffer.blogTitle)=="string" && parsedBuffer.blogTitle.length>0?parsedBuffer.blogTitle:false;
        var blogContent = typeof(parsedBuffer.blogContent)=="string" && parsedBuffer.blogContent.length>=25?parsedBuffer.blogContent:false;
        var blogCategory = typeof(parsedBuffer.blogCategory)=="object" && parsedBuffer.blogCategory instanceof Array && parsedBuffer.blogCategory.length>0?parsedBuffer.blogCategory:false;

        if(blogTitle)
        {
            if(blogContent)
            {
                if(blogCategory)
                {
                    if(tokenId)
                    {
                        Token.findById(tokenId)
                        .then(tokenResult => {
                            if(tokenResult.expires > Date.now())
                            {
                                var xMinsRead = 2;
                                var userId = tokenResult.userId;
    
                                var userObj = {blogTitle, blogContent, blogCategory, xMinsRead, 'author': userId};
                                
                                var blog = new Blog(userObj);
                    
                                blog.save()
                                .then(blogResult => {
                                    blogResult.blogCategory.forEach(element => {
                                        Category.find({categoryName: element})
                                        .then(categoryResult => {
                                            if(categoryResult.length>0)
                                            {
                                                categoryResult[0].blogIds.push(blogResult._id);
                                                categoryResult[0].save()
                                                .then(() => res.send("successfully created a blog"))
                                                .catch(err => console.log(err));
                                            }
                                            else
                                            {
                                                var category = new Category({categoryName: element});
                                                category.blogIds.push(blogResult._id);
                    
                                                category.save()
                                                .then(() => res.send("successfully created a blog"))
                                                .catch(err => console.log(err));
                                            }
                                        })
                                        .catch(err => console.log(err));
                                    });
                                })
                                .catch(err => console.log(err));                                
                            }
                            else
                            {
                                res.send("Your login session has expired.Consider logging in again")
                            }

                        })
                        .catch(err => console.log(err));
                    }
                    else
                    {
                        res.send("You need to login to create a blog");
                    }
                }
                else
                {
                    res.send("please enter the category to which blog belongs to");
                }
            }
            else
            {
                res.send("please enter valid blog content.Make sure your blog consists of atleast 100 words");
            }
        }
        else
        {
            res.send("please enter a valid blog title");
        }
    })
}

const blog_update = (req, res) => {
    var tokenId = typeof(req.headers.tokenid)=="string" && req.headers.tokenid.trim().length==24?req.headers.tokenid:false;
    var blogId = typeof(req.params.id)=="string" && req.params.id.trim().length==24?req.params.id:false;

    var decoder = new StringDecoder('utf-8');
    var buffer = "";

    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();

        var parsedBuffer = JSON.parse(buffer);

        if(tokenId && blogId) 
        {
            Token.findById(tokenId)
            .then(tokenResult => {
                if(tokenResult)
                {
                    if(tokenResult.expires > Date.now())
                    {
                        Blog.findById(blogId)
                        .then(blogResult => {
                            //checking the field/s to update
                            console.log(parsedBuffer);
                            if(parsedBuffer.blogTitle)
                            {
                                //update it in actual database
                                blogResult.blogTitle = parsedBuffer.blogTitle;
                            }
                            if(parsedBuffer.blogContent)
                            {
                                blogResult.blogContent = parsedBuffer.blogContent;
                            }
                            blogResult.save()
                            .then(() => res.send("blog updated"))
                            .catch(err => console.log(err));
                        })
                        .catch(err => console.log(err));
                    }                        
                    else
                    {
                        res.send("Your login session has expired.Consider logging in again");
                    }
                }
                else
                {
                    res.send("invalid token");
                }
            })
            .catch(err => console.log(err));
        }
        else
        {
            res.send("you have provide an invalid token or the blog you are trying to update, does not exist");
        }
    });
}

const blog_delete = (req, res) => {
    var tokenId = req.headers.tokenid;
    var blogId = req.params.id;

    Token.findById(tokenId)
    .then(result => {
        if(result.expires > Date.now())
        {
            Blog.findById(blogId)
            .then(res1 => {
                //to check that the put request made is made only by the author
                if(res1.author == result.userId)
                {
                    Blog.findByIdAndDelete(blogId)
                    .then(result => res.send("blog successfully deleted"))
                    .catch(err => console.log(err));
                }
                else
                {
                    res.send("you are not authorized to delete this blog");
                }
            })
            .catch(err => console.log(err));
        }
        else
        {
            res.send("Your login session has expired.Consider logging in again");
        }
    })
    .catch(err => console.log(err));

}

module.exports = {
    blog_index,
    blog_details,
    blog_popular,
    blog_recent,
    blog_post,
    blog_update,
    blog_delete
}