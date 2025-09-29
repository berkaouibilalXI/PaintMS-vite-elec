const { z } = require('zod');

export const createProductSchema = z.object({
    name: z.string().min(1, 'Nom du produit requis').max(100, 'Nom trop long'),
    // Accept strings and coerce to numbers since frontend sends strings
    price: z.string().or(z.number()).pipe(z.coerce.number().min(0, 'Le prix doit être positif')),
    unit: z.string().optional().default('unité'),
    description: z.string().optional().default('')
});

export const updateProductSchema = z.object({
    name: z.string().min(1, 'Nom du produit requis').max(100, 'Nom trop long').optional(),
    price: z.string().or(z.number()).pipe(z.coerce.number().min(0, 'Le prix doit être positif')).optional(),
    unit: z.string().optional(),
    description: z.string().optional()
});

