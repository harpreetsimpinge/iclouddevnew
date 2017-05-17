'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  AWS = require('aws-sdk'),
  
  http = require("http"),
  crypto = require('crypto'),
  multer = require('multer'),
  storage = multer.memoryStorage(),
  //Article = mongoose.model('Article'),
  File = mongoose.model('File'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));
  
  AWS.config.region = 'us-east-1';
  AWS.config.update({
    accessKeyId: 'AKIAJGVSOOZ2RAPC435A', 
    secretAccessKey: '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'
  });
  var s3 = new AWS.S3();
  

exports.uploadFile = function (req, res) {
   console.log("here");
    exports.uploadToS3(req.file, function(err, returnFile){
      if(err) {
          console.log(err);
          res.statusCode(400).send();
          return;
        } 
        var fileData = {};
        fileData.type = [];
        if(req.body.case !== 'undefined') 
          fileData.case = req.body.case;
        if(req.body.note !== 'undefined')
          fileData.note = req.body.note;
        if(req.body.followup !== 'undefined')
          fileData.followup = req.body.followup;
        if(req.body.type !== 'undefined')
          fileData.type = req.body.type;
        if(req.body.title !== 'undefined')
          fileData.title = req.body.title;
        if(req.body.text !== 'undefined')
          fileData.text = req.body.text;
        if(fileData.type === undefined || fileData.type === 'undefined')
          fileData.type = [];
        fileData.versions = [];
        fileData.originalName = returnFile.originalname;
        fileData.key = returnFile.key;
        fileData.url = returnFile.Location;
        fileData.user = req.user._id;
        //fileData.type = req.body.type;
        fileData.LastModify = new Date();
        fileData.versions.push({
            originalName: returnFile.originalname,
            key: returnFile.key,
            url: returnFile.Location,
            date: new Date(),
            user: req.user._id
        });
        
        if(fileData.note === "undefined")
          delete fileData.note;
        
        exports.documentFile(fileData,function(doc){
          res.json(doc);
        });
      
      
    });
};

exports.deleteFile = function (req, res) {
 var query = File.find({ _id: req.params.id });
  query.remove(function (err, doc) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(doc);
    }
  });
};

exports.changeFile = function (req, res) {
    var id = req.body.id;
    var file = req.file;
    var date = new Date();
    var randomName = crypto.randomBytes(2).toString('hex')+"-"+file.originalname;
    var key = 'dropdoc/' + randomName;
    var params = { Bucket: 'dropdoc', Key: key, Body: file.buffer, ACL: 'public-read' };
    
    s3.upload(params, function(err, S3data) {
      
      if(err) {
          console.log(err);
          res.send(err);
          return;
        } 
        var fileData = {};
        fileData.id = id;
        fileData.originalName = file.originalname;
        fileData.key = key;
        fileData.url = S3data.Location;
        fileData.user = req.user._id;
        addVersion(fileData,function(doc){
          res.json(doc);
        });
      
      
    });
};

exports.getForUser = function (req, res) {
  var query = File.find();
  if(req.user.roles.indexOf("admin") === -1){ 
    query.where('user').equals(req.user._id);
  }
  
  query.populate('user' , 'displayName');
  query.populate('versions.user', 'displayName');
  query.populate('note');
  query.populate("note.files");
  query.populate('case', 'status _id DateClosedFocusInformation FirstnameContact LastnameContact'); 
  query.sort('-created').exec(function (err, files) {
    if (err) {
      console.log(err, files);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if(req.params.close === "true"){
        for(var k in files){
          if(files[k].hasOwnProperty("case")){
            console.log(files[k].case.DateClosedFocusInformation.value);
            if(files[k].case.DateClosedFocusInformation.value !== null ){
              //console.log(files[k].case.DateClosedFocusInformation.value);
              files.splice(k,1);
            }
          }
        }
      }
      var options = {
        path: 'note.files',
        model: 'File'
      };

      if (err) return res.json(500);
      File.populate(files, options, function (err, projects) {
        res.json(projects);
      });
        //console.log(files);
        //res.json(files);
      } 
  });
};

exports.getByClaimant = function (req, res) {
  var query = File.find();
  query.where('case').equals(req.params.id);
  query.populate('user' , 'displayName');
  query.populate('versions.user', 'displayName');
  query.populate('note');
  query.sort('-created').exec(function (err, notes) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(notes);
    } 
  });
};

exports.documentFile = function(file, callback) {
  if(!file.hasOwnProperty("type")){
    file.type = [];
  }
  if(file.type.length === 0){
    file.type = ['general'];
  }
  var file = new File(file);
  if(file){
    file.save(function (err, doc) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
        //console.log(doc);
        return callback(doc);
      }
    });
  }
};

function addVersion(file, callback){
  var query = File.findOne();
  query.where("_id").equals(file.id).sort('-date').exec(function (err, oldFile) {
    if (err) {
      console.log(err);
      return callback(err);
    } else {
      var item = {
        user : file.user, 
        date : new Date(), 
        url : oldFile.url, 
        key : oldFile.key, 
        originalName : oldFile.originalName
      };
      oldFile.versions.push(item);
      oldFile.key = file.key;
      oldFile.url = file.url;
      oldFile.LastModify = new Date();
      oldFile.originalName = file.originalName;
      console.log(oldFile);
      console.log("-----------\n----------");
      oldFile.save(function (err, doc) {
        if (err){
          console.log(err);
          return callback(err);
        }
        console.log(doc);
        return callback(doc);
      });
    } 
  });
}

exports.uploadToS3 = function(file, callback){
    var date = new Date();
    var randomName = file.originalname;
    var key = 'dropdoc/' + randomName;
    var params = { Bucket: 'dropdoc', Key: key, Body: file.buffer, ACL: 'public-read' };
    
    s3.upload(params, function(err, S3data) {
      
      if(!err) {
        S3data.key = key;
        S3data.originalname = file.originalname;
        if(callback){
          callback(null, S3data);
        }
      } else {
        if(callback){
          callback(err, null);
        }
      } 
    });
};

exports.s3 = function (req, res) {
  var forEach = require('async-foreach').forEach;
  File.where("key").equals(new RegExp("\.(pdf|PDF)$",'i')).limit(3).find(function(err, re){
    console.log(err, re.length);
    if(err){
      return res.json("fail");
    } 
    forEach(re, function(item, index) {
      console.log("Update: ", item.key, index);
      var params = {
        Bucket: 'focusdev', /* required */
        Key: item.key, /* required */
        ACL: 'public-read',
        ContentType: 'application/pdf'
      };
      /*s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });*/

    });
    res.json("ok");
  });
  
};



exports.searchDropdoc = function (req, res) {
  console.log(req.body);
  var query = File.find();
  query.where('case').equals(req.body.user);
  query.where('originalName').equals(new RegExp(req.body.search,'i'));
  
  query.sort('-created').exec(function (err, notes) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(notes);
    } 
  });
};
