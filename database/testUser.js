//used to connect the DB
const connectDB = require('./database');
//used to access User schema
const User = require('./models/User');


(async () => {
  try {
    await connectDB();
//Create new user
    const newUser = new User({
      username: 'testUser',
      email: 'testUser@ucf.edu',
      password: '1234'
    });
//add new user to db
    await newUser.save();

    console.log('Saved user object:', newUser);
    process.exit(0);
  } catch (error) {
    console.error('Error saving user:', error.message);
    process.exit(1);
  }
})();

