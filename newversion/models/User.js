const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String // Use bcrypt to hash in production
});
module.exports = mongoose.model('User', userSchema);
