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
      resources: '/api/jobs',
      permissions: ['get', 'post']
    }, {
      resources: '/api/jobs/file',
      permissions: ['post']
    }, {
      resources: '/api/jobs/:jobId',
      permissions: ['delete']
    }, {
      resources: '/api/dropdpc/uploadfile',
      permissions: ['post']
    }, {
      resources: '/api/dropdpc/deletefile/:id',
      permissions: ['delete']
    }, {
      resources: '/api/dropdpc/modifyfile',
      permissions: ['post']
    }, {
      resources: '/api/dropdpc/getforuser/:close',
      permissions: ['get']
    }, {
      resources: '/api/dropdpc/getbyclaimant/:id',
      permissions: ['get']
    }, {
      resources: '/api/dropdpc/documentfile',
      permissions: ['post']
    }, {
      resources: '/api/s3',
      permissions: ['get']
    }, {
      resources: '/api/dropdoc/searchuser',
      permissions: ['post']
    }]
  }, {
    roles: ['user', 'user2'],
    allows: []
  }, {
    roles: ['guest'],
    allows: []
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
