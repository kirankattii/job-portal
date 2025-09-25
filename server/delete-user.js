const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Application = require('./src/models/Application');
const SavedJob = require('./src/models/SavedJob');
const Job = require('./src/models/Job');
const AuditLog = require('./src/models/AuditLog');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const deleteUserByEmail = async (email) => {
  try {
    console.log(`Starting deletion process for user: ${email}`);
    
    // Find the user first
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`User ID: ${user._id}`);
    console.log(`User Role: ${user.role}`);

    // Get counts of related data before deletion
    const applicationCount = await Application.countDocuments({ user: user._id });
    const savedJobCount = await SavedJob.countDocuments({ user: user._id });
    
    console.log(`Found ${applicationCount} applications and ${savedJobCount} saved jobs for this user.`);

    // Start transaction for data integrity
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 1. Delete all applications by this user
        if (applicationCount > 0) {
          console.log('Deleting applications...');
          const applications = await Application.find({ user: user._id }).session(session);
          
          // Update job applicant counts
          for (const application of applications) {
            await Job.findByIdAndUpdate(
              application.job,
              { $inc: { applicantsCount: -1 } },
              { session }
            );
          }
          
          await Application.deleteMany({ user: user._id }).session(session);
          console.log(`Deleted ${applicationCount} applications`);
        }

        // 2. Delete all saved jobs by this user
        if (savedJobCount > 0) {
          console.log('Deleting saved jobs...');
          await SavedJob.deleteMany({ user: user._id }).session(session);
          console.log(`Deleted ${savedJobCount} saved jobs`);
        }

        // 3. Delete the user
        console.log('Deleting user...');
        await User.findByIdAndDelete(user._id).session(session);
        console.log('User deleted successfully');

        // 4. Log the deletion in audit log
        try {
          await AuditLog.create([{
            action: 'USER_DELETED',
            userId: user._id,
            userEmail: user.email,
            details: {
              deletedUser: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role
              },
              deletedData: {
                applications: applicationCount,
                savedJobs: savedJobCount
              }
            },
            timestamp: new Date()
          }], { session });
          console.log('Audit log entry created');
        } catch (auditError) {
          console.warn('Could not create audit log entry:', auditError.message);
        }
      });

      console.log('\n✅ User deletion completed successfully!');
      console.log(`Summary:`);
      console.log(`- User: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`- Applications deleted: ${applicationCount}`);
      console.log(`- Saved jobs deleted: ${savedJobCount}`);
      console.log(`- Job applicant counts updated`);

    } catch (transactionError) {
      console.error('Transaction failed:', transactionError.message);
      throw transactionError;
    } finally {
      await session.endSession();
    }

  } catch (error) {
    console.error('Error deleting user:', error.message);
    throw error;
  }
};

const main = async () => {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Please provide an email address as an argument.');
    console.log('Usage: node delete-user.js <email>');
    process.exit(1);
  }

  try {
    await connectDB();
    await deleteUserByEmail(email);
  } catch (error) {
    console.error('Script failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

// Run the script
main();
