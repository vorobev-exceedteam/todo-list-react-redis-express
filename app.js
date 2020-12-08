require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const { NotFound } = require('./utills/Errors');
const path = require('path');

const taskRoutes = require('./routes/task.route');
const authRoutes = require('./routes/user.route');

const errorHandler = require('./middleware/errorHandler');

const app = express();

const port = process.env.PORT || 9000;

const mongoDB = process.env.MONGODB_URI;
mongoose
  .connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.use('/tasks', taskRoutes);
app.use('/auth', authRoutes);

// app.use('*', (req, res, next) => next(new NotFound('Route does not exist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.use(errorHandler);

app.listen(port, () => {
  console.log('Server is up and running on port number ' + port);
});
