'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
  path = require('path'),
  LocalStrategy = require('passport-local').Strategy,
  Times = require('mongoose').model('Times'),
  randomstring = require("randomstring"),
  email = require("emailjs"),
  User = require('mongoose').model('User');
  
  var emailServer  = email.server.connect({
        user:    "michelle@focusonintervention.com", 
        password: "123michelle", 
        host:    "gator2004.hostgator.com", 
        ssl:     true
  });

module.exports = function () {
  // Use local strategy
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function (username, password, done) {
    console.log(username);
    tryLogin(username, "test", function(block){
      console.log(block);
      if(block){
        return done(null, false, {
            message: 'User is blocked - Check Email'
          });
      }
      User.findOne({
        username: username.toLowerCase(),
        block: false
      }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user || !user.authenticate(password)) {
          return done(null, false, {
            message: 'Invalid username or password'
          });
        }
        if (!user.valid && user.roles.indexOf('admin') == -1) {
          return done(null, false, {
            message: 'You are not allowed to sign in. Please contact the administrator.'
          });
        }

        return done(null, user);
      });
    });
  }));
};



function tryLogin (user, ip, callback) {
  Times({user: user, ip: ip}).save(function(err, doc){
    console.log("new try");
    var twoHoursBefore = new Date();
    twoHoursBefore.setHours(twoHoursBefore.getHours() - 1);
    Times.find({user: user, date: {$gte:  twoHoursBefore}}).sort({date: -1}).exec(function(err, docs) { 
      console.log(docs.length);
      if(!docs)
        callback(false);
      if(docs.length > 4){
        var code = randomstring.generate(50);
        User.update({username: user, block: false}, {block: true, openCode: code}, function(err, doc){
          console.log(err, doc);
          callback(true);
          User.find({username: user}, function(err, reUser){
            emailServer.send({
              text:    "", 
              from:    "Focus On Inforrmation <michelle@focusonintervention.com>", 
              to:      reUser[0].email,
              subject: "Focus on Information - User Blocked",
              attachment: 
              [
                {data:"<html><h1>You Account is blocked</h1> Click <a href='https://iclouddev.herokuapp.com/api/unblock/" + reUser[0].openCode + "'>here</a> To unlock your account </html>", alternative:true} 
                //{data:"<html><h1>You Account is blocked</h1> Click <a href='http://localhost:3000/api/unblock/" + reUser[0].openCode + "'>here</a> To unlock your account </html>", alternative:true}
              ]
            }, function(err, message) {
             console.log(err || message); 
            });
          });
           
        });
      } else {
        callback(false);
      }
    });
    
  }); 
};
