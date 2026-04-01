import { GET } from '@/app/api/campaigns/route';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';
import { NextResponse } from 'next/server';

// stub NextResponse.json
(NextResponse.json as any) = jest.fn((body: any, opts?: any) => ({ body, opts }));

jest.mock('@/lib/prisma', () => ({
  prisma: { campaign: { findMany: jest.fn() } },
}));
jest.mock('@/lib/request-auth', () => ({ getRequestAuthContext: jest.fn() }));
jest.mock('@/lib/permissions', () => ({ checkPermission: jest.fn() }));

describe('GET /api/campaigns', () => {
  beforeEach(() => {
    (getRequestAuthContext as jest.Mock).mockResolvedValue({ userId: 'u1', organizationId: 'o1' });
    (checkPermission as jest.Mock).mockResolvedValue(true);
    (prisma.campaign.findMany as jest.Mock).mockClear();
  });

  it('filters by id when requested', async () => {
    (prisma.campaign.findMany as jest.Mock).mockResolvedValue([{ id: 'camp1', name: 'Camp' }]);

    const req = { url: 'http://localhost/api/campaigns?id=camp1' } as any;
    await GET(req);

    expect(prisma.campaign.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'camp1' }),
      })
    );
  });
});
