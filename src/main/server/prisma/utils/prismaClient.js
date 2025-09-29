import { PrismaClient } from '@prisma/client'


let prisma; 

export const getPrismaSingletonClient = ()=>{
    if(prisma) return prisma
    prisma = new PrismaClient({
        datasources: {
            db: {
            url: import.meta.env.M_VITE_DATABASE_URL
            }
        }
    });

}