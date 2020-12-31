var mongoose = require("mongoose");
var Schema = mongoose.Schema;

tokenSchema = new Schema({
    userId: String,
    expires: {type: Date, default: Date.now() + 3600*24*1000}
}, {timestamps:true});

Token = mongoose.model('Token', tokenSchema);

module.exports = Token;