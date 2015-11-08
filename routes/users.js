var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var dbCommand = require('../lib/databaseCommand.js')

//actually /user/:id
router.get('/:id', function(req, res, next) {
  // users page should have a list of users thumbnails 
  // and a list of users comments with links
  // redirect to login page if
  // lots of dbCommand.getPictures, and dbCommand.getComments
  res.render('userpage', {
    comments: comments,
    picEntries: pictures
  });
});


// actually /user/login
router.get('/login', function(req, res, next) {
  //page to do login at
  //should be default redirect if someone attempts to comment or post a picture ??
});

// actually /user/logout
router.get('/logout', function(req, res, next) {
  req.session = null;
  res.render('/logout'); // TODO: write template for logout page
});

// actually /user/login
router.post('/login', function(req, res, next) {
  dbCommand.checkCredentials(req.body.username, req.body.password).then(function(result) {
    if(result) {
      req.session.userLoggedIn = true;
      res.redirect('/users/' + userId);
    }
    if(req.session.attempts > 3) {
      // pair this with username
      res.render('/users/login', {
        errors: "Authentication failure.  Account locked out for 1 hr."
      });
      req.session.loginTimeout = new Date().now();
      
    }
    else {
      req.session.attempts += 1;
      res.render('/users/login', { errors: "Authentication failed, perhaps you typed the password incorrectly?" })
    }
  });
  //on successful login, redirect to userspage
});

//actually /user/signup
router.get('/signup', function(req, res, next) {
  req.body.username = req.body.username || 'Username';
  
  res.render('signup', { username: req.body.username });
});


router.post('/signup', function(req, res, next) {
  var invalidErr = []; // this will collect validation errors
  req.body.username = req.body.username || 'Username';
  // validation . . . password has to have the following qualities:
  // longer than 12 characters
  if(req.body.password.length < 8) {
    invalidErr.push("Password must be at least 12 characters long");
  }

  if(req.body.password == req.body.username) {
    invalidErr.push("Password must be different from username");
  }
  
  if(invalidErr.length > 0) {
    invalidErr.push("Good passwords have a lot of entropy, search for the Diceware method if you need help");
    res.render('signup', {
      errors: invalidErr
      username: req.body.username
    });
  }
  //if signup succesful, automatically login, else, return to signup with errors

  
});

module.exports = router;
