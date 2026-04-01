import '@testing-library/jest-dom'

// polyfill the web Request and Response constructors for Next.js server imports
if (typeof global.Request === 'undefined') {
  // simple stub; actual tests don't use it directly
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.Request = class Request {}
}
if (typeof global.Response === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.Response = class Response {}
}

// Provide a basic mock for the `jose` package since it ships as ESM and causes
// syntax errors when Jest tries to import it directly.
// Tests don't rely on actual cryptography.
jest.mock('jose', () => {
  return {
    SignJWT: class {
      constructor(payload: any) {}
      setProtectedHeader() { return this }
      setIssuedAt() { return this }
      setExpirationTime(_exp: any) { return this }
      sign = async () => 'fake-jwt-token'
    },
    jwtVerify: jest.fn(async (token: string, secret: unknown) => {
      return { payload: { userId: 'u', email: 'e', role: 'user', organizationId: 'o' } }
    }),
  }
})

