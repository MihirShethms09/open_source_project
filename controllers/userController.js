var User = require('../models/users');
var Token = require('../models/tokens');
var Country = require('../models/countries');
var State = require('../models/states');
var City = require('../models/cities');
var StringDecoder = require("string_decoder").StringDecoder;


const user_index = (req, res) => {
    User.find().sort({createdAt: -1})
    .then(result => res.send(result))
    .catch(err => console.log(err));
}

const user_details = (req, res) => {
    var userId = req.params.id;
    User.findById(userId)
    .then(result => res.send(result))
    .catch(err => console.log(err));
}

const user_logout = (req, res) => {
    var tokenId = req.headers.tokenid;
    Token.findById(tokenId)
    .then(tokenResult => {
        var userId = tokenResult.userId;
        User.findById(userId)
        .then(userResult => {
            userResult.tokenId = "";
            userResult.save()
            .then(() => {
                Token.findByIdAndDelete(tokenId)
                .then(() => res.send("user logged out successfully"))
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
}

const user_post = (req, res) => {
    var decoder = new StringDecoder('utf-8');
    var buffer = "";
    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();
        var parsedBuffer = JSON.parse(buffer)

        //retrieve the details of country, state, and city, etc and verify it
        var firstName = typeof(parsedBuffer.firstName)=="string" && parsedBuffer.firstName.trim().length>0?parsedBuffer.firstName:false;
        var lastName = typeof(parsedBuffer.lastName)=="string" && parsedBuffer.lastName.trim().length>0?parsedBuffer.lastName:false;
        var email = typeof(parsedBuffer.email)=="string" && parsedBuffer.email.trim().length>0?parsedBuffer.email:false;
        var phone = typeof(parsedBuffer.phone)=="string" && parsedBuffer.phone.trim().length>0?parsedBuffer.phone:false;
        var address = typeof(parsedBuffer.address)=="object"?parsedBuffer.address:false;
        var country = typeof(parsedBuffer.country)=="string" && parsedBuffer.country.trim().length>0?parsedBuffer.country:false;
        var state = typeof(parsedBuffer.state)=="string" && parsedBuffer.state.trim().length>0?parsedBuffer.state:false;
        var city = typeof(parsedBuffer.city)=="string" && parsedBuffer.city.trim().length>0?parsedBuffer.city:false;

        if(firstName && lastName && email && phone && address && city && state && country)
        {
            Country.findOne({countryName: country})
            .populate('stateIds')
            .then(countryResult => {
                var stateNames = [];
                //retrieving the names of states of a country
                countryResult.stateIds.forEach(element => {
                    stateNames.push(element.stateName);
                });
    
                //checking if the entered name of state is present in above array or not
                if(stateNames.includes(state))
                {
                    State.findOne({stateName: state, countryCode: countryResult.countryCode}) //here it's neccessary to pass country code alongwith
                    .populate('cityIds') // state name bcoz there can be multiple states with same name but situated in different countries.
                    .then(stateResult => {
                            var cityNames = [];
                            //retrieving the names of cities of a state
                            stateResult.cityIds.forEach(element => {
                                cityNames.push(element.cityName);
                                });
                            if(cityNames.includes(city))
                            {
                                //creating an userObj that stores user details
                                var userObj = {firstName, lastName, email, phone, address, city, state, country};
                                var user = new User(userObj);
                                user.save()
                                .then(result => {
                                    var token = new Token({userId: result._id});
                                    token.save()
                                    .then(res1 => {
                                        result.tokenId = res1._id;
                                        result.save()
                                        .then(result => {res.send("successfully created an user")})
                                        .catch(err => console.log(err));
                                    })
                                    .catch(err => console.log(err));
                                })
                                .catch(err => console.log(err));  
                            }
                            else
                            {
                                res.send("please enter a valid city");
                            }
                        })
                    .catch(err => console.log(err));
                }
                else
                {
                    res.send("Please enter a valid state");
                }
            })
            .catch(err => console.log(err));      
        }
        else
        {
            res.send("Missing required fields.Make sure you enter all the fields.");
        }
    });
}

const user_login = (req, res) => {
    var decoder = new StringDecoder('utf-8');
    var buffer = "";
    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();
        var parsedBuffer = JSON.parse(buffer)     

        //retrieve email and phone to verify the user
        var email = parsedBuffer.email;
        var phone = parsedBuffer.phone;

        //look for the user in the users collection on basis of email and phone
        User.find({email: email, phone: phone})
        .then(userResult => {
            //check that an user with given email and phone exists 
            if(userResult.length>0)
            {
                var userId = userResult[0]._id;

                //generate token for given user id
                var token = new Token(userId);
                token.save()
                .then(tokenResult => {
                    //save the tokenId in user document
                    userResult[0].tokenId = tokenResult._id;
                    userResult[0].save()
                    .then(() => res.send("logged in successfully"))
                    .catch(err => console.log(err));
                })
                .catch(err => console.log(err));
            }
            else
            {
                res.send("No user is registered with above mentioned credentials.Please register first.");
            }
        })
        .catch(err => console.log(err));
    })
}

const user_update = (req, res) => {
    var tokenId = req.headers.tokenid;
    var userId = req.params.id;
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on("data", (data) => {
        buffer += decoder.write(data);
    });

    req.on("end", () => {
        buffer += decoder.end();
        var parsedBuffer = JSON.parse(buffer);

        Token.findById(tokenId)
        .then(tokenResult => {
            if(tokenResult.expires > Date.now())
            {
                if(tokenResult.userId == userId)
                {
                    User.findById(userId)
                    .then(userResult => {
                        if(parsedBuffer.firstName)
                        {
                            userResult.firstName = parsedBuffer.firstName;
                        }
                        if(parsedBuffer.lastName)
                        {
                            userResult.lastName = parsedBuffer.lastName;
                        }
                        if(parsedBuffer.email)
                        {
                            userResult.email = parsedBuffer.email;
                        }
                        if(parsedBuffer.phone)
                        {
                            userResult.phone = parsedBuffer.phone;
                        }
                        if(parsedBuffer.address)
                        {
                            userResult.address = parsedBuffer.address;
                        }
                        if(parsedBuffer.city)
                        {
                            userResult.city = parsedBuffer.city;
                        }
                        if(parsedBuffer.state)
                        {
                            userResult.state = parsedBuffer.state;
                        }
                        if(parsedBuffer.country)
                        {
                            userResult.country = parsedBuffer.country;
                        }
    
                        userResult.save()
                        .then(() => res.send("user updated"))
                        .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
                }
                else
                {
                    res.send("you are not authorized to make changes to this user profile");
                }
            }
            else
            {
                res.send("Your login session has expired.Consider logging in again");
            }
        })
        .catch(err => console.log(err));
    })
}

const user_delete = (req, res) => {
    var tokenId = req.headers.tokenid;
    Token.findById(tokenId)
    .then(result => {
        if(result.expires > Date.now())
        {
            var userId = result.userId;
            if(userId == req.params.id)
            {
                User.findByIdAndDelete(userId)
                .then(result => {
                    res.send("user deleted");
                })
                .catch(err => console.log(err));
    
                Token.findByIdAndDelete(tokenId)
                .catch(err => console.log(err));
            }
            else
            {
                res.send("you are not authorized to delete this profile");
            }        
        }
        else
        {
            res.send("Your login session has expired.Consider logging in again");
        }
    })
    .catch(err => console.log(err));
}

module.exports = {
    user_index,
    user_logout,
    user_details,
    user_post,
    user_login,
    user_update,
    user_delete
}
