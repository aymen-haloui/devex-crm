import { GET } from '@/app/api/contacts/route';
import { prisma } from '@/lib/prisma';
import { getRequestAuthContext } from '@/lib/request-auth';
import { checkPermission } from '@/lib/permissions';
import { NextResponse } from 'next/server';

// stub NextResponse.json
(NextResponse.json as any) = jest.fn((body: any, opts?: any) => ({ body, opts }));

jest.mock('@/lib/prisma', () => ({
  prisma: { contact: { findMany: jest.fn(), count: jest.fn() } },
}));
jest.mock('@/lib/request-auth', () => ({ getRequestAuthContext: jest.fn() }));
jest.mock('@/lib/permissions', () => ({ checkPermission: jest.fn() }));

describe('GET /api/contacts', () => {
  beforeEach(() => {
    (getRequestAuthContext as jest.Mock).mockResolvedValue({ userId: 'u1', organizationId: 'o1' });
    (checkPermission as jest.Mock).mockResolvedValue(true);
    (prisma.contact.findMany as jest.Mock).mockClear();
    (prisma.contact.count as jest.Mock).mockClear();
  });

  it('applies id filter when provided', async () => {
    (prisma.contact.findMany as jest.Mock).mockResolvedValue([{ id: 'c1', firstName: 'Foo' }]);
    (prisma.contact.count as jest.Mock).mockResolvedValue(1);

    const req = { url: 'http://localhost/api/contacts?id=c1' } as any;
    await GET(req);

    expect(prisma.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'c1' }),
      })
    );
  });
});
