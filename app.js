const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const backendAPIRouter = require('./backend/backendAPIRouter.js');
const dotenv = require('dotenv').config();
const app = express();
const DIST_DIR = path.join(__dirname, 'dist');
const REACT_ENTRY_POINT = path.join(DIST_DIR, 'index.html');
const spawn = require('child_process').spawn;

const mongoose = require('mongoose');
mongoose.connect(
  process.env.DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err) {
    if (err) {
      console.err(err);
    } else {
      console.log('Connected to Mongoose');
    }
  }
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(DIST_DIR));

// app.use('/api', backendAPIRouter);

app.get('/*', (req, res) => {
  res.sendFile(REACT_ENTRY_POINT);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log(req.url);
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
