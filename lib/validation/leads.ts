import { z } from 'zod';

export const leadCreateSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  title: z.string().trim().optional().nullable(),
  email: z.string().trim().email(),
  secondaryEmail: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  mobile: z.string().trim().optional().nullable(),
  fax: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  website: z.string().trim().url().optional().nullable(),
  status: z.string().trim().optional().default('new'),
  source: z.string().trim().optional().nullable(),
  industry: z.string().trim().optional().nullable(),
  employees: z.number().int().optional().nullable(),
  annualRevenue: z.union([z.number(), z.string(), z.bigint()]).optional().nullable(),
  rating: z.string().trim().optional().nullable(),
  emailOptOut: z.boolean().optional().default(false),
  skypeId: z.string().trim().optional().nullable(),
  twitter: z.string().trim().optional().nullable(),
  street: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  zip: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  score: z.number().int().min(0).max(100).optional().default(0),
  image: z.string().optional().nullable(),
  customFields: z.record(z.any()).optional().nullable(),
});

export const leadUpdateSchema = leadCreateSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'At least one field must be provided' }
);

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

