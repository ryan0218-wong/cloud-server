
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // Use bcrypt to hash in production
  facebookId: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
