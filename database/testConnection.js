// testConnection.js
// Simple script to verify MongoDB connection using Mongoose.

const connectDB = require('./database');

async function test() {
  try {
    await connectDB(); // Call your database connection function
    console.log('Database connection test successful.');
    process.exit(0);
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    process.exit(1);
  }
}

test();

