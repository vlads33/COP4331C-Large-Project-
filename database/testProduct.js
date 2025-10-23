const connectDB = require('./database');
const Product = require('./models/Product');

(async () => {
  try {
    await connectDB();

    const newProduct = new Product({
      name: 'Fan',
      description: 'A simple desk fan for cooling',
      price: 25.99
    });

    await newProduct.save();

    console.log('Saved product:', newProduct);
    process.exit(0);
  } catch (error) {
    console.error('Error saving product:', error.message);
    process.exit(1);
  }
})();

