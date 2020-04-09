var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PositionSchema = new Schema({
  name: {type: String, min: 5 ,required: true},
  description: {type: String, required: true}
});

// virtual for url
PositionSchema
  .virtual('url')
  .get(function(){
    return '/positions/' + this._id;
  });

// export the model
module.exports = mongoose.model('Position', PositionSchema);