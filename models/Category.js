var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: {type: String, required: true},
  description: {type: String} 
});

// virtual for url
CategorySchema
  .virtual('url')
  .get(function(){
    return '/categories/' + this._id;
  });

// export the model
module.exports = mongoose.model('Category', CategorySchema);