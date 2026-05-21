const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@insightnexus.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      await User.create({
        _id: '507f1f77bcf86cd799439010',
        name: 'Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        companyId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
      });
      console.log('Default admin user seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdminUser();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
