// Cases API Routes - Real CRUD with Prisma
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const caseType = searchParams.get('caseType');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (caseType) {
      where.caseType = caseType;
    }

    if (search) {
      where.OR = [
        { caseNumber: { contains: search } },
        { debtor: { firstName: { contains: search } } },
        { debtor: { lastName: { contains: search } } },
        { creditor: { name: { contains: search } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          debtor: true,
          creditor: true,
          court: true,
          _count: {
            select: { notes: true, transactions: true, commitments: true },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.case.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Cases GET Error:', error);
    return NextResponse.json(
      { error: 'Dosyalar getirilemedi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = ['caseNumber', 'debtorId', 'creditorId', 'courtId', 'principalAmount'];
    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `${field} alanı zorunludur` },
          { status: 400 }
        );
      }
    }

    const principalAmount = parseFloat(body.principalAmount);
    const interestAmount = parseFloat(body.interestAmount || '0');

    const newCase = await prisma.case.create({
      data: {
        caseNumber: body.caseNumber,
        foyNumber: body.foyNumber || null,
        debtorId: parseInt(body.debtorId),
        creditorId: parseInt(body.creditorId),
        courtId: parseInt(body.courtId),
        principalAmount,
        interestAmount,
        totalAmount: principalAmount + interestAmount,
        caseType: body.caseType || 'ilamsiz',
        status: 'active',
        createdById: (await getSession())?.id || (await prisma.user.findFirst())?.id || 1,
      },
      include: {
        debtor: true,
        creditor: true,
        court: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newCase,
      message: 'Dosya başarıyla oluşturuldu',
    });
  } catch (error: unknown) {
    console.error('Cases POST Error:', error);
    const message = error instanceof Error && error.message.includes('Unique constraint')
      ? 'Bu dosya numarası zaten mevcut'
      : 'Dosya oluşturulamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
