'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Template = mongoose.model('template'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

exports.delete = function (req, res) {  
 var query = Template.find({ _id: req.params.id });
  query.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json("OK");
    }
  });
};

exports.create = function (req, res) {
  var template = new Template(req.body);
  template.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(template);
    }
  });
};

exports.update = function (req, res) {
  
  var query = {'_id':req.body._id};
  Template.findOneAndUpdate(query, req.body, {upsert:false, new: true}, function(err, doc){
    if (err){
       res.send(500, { error: err });
    }
    else{
      console.log(doc);
      res.json(doc);
    }
  });
  
};

exports.list = function (req, res) {  
  var query = Template.find();
  query.sort('-created').exec(function (err, template) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(template);
    } 
  });
};

exports.get = function (req, res) {  
  var query = Template.find();
  query.where("_id").equals(req.params.id);
  query.exec(function (err, template) { 
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(template);
    } 
  });
};
  