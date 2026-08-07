const path = require('path');
// override: true ensures this script always reads the LATEST values from backend/.env,
// even if stale INITIAL_ADMIN_* variables are already set in the parent process environment.
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), override: true });

const bcrypt = require('bcryptjs');
const prisma = require('../src/utils/db');

/**
 * Production SUPER_ADMIN Account Initialization & User Synchronization Script
 * 
 * Performs:
 * 1. Upserts production SUPER_ADMIN account using INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD.
 * 2. Updates administrator name, password hash, role (SUPER_ADMIN), and active status (isActive: true).
 * 3. Removes/deactivates legacy development accounts (admin@dacorridor.com, superadmin@dacorridor.com, manager@dacorridor.com).
 * 4. Verifies account and outputs structured migration summary.
 */
async function initializeAdmin() {
  const name = process.env.INITIAL_ADMIN_NAME;
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  // 1. Validate environment variables presence
  if (!name || !email || !password) {
    console.error('\n[ERROR]: Missing required administrator environment variables.');
    console.error('Please configure INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD in backend/.env file.\n');
    process.exit(1);
  }

  // 2. Validate password strength policy (minimum 8 characters)
  if (password.length < 8) {
    console.error('\n[ERROR]: INITIAL_ADMIN_PASSWORD must be at least 8 characters long for security compliance.\n');
    process.exit(1);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  let adminStatus = 'updated';

  try {
    // 3. Hash password using bcrypt (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Upsert production SUPER_ADMIN account
    const existingUser = await prisma.user.findFirst({
      where: { email: normalizedEmail },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
          mustChangePassword: false,
        },
      });
      adminStatus = 'created';
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: normalizedName,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
          mustChangePassword: false,
          deletedAt: null,
        },
      });
      adminStatus = 'updated';
    }

    // 5. Clean up legacy development accounts (EXCLUDING INITIAL_ADMIN_EMAIL)
    const legacyDevEmails = [
      '',
      '',
      '',
    ];

    const targetsToRemove = legacyDevEmails.filter((e) => e !== normalizedEmail);

    let removedCount = 0;
    if (targetsToRemove.length > 0) {
      const deleteResult = await prisma.user.deleteMany({
        where: {
          email: { in: targetsToRemove },
        },
      });
      removedCount = deleteResult.count;
    }

    // 6. Verify production administrator
    const verifiedAdmin = await prisma.user.findFirst({
      where: { email: normalizedEmail, isActive: true, deletedAt: null },
    });

    if (!verifiedAdmin || verifiedAdmin.role !== 'SUPER_ADMIN') {
      throw new Error('Production administrator verification check failed.');
    }

    // 7. Output formatted Migration Summary
    console.log('\n===================================================');
    console.log(' Da\' Corridor Portfolio CMS — Admin Setup & Migration');
    console.log('===================================================');
    console.log(`✓ SUPER_ADMIN ${adminStatus} successfully: ${normalizedEmail} (${verifiedAdmin.name})`);
    console.log(`✓ Removed ${removedCount} legacy development account(s)`);
    console.log(`✓ Production administrator verified`);
    console.log('===================================================');
    console.log('Migration completed successfully.\n');
  } catch (error) {
    console.error('\n[CRITICAL ERROR]: Failed to execute admin initialization script:', error.message, '\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeAdmin();
