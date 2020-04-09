var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var SupplierSchema = new Schema({
  name: {type: String, required: true},
  address: {type: String, required: true},
  email: {type: String, min: 10, required: true},
  phone: {type: String, min: 10, required: true},
  entry_date: {type: Date, required: true, default: Date.now}
});

// virtual for url
SupplierSchema
  .virtual('url')
  .get(function(){
    return '/suppliers/' + this._id;
  });

//virtual for entryDateFomated
SupplierSchema
  .virtual('entry_date_formated')
  .get(function(){
    return moment(this.entryDate).format('MMM Do, YYYY');
  });

// export the model
module.exports = mongoose.model('Supplier', SupplierSchema);