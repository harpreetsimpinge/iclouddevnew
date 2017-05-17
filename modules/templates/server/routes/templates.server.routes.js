'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/templates.server.policy');
var templates = require('../controllers/templates.server.controller');

var multer = require('multer');
var storage = multer.memoryStorage();
var file = multer({ storage: storage }).single('templateFile');

module.exports = function (app) {
  
app.route('/api/templates').all(articlesPolicy.isAllowed).all(file)
    .get(templates.list);
    
app.route('/api/templates/:id').all(articlesPolicy.isAllowed).all(file)
    .delete(templates.delete);  
    
app.route('/api/templates').all(articlesPolicy.isAllowed).all(file)
    .post(templates.create); 
    
app.route('/api/templates').all(articlesPolicy.isAllowed).all(file)
    .put(templates.update); 
    
app.route('/api/templates/:id').all(articlesPolicy.isAllowed).all(file)
    .get(templates.get);
   

    
  
};

