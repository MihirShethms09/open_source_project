var Token = require('../models/tokens');

const token_index = (req, res) => {
    Token.find().sort({createdAt: -1})
    .then(result => res.send(result))
    .catch(err => console.log(err));
}

const token_details = (req, res) => {
    var tokenId = req.params.id;
    Token.findById(tokenId)
    .then(result => res.send(result))
    .catch(err => console.log(err));
}

const token_post = (req, res) => {
    //retrieve the userId form headers
    var userId = req.headers.userid;
    var token = new Token({userId});

    token.save()
    .then(result => {
        User.findById(userId)
        .then(res1 => {
            var tokenToBeDeleted = res1.tokenid;
            Token.findByIdAndDelete(tokenToBeDeleted)
            .then(res2 => {
                //change the tokenId field of user with new token id
                res1.tokenId = result._id;
                res1.save();
            })
            .catch(err => console.log(err));
        })
    })
    .catch(err => console.log(err));
}

const token_update = (req, res) => {
    var tokenId = req.headers.tokenid;
    Token.findById(tokenId)
    .then(result => {
        if(result)
        {
            //increase the expiry period of the token by 24 hours
            result.expires = Date.now() + 3600*24*1000;
            result.save()
            .then(res1 => res.render('hello'))
            .catch(err => console.log(err));
        }
        else
        {
            res.send("your token has expired");
        }
    });
}

const token_delete = (req, res) => {
    var tokenId  = req.headers.tokenid;
    Token.findByIdAndDelete(tokenId)
    .then(result => res.render('hello'))
    .catch(err => console.log(err));
}

module.exports = {
    token_index,
    token_details,
    token_post,
    token_update,
    token_delete
}