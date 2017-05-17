'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/exports.server.policy');
var exports = require('../controllers/exports.server.controller');
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp');
    },
    
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());  
  }});
var file = multer({ storage: storage }).single('docRender');

module.exports = function (app) {
     app.route('/api/exports/sendNoteByEmail/:noteId/:email').all(articlesPolicy.isAllowed)
     .get(exports.sendNoteByEmail);
     
     app.route('/api/exports/sendNoteByEmail').all(articlesPolicy.isAllowed)
     .post(exports.customSendNoteByEmail);
     
     app.route('/api/exports/renderDoc/:id').all(articlesPolicy.isAllowed).all(file)
     .post(exports.templateRender);
     
     app.route('/api/exports/contacttocsv/:part').all(articlesPolicy.isAllowed)
     .get(exports.exportContactsToCSV)
     
    app.route('/api/exports/contacttocsv').all(articlesPolicy.isAllowed)
     .post(exports.exportContactsToCSVCustom);

     
     app.route('/api/exports/emailslist').all(articlesPolicy.isAllowed)
     .get(exports.list)
     .delete(exports.deleteEmail);
     
     app.route('/api/exports/emailslist/:id').all(articlesPolicy.isAllowed)
     .delete(exports.deleteEmail);
     
     app.route('/api/exports/finddoplicates/:start/:end').all(articlesPolicy.isAllowed)
     .get(exports.findDoplicates);
     
     app.route('/api/exports/csvcaculator').all(articlesPolicy.isAllowed)
     .post(exports.CalculatorToCSV);
  
};

