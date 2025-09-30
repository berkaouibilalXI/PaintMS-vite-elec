import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index.js';
import path from 'path';
import { app } from 'electron';

export async function runMigrations() {
  try {
    console.log('=== RUNNING MIGRATIONS ===');
    
    // Get the migrations folder path
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    
    let migrationsFolder;
    if (isDev) {
      // In development, use the source migrations folder
      migrationsFolder = path.join(process.cwd(), 'drizzle');
    } else {
      // In production, migrations should be in the resources folder
      migrationsFolder = path.join(process.resourcesPath, 'drizzle');
    }
    
    console.log('Migrations folder:', migrationsFolder);
    
    await migrate(db, { migrationsFolder });
    
    console.log('✓ Migrations completed successfully!');
    
  } catch (error) {
    console.error('✗ Migration error:', error);
    throw error;
  }
}