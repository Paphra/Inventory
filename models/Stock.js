var mongoose  = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema

var StockSchema = new Schema({
  name:     { type: String, required: true, min: 3 },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  supplier: { type: String },
  modification: {type: Date, required: true, default: Date.now }
});

// virtual for the url
StockSchema
  .virtual('url')
  .get(function(){
    return '/stock/' + this._id;
  });

// virtual for modification date
StockSchema
  .virtual('modification_date')
  .get(function(){
    return moment(this.modification).format('MMM Do, YYYY');
  });

// export a model
module.exports = mongoose.model('Stock', StockSchema);
