import { z } from 'zod';

export const feedbackCreateSchema = z.object({
    contactId: z.string().optional().nullable(),
    customerName: z.string().optional().nullable(),
    rating: z.number().min(1).max(5).default(5),
    comment: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    sentiment: z.string().optional().nullable(),
});

export const feedbackUpdateSchema = feedbackCreateSchema.partial();
