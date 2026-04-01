import { z } from 'zod';

export const projectCreateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    status: z.enum(['planning', 'in_progress', 'completed', 'on_hold', 'cancelled']).default('planning'),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    budget: z.union([z.number(), z.string()]).optional().nullable(),
    revenue: z.union([z.number(), z.string()]).optional().nullable(),
    description: z.string().optional().nullable(),
    accountId: z.string().optional().nullable(),
    contactId: z.string().optional().nullable(),
    dealId: z.string().optional().nullable(),
    ownerId: z.string().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial();
