require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { NotFound } = require('./utills/Errors');

const taskRoutes = require('./routes/task.route');
const authRoutes = require('./routes/user.route');

const errorHandler = require('./middleware/errorHandler');

const app = express();

const port = process.env.SERVER_PORT || 9000;

const mongoDB = process.env.MONGO_DB_URI;
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

app.use('/tasks', taskRoutes);
app.use('/auth', authRoutes);
app.use('*', (req, res, next) => next(new NotFound('Route does not exist')));

app.use(errorHandler);

app.listen(port, () => {
  console.log('Server is up and running on port number ' + port);
});
