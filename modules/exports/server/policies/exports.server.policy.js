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
    allows: [{
      resources: '/api/exports/sendNoteByEmail/:noteId/:email',
      permissions: ['get']
    }, {
      resources: '/api/exports/sendNoteByEmail',
      permissions: ['post']
    }, {
      resources: '/api/exports/renderDoc/:id',
      permissions: ['post']
    }, {
      resources: '/api/exports/emailslist',
      permissions: ['get']
    }, {
      resources: '/api/exports/emailslist/:id',
      permissions: ['delete']
    }, {
      resources: '/api/exports/finddoplicates/:start/:end',
      permissions: ['get']
    }, {
      resources: '/api/exports/csvcaculator',
      permissions: ['post']
    }]
  }, {
    roles: ['admin1', 'admin2', 'admin'],
    allows: [{
      resources: '/api/exports/contacttocsv/:part',
      permissions: ['get', 'post']
    },
    {
      resources: '/api/exports/contacttocsv',
      permissions: ['get', 'post']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/articles',
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
