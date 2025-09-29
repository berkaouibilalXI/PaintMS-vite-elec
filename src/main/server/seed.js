const bcrypt = require('bcryptjs');
import {db} from "../server/drizzle"
import {users} from "../server/drizzle/schemas"

import { eq } from "drizzle-orm";

export async function seed() {
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        // Check if admin user already exists
        const existingAdmin = await db
            .select()
            .from(users)
            .where(eq(users.email, 'admin@paintms.com'))
            .limit(1);
        
        let admin;
        
        if (existingAdmin.length > 0) {
            // User exists, optionally update (equivalent to upsert update)
            admin = existingAdmin[0];
            console.log('Admin user already exists:', admin);
        } else {
            // Create new admin user
            const newAdmin = await db
                .insert(users)
                .values({
                    email: 'admin@paintms.com',
                    password: hashedPassword,
                    name: 'Admin PaintMS'
                })
                .returning(); // Returns the created record(s)
            
            admin = newAdmin[0];
            console.log('Admin user created:', admin);
        }
        
        console.log('Utilisateur admin créé ou déjà existant:', admin);
        
    } catch (error) {
        console.error('Error in main function:', error);
        throw error;
    }
}

// const bcrypt = require('bcryptjs');


// import {getPrismaSingletonClient} from "../prisma/utils/prismaClient"
// const prisma = getPrismaSingletonClient()


// async function main(){
//     //nhashiw le mdps
//     const hashedPassword =  await bcrypt.hash('admin123', 10);

//     //ncreyiw l'utilisateur admin
//     const admin = await prisma.user.upsert({
//         where: {email: 'admin@paintms.com'},
//         update: {},
//         create: {
//             email: 'admin@paintms.com',
//             password: hashedPassword,
//             name: 'Admin PaintMS'
//         }
//     });

//     console.log('Utilisateur admin créé ou déjà existant:', admin);
// }

// main()
//     .catch(e => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async ()=>{
//         await prisma.$disconnect();
//     })