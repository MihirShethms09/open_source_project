var mongoose = require("mongoose");
var Schema = mongoose.Schema;

userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: {
        line1: String,
        line2: String
    },    
    country: String,
    state: String,
    city: String,
    tokenId: String
}, {timestamps: true});

User = mongoose.model('User', userSchema);

module.exports = User;