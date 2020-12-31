var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var State = require('./states');

countrySchema = new Schema({
    countryCode: Number,
    countryName: String,
    stateIds: [{type: Schema.Types.ObjectId, ref: 'State'}]    
});

Country = mongoose.model('Country', countrySchema);

module.exports = Country;