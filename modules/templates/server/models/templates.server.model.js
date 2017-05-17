'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var template = new Schema({
  title: {
    type: String,
    required: 'Title cannot be blank'
  },
  text: {
    type: String,
    default: ''
  }
});

mongoose.model('template', template);
  