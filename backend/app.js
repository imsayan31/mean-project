const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const postRouter = require('./routes/posts');
const userRouter = require('./routes/user');

const app = express();

mongoose.connect('mongodb://localhost/postdata', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log('Connected to DB.');
}).catch(() => {
  console.log('Failed to connect DB!');
});
var mongoCon = mongoose.connection;
/* var mongoCon = mongoose.connection;

mongoCon.on('connected', function() {
  console.log('Connected to db');
}); */

/* Calling Body Parser for incoming post requests */
app.use(bodyParser.json());
app.use('/images', express.static(path.join('backend/images')));

/* To ignore CORS issue */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  next();
});

/* Using router for frontend requests and response */
app.use('/api/posts', postRouter);
app.use('/api/user', userRouter);

module.exports = app;
