'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var CalendarSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  firstName: {
    type: String,
    default: '',
    trim: true,
    required: 'First name cannot be blank'
  },
  middleName: {
    type: String,
    default: '',
    trim: true,
    required: 'Middle name cannot be blank'
  },
  lastName: {
    type: String,
    default: '',
    trim: true,
    required: 'Last cannot be blank'
  },
  doi: {
    type: Date,
    default: '',
    trim: true,
    required: 'DOI cannot be blank'
  },
  injury: {
    type: String,
    default: '',
    trim: true,
    required: 'Injury cannot be blank'
  },
  company: {
    type: String,
    default: '',
    trim: true,
    required: 'Company name cannot be blank'
  },
  phone: {
    type: String,
    default: '',
    trim: true,
    required: 'Phone cannot be blank'
  },
  email: {
    type: String,
    default: '',
    trim: true,
    required: 'Email cannot be blank'
  },
  address: {
    address : String,
    city    : String,
    zip     : String,
    state   : String
  },
  rep: {
    firm : String,
    phone  : String
  },
  attorney:{
    applicant : String,
    defense   : String,
    service   : String,
    focus     : String
      
  },
  extra: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    default: 'open',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Calendar', CalendarSchema);
