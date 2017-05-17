var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator'),
  generatePassword = require('generate-password'),
  owasp = require('owasp-password-strength-test');

var TimesSchema = new Schema({
  ip: {
    type: String
  },
  user: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Times', TimesSchema);

