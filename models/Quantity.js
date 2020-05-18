var mongoose  = require('mongoose');

var Schema = mongoose.Schema

var QuantitySchema = new Schema({
	branch: {type: Schema.Types.ObjectId, ref:'Branch', required: true},
	item: {type:Schema.Types.ObjectId, ref:'Stock', required: true},
	value: { type: Number, default: 0 },

});

// virtual for the url
QuantitySchema
  .virtual('url')
  .get(function(){
    return '/quantity/' + this._id;
  });

// export a model
module.exports = mongoose.model('Quantity', QuantitySchema);
