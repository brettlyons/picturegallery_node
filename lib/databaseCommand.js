require('dotenv').load(); // required for process.env.MONGOLAB_URI
var db = require('monk')(process.env.MONGOLAB_URI);
var pictureDb = db.get('pictures');
var userDb = db.get('users');
var commentDb = db.get('comments');
var tagsDb = db.get('tags-db');

// all of these return Promises

module.exports = {
  getPictures: function (authorId) {
    if(!authorId) {
      return (pictureDb.find({}));
    }
    return (pictureDb.find({ authorId: String(authorId) }));
  },

  getOnePicture: function (id) {
    return (pictureDb.findOne({_id: id}));
  },

  getCommentsForPictureId: function (pictureId) {
     return (commentDb.find({ pictureId: pictureId }));
  },

  getTags: function(pictureId) {
    return (tagsDb.find({ pictureId: pictureId }));
  },

  addComment: function(pictureId, authorId, comment) {
    return (commentDb.insert({
      pictureId: pictureId,
      authorId: authorId,
      comment: comment
    }));
  },

   addNewPicture: function (filepath) {
    return (pictureDb.insert({filepath: filepath}));
  },

  addTag: function (pictureId, tagWord) {
    return (tagsDb.update({ tag: tagWord }, { $push: { pictureId: pictureId }}, {upsert: true}))
  },

  rmComment: function(commentId) {
    return (commentDb.remove({_id: commentId}));
  },
  rmTag: function(tagId, pictureId) {
    return (tagsDb.update({ _id: tagId }, { $pull: { pictureId: pictureId } }));
  },

  getWholePictureInfo: function(picId) {
    const that = this;
  that.getOnePicture(req.params.id).then(function(dbPicture) {
    Promise.all(that.getCommentsForPictureId(String(dbPicture._id)),that.getTags(String(dbPicture._id))).then(function (commentsAndTags) {
      console.log(commentsAndTags);
      return { picture: dbPicture,
              commentsArray: commentsAndTags[0],
              tags: commentsAndTags[1],
              errors:null
        }
      })
    })
  }
  
  // save this for later
  // addNewUser: function(username, encpass) {
  //   return (usersDb.insert({username: username, passDigest: encPass}));
  // }
}
