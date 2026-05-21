const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authUri = process.env.MONGO_URI || 'mongodb://localhost:27017/insight_nexus_auth';
const userUri = authUri.replace('insight_nexus_auth', 'insight_nexus_user');

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node promote-user.js <email> <role>');
    console.log('Available roles: admin, manager, user');
    console.log('\nConnecting to auth DB to list users...');
    
    await mongoose.connect(authUri);
    const UserSchema = new mongoose.Schema({ email: String, name: String, role: String });
    const User = mongoose.model('User', UserSchema);
    const users = await User.find({});
    
    console.log('\n--- Current Users in System ---');
    users.forEach(u => {
      console.log(`- Email: ${u.email} | Name: ${u.name} | Role: ${u.role}`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  }

  const [email, role] = args;
  const validRoles = ['admin', 'manager', 'user'];
  if (!validRoles.includes(role)) {
    console.error(`Error: Invalid role. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  console.log(`Connecting to Auth DB: ${authUri}`);
  const authConn = await mongoose.createConnection(authUri).asPromise();
  const User = authConn.model('User', new mongoose.Schema({ email: String, role: String }));

  console.log(`Connecting to User DB: ${userUri}`);
  const userConn = await mongoose.createConnection(userUri).asPromise();
  const CompanyUser = userConn.model('CompanyUser', new mongoose.Schema({ email: String, role: String }, { collection: 'companyusers' }));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`Error: User not found in Auth DB with email: ${email}`);
    await authConn.close();
    await userConn.close();
    process.exit(1);
  }

  // Update Auth DB
  user.role = role;
  await user.save();
  console.log(`Successfully updated role in Auth DB for ${email} to ${role}`);

  // Update User DB
  const companyUser = await CompanyUser.findOne({ email: email.toLowerCase() });
  if (companyUser) {
    companyUser.role = role;
    await companyUser.save();
    console.log(`Successfully updated role in CompanyUsers collection for ${email} to ${role}`);
  } else {
    console.log(`Warning: Membership not found in CompanyUsers collection for ${email}`);
  }

  await authConn.close();
  await userConn.close();
  console.log('Done!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
