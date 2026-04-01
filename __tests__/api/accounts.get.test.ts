import { GET } from '@/app/api/accounts/route';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';
import { NextRequest, NextResponse } from 'next/server';

// Jest runs in a Node environment where NextResponse.json relies on the
// web Response object which isn't fully implemented. Stub it so that
// invoking the route handlers doesn't throw when constructing responses.
// We'll simply return the payload for inspection if needed.
(NextResponse.json as any) = jest.fn((body: any, opts?: any) => {
  return { body, opts };
});

jest.mock('@/lib/prisma', () => ({
  prisma: {
    account: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));
jest.mock('@/lib/request-auth', () => ({ getRequestAuthContext: jest.fn() }));
jest.mock('@/lib/permissions', () => ({ checkPermission: jest.fn() }));

describe('GET /api/accounts', () => {
  beforeEach(() => {
    (getRequestAuthContext as jest.Mock).mockResolvedValue({ userId: 'u1', organizationId: 'o1' });
    (checkPermission as jest.Mock).mockResolvedValue(true);
    (prisma.account.findMany as jest.Mock).mockClear();
    (prisma.account.count as jest.Mock).mockClear();
  });

  it('includes id filter when provided', async () => {
    (prisma.account.findMany as jest.Mock).mockResolvedValue([{ id: 'a1', name: 'Test' }]);
    (prisma.account.count as jest.Mock).mockResolvedValue(1);

    // use a plain object since NextRequest constructor isn't available in test env
    const req = { url: 'http://localhost/api/accounts?id=a1' } as any;
    const res = await GET(req);
    // we don't attempt to parse the NextResponse object here, as it behaves differently
    // in the test environment. the important part is that prisma was called with the id.
    expect(prisma.account.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'a1' }),
      })
    );
  });
});
