require('dotenv').load();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var bcrypt = require('bcrypt');
//offload the db stuff to ./lib
var dbCommand = require('../lib/databaseCommand');

// EVERY method in dbCommand returns a promise, and a promise from the database

// AUTH TODO:
// add authorization
// in a way that doesn't require repeating "Is authed?"
// on every page

// TAGS TODO:
// make tags db
// display tags through template
// provide "linkage" so that each tag link can display related pictures


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Picture Gallery'});
});

router.get('/pictures', function(req, res, next) {
  dbCommand.getPictures().then(function(dbPictures) {
    res.render('pictures', {pictures: dbPictures});
  });
});

//convention: dbCommand methods return promises and info for chainability

//router.get('/pictures/bytag/:id') {
// this will be for displaying all of the pictures sharing ONE tag.
//
//}

router.post('/pictures/:picId/delcomment/:commentId', function(req, res, next) {
  dbCommand.rmComment(req.params.commentId);
  res.redirect('/pictures/' + req.params.picId);
});

router.get('/pictures/:picId/removetag/:tagId', function(req, res, next) {
  dbCommand.rmTag(req.params.tagId, req.params.picId);
  res.redirect('/pictures/'+ req.params.picId);
});

// COMMENT FROM JEFF: 
// Rather than have all the dbCommand object have lots of small methods, this would be a great place to move all of this nested promise logic to a method in dbCommand.

// When you do that, can you also un-nest the getTags call? So that you only have 2-levels of nesting in your promises.

router.get('/pictures/:id', function(req, res, next) {
  dbCommand.getWholePictureInfo(req.params.id).then(function (pictureDisplay){
    res.render('showpicture', pictureDisplay);
  })
});


router.post('/pictures/:id/addtag', function(req, res, next) {
  if(req.body.newTag.trim().length > 2 && req.body.newTag.trim().length < 12) {
    dbCommand.addTag(req.params.id, req.body.newTag).then(function (_) {
      res.redirect('/pictures/' + req.params.id)
    });
  }
  else {
    console.log(req.params.id);
    dbCommand.getOnePicture(req.params.id).then(function(dbPicture) {
      dbCommand.getCommentsForPictureId(String(dbPicture._id)).then(function (comments) {
        dbCommand.getTags(String(dbPicture._id)).then(function (tagsForPic) {
          console.log(dbPicture, tagsForPic)
          res.render('showpicture', {
            picture: dbPicture,
            commentsArray: comments,
            tags: tagsForPic,
            errors: "Tag must be longer than 2 characters and shorter than 12"
          });
        });
      });
    });
  }
});

router.post('/pictures/:id/comment', function(req, res, next) {
  // TODO have to log in to access this route:
  // if not authed, reshow page with "you must log in to make a comment" type of thing
  dbCommand.addComment(req.params.id, req.body.author, req.body.comment).then(function () {
    res.redirect('/pictures/' + req.params.id);
  });
});

// These should go on the /user/ path

router.get('/upload', function(req, res, next) {
  //validate
  res.render('upload');
});

router.post('/upload', function(req, res, next) {
  var filePath = '/files/';
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function(fieldname, file, filename) {
    console.log('Uploading: ' + filename + ' to ' + filePath);
    filePath = filePath + filename;
    console.log('Now filepath is: ', filePath);
    fstream = fs.createWriteStream('./public' + filePath);
    file.pipe(fstream);
    fstream.on('close', function() {
      dbCommand.addNewPicture(filePath).then(function (record) {
        console.log(record, record._id);
        res.redirect('/pictures/' + record._id);
      });
    });
  });
});

// temporarily commented out, should be rendered unnecessary by cleaner front end
// -- may eventually become the picture "edit" page
// router.post('/postnext/:id', function(req, res, next) {
//   picCollection.findAndModify({_id: req.params.id}, {
//     $set: {
//       title1: req.body.title1,
//       subtitle: req.body.title2,
//       comments: []
//     }
//   });
//   res.redirect('/pictures/' + req.params.id);
// });


module.exports = router;
