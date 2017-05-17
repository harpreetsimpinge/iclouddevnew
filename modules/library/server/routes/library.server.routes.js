'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/library.server.policy');
var jobs = require('../controllers/library.server.controller');
var dropdoc = require('../controllers/dropdoc.server.controller');

var multer = require('multer');
var storage = multer.memoryStorage();
var file = multer({ storage: storage }).single('libraryFile');
var upload = multer({ storage: storage }).single('uploadFile');

module.exports = function (app) {
  
app.route('/api/jobs/file').all(articlesPolicy.isAllowed).all(file)
    .post(jobs.uploadFile);
   
app.route('/api/jobs').all(articlesPolicy.isAllowed)
    .get(jobs.list)
    .post(jobs.create);
    
app.route('/api/jobs/:jobId').all(articlesPolicy.isAllowed)
    .delete(jobs.delete);
    
app.route('/api/dropdpc/uploadfile').all(articlesPolicy.isAllowed).all(upload)
    .post(dropdoc.uploadFile);
    
app.route('/api/dropdpc/deletefile/:id').all(articlesPolicy.isAllowed)
    .delete(dropdoc.deleteFile);
    
app.route('/api/dropdpc/modifyfile').all(articlesPolicy.isAllowed).all(upload)
    .post(dropdoc.changeFile);
    
app.route('/api/dropdpc/getforuser/:close').all(articlesPolicy.isAllowed)
    .get(dropdoc.getForUser);
    
app.route('/api/dropdpc/getbyclaimant/:id').all(articlesPolicy.isAllowed)
    .get(dropdoc.getByClaimant);
    
app.route('/api/s3').all(articlesPolicy.isAllowed).all(file)
    .get(dropdoc.s3);
    
app.route('/api/dropdoc/searchuser').all(articlesPolicy.isAllowed).all(file)
    .post(dropdoc.searchDropdoc);
    

      
};

