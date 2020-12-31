var mongoose = require("mongoose");
var Schema = mongoose.Schema;

citySchema = new Schema({
    cityName: String,
});

City = mongoose.model('City', citySchema);

module.exports = City;