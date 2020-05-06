var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BrandSchema = new Schema({
  name: {type: String, required: true},
  description: {type: String} 
});

// virtual for url
BrandSchema
  .virtual('url')
  .get(function(){
    return '/brands/' + this._id;
  });

// export the model
module.exports = mongoose.model('Brand', BrandSchema);