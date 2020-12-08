const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true, max: 20 },
  email: { type: String, required: true, max: 30 },
  passwordHash: { type: String, required: true },
});

module.exports = mongoose.model('User', UserSchema);
