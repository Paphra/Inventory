var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema

var BranchSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  email: {type: String, required: true, min: 5 },
  phone: {type: String, required: true, min: 3},
  entryDate: { type: Date, required: true, default: Date.now }
});

// virtual for url
BranchSchema
  .virtual('url')
  .get(function(){
    return '/branches/' + this._id;
  });

// virtual for entryDateFormated
BranchSchema
  .virtual('entryDateFormated')
  .get(function(){
    return moment(this.entryDate).format('MMM Do, YYYY');
  });

// export the model
module.exports = mongoose.model('Branch', BranchSchema);