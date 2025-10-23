// database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:cop4331c@largeprojectdb.qqafgm9.mongodb.net/LargeProjectDB');

    console.log('MongoDB connected successfully.');

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

//const connectDB = require('./database');
module.exports = connectDB;

