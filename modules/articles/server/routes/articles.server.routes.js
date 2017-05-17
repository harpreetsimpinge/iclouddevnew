'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/articles.server.policy');
var articles = require('../controllers/articles.server.controller');
var note = require('../controllers/note.server.controller');
var fields = require('../controllers/fields.server.controller');
var multer = require('multer');

var storage = multer.memoryStorage();
var file = multer({ storage: storage }).single('newNoteFile');

module.exports = function (app) {
  
  app.route('/api/articles/searchhistory').all(articlesPolicy.isAllowed)
    .get(articles.searchHistory);
  
  app.route('/api/articles/sql').all(articlesPolicy.isAllowed)
    .get(articles.sql);
  
  app.route('/api/fields/newfields').all(articlesPolicy.isAllowed)
    .post(fields.create);
  
  app.route('/api/fields/all-fields').all(articlesPolicy.isAllowed)
    .get(fields.list);
    
  app.route('/api/articles/note/:noteId').all(articlesPolicy.isAllowed)
    .get(note.list)
    .delete(note.delete); 
    
  app.route('/api/articles/smart-search').all(articlesPolicy.isAllowed)
  .post(articles.smartSearch);
      
  app.route('/api/articles/noteByUser').all(articlesPolicy.isAllowed)
    .get(note.listByCreator);
    
    app.route('/api/notes/followup/:start').all(articlesPolicy.isAllowed)
    .get(note.getFollowupForUserPage);
    
  app.route('/api/notes/oldfiles').all(articlesPolicy.isAllowed)
    .get(note.fileRepalce);
    
  // Create new note
  app.route('/api/articles/note').all(articlesPolicy.isAllowed)
    .post(note.create);
    
  app.route('/api/articles/search').all(articlesPolicy.isAllowed)
    .post(articles.list);
  
  // Articles collection routes
  app.route('/api/articles').all(articlesPolicy.isAllowed)
    //.get(articles.list)
    .post(articles.create);
  // Single article routes
  app.route('/api/articles/:articleId').all(articlesPolicy.isAllowed)
    .get(articles.read)
    .put(articles.update)
    .delete(articles.delete);
    
  app.route('/api/articles/notesById/:datePicker').all(articlesPolicy.isAllowed)
    .get(note.listByDate);
    
  app.route('/api/notes').all(articlesPolicy.isAllowed)
    .post(note.update);  
    
  app.route('/api/notes/followuppagin/:start').all(articlesPolicy.isAllowed)
    .get(note.followupPaging);
      
  app.route('/api/notes/followup').all(articlesPolicy.isAllowed)
      .get(note.followup);
      
  app.route('/api/notes/followup/:followUpId').all(articlesPolicy.isAllowed)
    .get(note.getFollowupForUser)
    .delete(note.deleteFollowUp);
      
  app.route('/api/notes/followupbydate/:date').all(articlesPolicy.isAllowed)
  .get(note.followupByDate);
  
  app.route('/api/fields').all(articlesPolicy.isAllowed)
    .post(fields.update);
    
 app.route('/api/fields/:fieldId').all(articlesPolicy.isAllowed)
    .delete(fields.delete);
 
  app.route('/api/notes/allFiels/:noteId').all(articlesPolicy.isAllowed).all(file)
    .get(note.allFiles);
        
  app.route('/api/notes/notefile').all(articlesPolicy.isAllowed).all(file)
    .post(note.addFileToNote);
    
  app.route('/api/notes/changestatus/:noteId').all(articlesPolicy.isAllowed).all(file)
    .get(note.changeStatus);

  app.route('/api/notes/change_emailsent/:noteId').all(articlesPolicy.isAllowed).all(file)
    .get(note.changeEmailSent);
    
  app.route('/api/notes/changedate/:noteId/:date').all(articlesPolicy.isAllowed).all(file)
    .get(note.changeDateForFollowUp);
    
  app.route('/api/articles/addlegacy/:id').all(articlesPolicy.isAllowed).all(file)
    .get(articles.createLegacy);
    
    app.route('/api/articles/checkclain/:val').all(articlesPolicy.isAllowed).all(file)
    .get(articles.checkClaim);
    



  // Finish by binding the article middleware
  app.param('articleId', articles.articleByID);
  
  
  //app.param('datePicker', note.noteByID);  
  
  
  
};

