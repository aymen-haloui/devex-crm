import { GET } from '@/app/api/users/route';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

import { NextResponse } from 'next/server';

// stub NextResponse.json
(NextResponse.json as any) = jest.fn((body: any, opts?: any) => ({ body, opts }));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));
jest.mock('@/lib/auth', () => ({ getCurrentUser: jest.fn() }));

describe('GET /api/users', () => {
  beforeEach(() => {
    (getCurrentUser as jest.Mock).mockResolvedValue({ id: 'u1', organizationId: 'o1' });
    (prisma.user.findMany as jest.Mock).mockClear();
  });

  it('applies id filter when provided', async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([{ id: 'u2', firstName: 'Jane' }]);

    const req = { url: 'http://localhost/api/users?id=u2' } as any;
    await GET(req);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'u2' }),
      })
    );
  });
});
