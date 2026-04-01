import { GET } from '@/app/api/deals/route';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';
import { NextResponse } from 'next/server';

// stub NextResponse.json as in other tests
(NextResponse.json as any) = jest.fn((body: any, opts?: any) => ({ body, opts }));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    deal: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));
jest.mock('@/lib/request-auth', () => ({ getRequestAuthContext: jest.fn() }));
jest.mock('@/lib/permissions', () => ({ checkPermission: jest.fn() }));

describe('GET /api/deals', () => {
  beforeEach(() => {
    (getRequestAuthContext as jest.Mock).mockResolvedValue({ userId: 'u1', organizationId: 'o1' });
    (checkPermission as jest.Mock).mockResolvedValue(true);
    (prisma.deal.findMany as jest.Mock).mockClear();
    (prisma.deal.count as jest.Mock).mockClear();
  });

  it('applies id filter when provided', async () => {
    (prisma.deal.findMany as jest.Mock).mockResolvedValue([{ id: 'd1', name: 'Deal 1' }]);
    (prisma.deal.count as jest.Mock).mockResolvedValue(1);

    const req = { url: 'http://localhost/api/deals?id=d1' } as any;
    await GET(req);

    expect(prisma.deal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'd1' }),
      })
    );
  });
});
