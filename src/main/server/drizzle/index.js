import { drizzle } from 'drizzle-orm/libsql';
import { app } from 'electron';
import * as schemas from './schemas';
import path from 'path';

// Get database URL - works in both dev and production
function getDatabaseUrl() {
  // Try to get from environment first
  const envUrl = import.meta.env?.M_VITE_DATABASE_URL;
  
  // Check if we're in development
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (envUrl && isDev) {
    console.log('Using env database URL:', envUrl);
    return envUrl;
  }
  
  if (isDev) {
    console.log('Development mode: using local.db');
    return 'file:local.db';
  }
  
  // Production: MUST use userData directory
  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'paintms.db');
  const url = `file:${dbPath}`;
  
  console.log('=== PRODUCTION DATABASE ===');
  console.log('UserData:', userDataPath);
  console.log('Database path:', dbPath);
  console.log('Database URL:', url);
  console.log('==========================');
  
  return url;
}

const url = getDatabaseUrl();

const db = drizzle({ 
  schema: schemas, 
  connection: {
    url: url,
  }
});

export { db };