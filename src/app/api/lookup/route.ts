import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'debtors') {
      const debtors = await prisma.debtor.findMany({
        select: { id: true, firstName: true, lastName: true, tcNo: true },
        orderBy: { lastName: 'asc' },
      });
      return NextResponse.json({ data: debtors });
    }

    if (type === 'creditors') {
      const creditors = await prisma.creditor.findMany({
        select: { id: true, name: true, type: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ data: creditors });
    }

    if (type === 'courts') {
      const courts = await prisma.court.findMany({
        select: { id: true, name: true, city: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ data: courts });
    }

    // Return all lookups at once
    const [debtors, creditors, courts] = await Promise.all([
      prisma.debtor.findMany({ select: { id: true, firstName: true, lastName: true, tcNo: true }, orderBy: { lastName: 'asc' } }),
      prisma.creditor.findMany({ select: { id: true, name: true, type: true }, orderBy: { name: 'asc' } }),
      prisma.court.findMany({ select: { id: true, name: true, city: true }, orderBy: { name: 'asc' } }),
    ]);

    return NextResponse.json({ data: { debtors, creditors, courts } });
  } catch (error) {
    console.error('Lookup GET Error:', error);
    return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 });
  }
}
