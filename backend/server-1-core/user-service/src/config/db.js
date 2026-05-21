const mongoose = require('mongoose');
const Company = require('../models/Company');
const CompanyUsers = require('../models/CompanyUsers');

const seedCompanyAndAdmin = async () => {
  try {
    const companyId = '507f1f77bcf86cd799439011';
    let company = await Company.findById(companyId);
    if (!company) {
      console.log('Seeding default company...');
      company = await Company.create({
        _id: new mongoose.Types.ObjectId(companyId),
        name: 'InsightNexus Corp',
        industry: 'Technology',
        companyCode: 'NEXUS123',
      });
      console.log('Default company seeded successfully.');
    }

    const adminUserId = '507f1f77bcf86cd799439010';
    const existingMembership = await CompanyUsers.findOne({
      userId: new mongoose.Types.ObjectId(adminUserId),
      companyId: new mongoose.Types.ObjectId(companyId),
    });

    if (!existingMembership) {
      console.log('Seeding default company admin user membership...');
      await CompanyUsers.create({
        userId: new mongoose.Types.ObjectId(adminUserId),
        companyId: new mongoose.Types.ObjectId(companyId),
        role: 'admin',
        name: 'Admin',
        email: 'admin@insightnexus.com',
      });
      console.log('Default company admin user membership seeded successfully.');
    }

    // Self-healing migration for missing name and email details in roster
    const missingInfoMembers = await CompanyUsers.find({
      $or: [
        { name: { $exists: false } }, 
        { name: '' }, 
        { email: { $exists: false } }, 
        { email: '' }
      ]
    });

    if (missingInfoMembers.length > 0) {
      console.log(`Found ${missingInfoMembers.length} memberships with missing name/email. Repairing...`);
      const authDb = mongoose.connection.useDb('insight_nexus_auth');
      const UserCollection = authDb.collection('users');

      for (const member of missingInfoMembers) {
        const authUser = await UserCollection.findOne({ _id: member.userId });
        if (authUser) {
          member.name = authUser.name;
          member.email = authUser.email;
          await member.save();
          console.log(`Repaired membership details for User ID: ${member.userId} (${authUser.name})`);
        }
      }
    }
  } catch (err) {
    console.error('Error seeding company/membership/migration:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedCompanyAndAdmin();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
