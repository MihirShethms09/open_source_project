var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var City = require('./cities');

stateSchema = new Schema({
    stateName: String,
    countryCode: Number,
    cityIds: [{type: Schema.Types.ObjectId, ref: 'City'}]
});

State = mongoose.model('State', stateSchema);

module.exports = State;