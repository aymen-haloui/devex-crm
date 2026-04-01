import { loginSchema } from '@/lib/validation/auth'

// We avoid importing the actual route handler because it pulls in Next.js and
// Prisma dependencies; instead we validate the payload logic that the route uses.

describe('login payload validation', () => {
  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({ wrong: 'data' })
    expect(result.success).toBe(false)
  })

  it('accepts valid payload shape', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'secret',
    })
    expect(result.success).toBe(true)
  })
})
