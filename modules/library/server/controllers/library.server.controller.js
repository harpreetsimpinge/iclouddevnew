'use strict';

/**
 * Module dependencies.
 * 
 * 
 * 
 * 
 * 
 * The date I CHANGES the S3 accounts was 6/21/16!!
 */
var path = require('path'),
  mongoose = require('mongoose'),
  AWS = require('aws-sdk'),
  crypto = require('crypto'),
  //Article = mongoose.model('Article'),
  Jobs = mongoose.model('jobs'),
  s3 = new AWS.S3(),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
  
  AWS.config.region = 'us-east-1';
  AWS.config.update({
    accessKeyId: 'AKIAIIZOTMASAYZZ6MZQ', 
    secretAccessKey: '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'
  });

exports.create = function (req, res) {
  var jobs = new Jobs(req.body);

  jobs.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(jobs);
    }
  });
};

exports.list = function (req, res) {
  var query = Jobs.find();
 
  
  query.sort("title").populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    } 
  });
};


  
exports.delete = function (req, res) {  
 var query = Jobs.find({ _id: req.params.jobId });
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
  
  exports.uploadFile = function (req, res) {
    
    var file = req.file;
    var date = new Date();
    var randomName = crypto.randomBytes(2).toString('hex')+"-"+file.originalname;
    //console.log(randomName);
    // build file name
    var key = 'library/' + randomName;
    var params = { Bucket: 'focusdev', Key: key, Body: file.buffer, ACL: 'public-read' };
    s3.upload(params, function(err, data) {
      if(err) {
        console.log('s3 original');
        console.log(err);
        return;
      } 
      res.json(data.Location);
      
    });
};