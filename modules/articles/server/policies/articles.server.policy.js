'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Articles Permissions
 */
exports.invokeRolesPolicies = function() {
  acl.allow([{
    roles: ['user', 'user2', 'admin1', 'admin2', 'admin'],
    allows: [, {
      resources: '/api/notes/oldfiles',
      permissions: ['get']
    }, {
      resources: '/api/articles/sql',
      permissions: ['get']
    }, {
      resources: '/api/fields/newfields',
      permissions: ['post']
    }, {
      resources: '/api/articles/:articleId',
      permissions: ['get', 'put', 'delete']
    }, {
      resources: '/api/articles/smart-search',
      permissions: ['post']
    }, {
      resources: '/api/articles',
      permissions: ['get', 'post', 'delete']
    }, {
      resources: '/api/articles/search',
      permissions: ['post']
    }, {
      resources: '/api/articles/note',
      permissions: ['post', 'delete']
    }, {
      resources: '/api/articles/note/:noteId',
      permissions: ['delete', 'get']
    }, {
      resources: '/api/articles/notesById/:datePicker',
      permissions: ['get']
    }, {
      resources: '/api/articles/noteByUser',
      permissions: ['get']
    }, {
      resources: '/api/notes/followup/:start',
      permissions: ['get']
    }, {
      resources: '/api/fields/all-fields',
      permissions: ['get']
    }, {
      resources: '/api/fields',
      permissions: ['post']
    }, {
      resources: '/api/notes/notefile',
      permissions: ['post']
    }, {
      resources: '/api/notes/allFiels/:noteId',
      permissions: ['get']
    }, {
      resources: '/api/notes/followup',
      permissions: ['get']
    }, {
      resources: '/api/notes/followuppagin/:start',
      permissions: ['get']
    }, {
      resources: '/api/notes',
      permissions: ['post']
    }, {
      resources: '/api/notes/followupbydate/:date',
      permissions: ['get']
    }, {
      resources: '/api/notes/changestatus/:noteId',
      permissions: ['get']
    }, {
      resources: '/api/notes/change_emailsent/:noteId',
      permissions: ['get']
    }, {
      resources: '/api/notes/followup/:followUpId',
      permissions: ['delete', 'get']
    }, {
      resources: '/api/fields/:fieldId',
      permissions: ['delete']
    }, {
      resources: '/api/notes/changedate/:noteId/:date',
      permissions: ['get']
    }, {
      resources: '/api/articles/searchhistory',
      permissions: ['get']
    }, {
      resources: '/api/articles/checkclain/:val',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/articles',
      permissions: ['get']
    }, {
      resources: '/api/articles/:articleId',
      permissions: ['get']
    }]
  }, {
    roles: ['admin1', 'admin2', 'admin'],
    allows: [{
      resources: '/api/articles/addlegacy/:id',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an article is being processed and the current user created it then allow any manipulation
  if (req.article && req.user && req.article.user && req.article.user.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
    if (err) {
      // An authorization error occurred.
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
