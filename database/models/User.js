const mongoose = require('mongoose');
//for password hashing
const bcrypt = require('bcrypt');

//create User schema
const userSchema = new mongoose.Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  username:    { type: String, required: true, unique: true },
  email:       { type: String, required: true },
  password:    { type: String, required: true },
  balance:     { type: Number, default: 50 },
  verified:    { type: Boolean, default: false },
  dateCreated: { type: Date, default: Date.now }
});

//hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// update profile, change password)
userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // if password not included in update, skip
  if (!update.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(update.password, salt);

    // replace plain password with hashed
    this.setUpdate({ ...update, password: hashed });
    next();
  } catch (err) {
    next(err);
  }
});


//export User schema
const User = mongoose.model('User', userSchema);
module.exports = User;

