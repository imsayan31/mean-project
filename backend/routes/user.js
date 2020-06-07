const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../model/user');

router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user.save()
    .then(result => {
      res.status(201).json({
        message: 'User created!',
        result: result
      })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Invalid authentication credentials'
      })
    });
  })
});

router.post('/login', (req, res, body) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
  .then(user => {
    if(!user) {
      return res.status(404).json({
        message: 'Email not found!'
      })
    }
    fetchedUser = user;
    return bcrypt.compare(req.body.password, user.password);
  })
  .then(result => {
    if(!result) {
      return res.status(401).json({
        message: "Password not matched!",
      });
    }
    console.log(process.env.JWT_TOKEN);
    return;
    const token = jwt.sign(
      { email: fetchedUser.email, userId: fetchedUser._id},
      'secret_this_should_be_longer',
      {
        expiresIn: '1h'
      }
    )

    res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: fetchedUser._id
    });
  })
  .catch(error => {
    res.status(401).json({
      message: 'Auth failed'
    });
  })
})

module.exports = router;
