import { drizzle } from 'drizzle-orm/libsql';
import * as schemas  from './schemas';

const url =  import.meta.env.M_VITE_DATABASE_URL
console.log({url})
const db = drizzle({ schema:schemas, connection: {
  url: url, 
}});

export {db} 