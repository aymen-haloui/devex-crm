import { z } from 'zod';

export const serviceCreateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    price: z.union([z.number(), z.string()]).default(0),
    duration: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
});

export const serviceUpdateSchema = serviceCreateSchema.partial();
