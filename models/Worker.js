var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var WorkerSchema = new Schema({
  first_name: {type: String, min: 1, required: true},
  last_name: {type: String, min: 1, required: true},
  email: {type: String, min: 5, required: true},
  phone: {type: String, min: 5, required: true},
  branch: {type: Schema.Types.ObjectId, ref: 'Branch', required: true },
  position: { type: Schema.Types.ObjectId, ref: 'Position', required: true },
  user: { type: Boolean, default: false, required: true },
  role: { type: Schema.Types.ObjectId, ref: 'Role' },
  username: {type: String, min: 5, max: 15},
  password: {type: String, min: 5},
  logged: {type: Boolean, default: false },
  login_time: {type: Date},
  logout_time: {type: Date},
  token: {type: String},
  entry_date: {type: Date, required: true, default: Date.now}
});

// virtual for url
WorkerSchema
  .virtual('url')
  .get(function(){
    return '/workers/' + this._id;
  });

// virtual for name
WorkerSchema
  .virtual('name')
  .get(function(){
    return this.first_name + ' ' + this.last_name;
  });

// virtual for entryDateFormated
WorkerSchema
  .virtual('entry_date_formated')
  .get(function(){
    return moment(this.entryDate).format('MMM Do, YYYY');
  });

// export the model
module.exports = mongoose.model('Worker', WorkerSchema);