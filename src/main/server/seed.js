import bcrypt from 'bcryptjs';
import { db } from "./drizzle/index.js";
import { users } from "./drizzle/schemas";
import { eq } from "drizzle-orm";
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { runMigrations } from './drizzle/migrations.js';

/**
 * Check if the database has been seeded
 */
export async function isDatabaseSeeded() {
  try {
    const existingUsers = await db
      .select()
      .from(users)
      .limit(1);
    
    return existingUsers.length > 0;
  } catch (error) {
    console.error('Error checking if database is seeded:', error);
    return false;
  }
}

/**
 * Create seed flag file to prevent re-seeding
 */
function createSeedFlag() {
  try {
    const userDataPath = app.getPath('userData');
    const flagPath = path.join(userDataPath, '.seeded');
    fs.writeFileSync(flagPath, new Date().toISOString());
    console.log('✓ Seed flag created at:', flagPath);
  } catch (error) {
    console.error('Error creating seed flag:', error);
  }
}

/**
 * Check if seed flag exists
 */
function seedFlagExists() {
  try {
    const userDataPath = app.getPath('userData');
    const flagPath = path.join(userDataPath, '.seeded');
    return fs.existsSync(flagPath);
  } catch (error) {
    console.error('Error checking seed flag:', error);
    return false;
  }
}

/**
 * Seed the database with initial admin user
 */
export async function seed() {
  try {
    console.log('=================================');
    console.log('Starting database seed...');
    console.log('=================================');
    
    // Check if already seeded via flag
    if (seedFlagExists()) {
      console.log('✓ Database already seeded (flag exists). Skipping...');
      return;
    }

    // Check if users exist
    const isSeeded = await isDatabaseSeeded();
    if (isSeeded) {
      console.log('✓ Database already has users. Skipping seed...');
      createSeedFlag();
      return;
    }

    console.log('No users found. Creating admin user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user with username
    const newAdmin = await db
      .insert(users)
      .values({
        username: 'adminms',
        email: 'admin@paintms.com',
        password: hashedPassword,
        name: 'Admin PaintMS',
        theme: 'light',
        language: 'fr',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    const admin = newAdmin[0];
    
    console.log('=================================');
    console.log('✓ Admin user created successfully!');
    console.log('=================================');
    console.log('  Username: adminms');
    console.log('  Password: admin123');
    console.log('  Email:', admin.email);
    console.log('=================================');
    
    // Create seed flag
    createSeedFlag();
    
    return admin;
    
  } catch (error) {
    console.error('=================================');
    console.error('✗ Error seeding database:', error);
    console.error('=================================');
    throw error;
  }
}

/**
 * Initialize database - runs migrations and seeds if needed
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // CRITICAL: Run migrations first to create tables
    await runMigrations();
    
    // Then run seed if needed
    await seed();
    
    console.log('✓ Database initialization complete!');
    
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
}