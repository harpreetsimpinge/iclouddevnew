'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  //Article = mongoose.model('Article'),
  Note = mongoose.model('Note'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
  var Article = require('../../../articles/server/models/article.server.model.js');

/**
 * Create a article
 */
exports.create = function (req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
//req.article._id - find
//var article = req.article
  var query = {'_id':req.article._id};
  Article.findOneAndUpdate(query, req.body, {upsert:false}, function(err, doc){
    if (err){
       res.send(500, { error: err });
    }
    else{
     res.json("OK");
     
   }
});

};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var article = req.body;

  article.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  console.log(req.body);
//req.query.end
//req.query.start
//req.query.firstName
//req.query.firstName
//req.query.firstName


  var vars = req.body;
  var query = Article.find();
  
  if(vars.firstName && vars.firstName !== "")
    query.where("firstName").equals(vars.firstName);
  if(vars.lastName)
    query.where("lastName").equals(vars.lastName);
  if(vars.company && vars.firstName !== "")
    query.where("company").equals(vars.company);
  if(vars.status && vars.status !== "")
    query.where("status").equals(vars.status);
  
  if(vars.doi && vars.doi !== ""){
    var date = new Date(vars.doi);
    date.setUTCHours(12,0,0,0);
    query.where("doi").equals(date);
  }
  
  query.where("user").equals(req.user._id).sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    } 
  });
};

/**
 * Article middleware
 */
