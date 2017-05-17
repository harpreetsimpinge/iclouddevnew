'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/calendar.server.policy');
var articles = require('../controllers/calendar.server.controller');

module.exports = function (app) {
    
  app.route('/api/calendar/search').all(articlesPolicy.isAllowed)
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

    //.delete(note.delete);
    
    
  // Finish by binding the article middleware
  //app.param('articleId', articles.articleByID);    
  
};

