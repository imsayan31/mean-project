const express = require('express');
const multer = require("multer");

const router = express.Router();

const Post = require('../model/post');
const checkAuth = require('../middleware/check-auth');

/* Setting up file storage */
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type.");
    if (isValid) {
      error = null;
    }
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const filename = file.originalname.toLocaleLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, filename + '-' + Date.now() + '.' + ext);
  }
});

/* Create Post */
router.post('', checkAuth, multer({ storage: storage}).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    creator: req.userData.userId
  });

  //mongoCon.collection('postdata').insertOne(post);
  post.save()
  .then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully.',
      //postId: createdPost._id
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  }).catch(error => {
    res.status(500).json({
      message: 'Post can not be created.',
      post: post
    });
  });
});

/* Update Post */
router.put('/:id', checkAuth, multer({ storage: storage }).single('image'), (req, res, next) => {
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: ''
  });
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    post.imagePath = url + '/images/' + req.file.filename;
  } else {
    post.imagePath = req.body.imagePath;
  }

  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(updatedPost => {
    if(updatedPost.n > 0) {
      res.status(200).json({
        message: 'Post updated successfully.',
        post: post
      });
    } else {
      res.status(401).json({
        message: 'Not authorized to update post.',
        post: post
      });
    }

  }).catch(error => {
    res.status(500).json({
      message: 'Post can not be updated.',
      post: post
    });
  });
});

/* Get Specific Post */
router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then(postData => {
    if (postData) {
      res.status(200).json({
        message: 'Post found',
        postData: {
          id: postData._id,
          title: postData.title,
          content: postData.content,
          imagePath: postData.imagePath
        }
      });
    } else {
      res.status(404).json({
        message: 'Post not found'
      });
    }
  }).catch(error => {
    res.status(500).json({
      message: 'Post not found.',
      post: post
    });
  })
});

/* Fetch Posts */
router.get('', (req, res, next) => {
  Post.find().then(documents => {
    res.status(200).json({
      message: 'Posts returned successfully.',
      posts: documents
    });
  }).catch(error => {
    res.status(500).json({
      message: 'Posts not found.',
      post: post
    });
  });
});

/* Delete Post */
router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({
    _id: req.params.id,
    creator: req.userData.userId
  }).then(result => {
    if(result.n > 0) {
      res.status(200).json({
        message: 'Post deleted successfully!'
      });
    } else {
      res.status(401).json({
        message: 'Not authorized to delete post!'
      });
    }

  }).catch(error => {
    res.status(500).json({
      message: 'Post can not be deleted.',
      post: post
    });
  });

});

module.exports = router;
