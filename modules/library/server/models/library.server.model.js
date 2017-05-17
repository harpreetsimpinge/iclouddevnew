'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var jobs = new Schema({
  title: {
    type: String,
    required: 'Title cannot be blank'
  },
  file: {
    type: String,
    default: ''
  }
});

var fileSchema = new Schema({
  originalName: {
    type: String,
    required: 'Name cannot be blank'
  },
  key: {
    type: String,
  },
  versions: [{
    user: {
      type: String,
    ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    url: {
      type: String
    },
    key: {
      type: String
    },
    originalName: {
      type: String
    }
  }],
  url: {
    type: String,
    required: 'Name cannot be blank'
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  case: {
    type: String,
    ref: 'Article'
  },
  followup: {
    type: String,
    default: '',
    ref: 'FollowUp'
  },
  note: {
    type: Schema.ObjectId,
    ref: 'Note'
  },
  LastModify: {
    type: Date,
    index: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  permissoins: {
    type: String,
    default: 'open'
  },
  type: {
    type: [String],
    default: 'general'
  },
  title: {
    type: String,
  },
  text: {
    type: String,
  }
});


mongoose.model('jobs', jobs);
mongoose.model('File', fileSchema);
  