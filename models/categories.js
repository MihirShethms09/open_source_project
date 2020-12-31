var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Blog = require('./blogs');

categorySchema = new Schema({
    categoryName: String,
    blogIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Blog'
    }]
}, {timestamps: true});

Category = mongoose.model('Category', categorySchema);

module.exports = Category;