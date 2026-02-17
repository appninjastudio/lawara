import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const commitments = await prisma.commitment.findMany({
      include: {
        case: {
          include: {
            debtor: { select: { firstName: true, lastName: true } },
          },
        },
        installments: { orderBy: { installmentNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = commitments.map((c) => ({
      id: c.id,
      caseId: c.case.caseNumber,
      debtor: `${c.case.debtor.firstName} ${c.case.debtor.lastName}`,
      totalAmount: c.totalAmount,
      installmentCount: c.installmentCount,
      paidCount: c.paidCount,
      status: c.status,
      startDate: c.startDate,
      nextPaymentDate: c.nextPaymentDate,
      nextPaymentAmount: c.nextPaymentAmount,
      installments: c.installments,
    }));

    const stats = {
      total: commitments.length,
      active: commitments.filter((c) => c.status === 'active').length,
      completed: commitments.filter((c) => c.status === 'completed').length,
      violated: commitments.filter((c) => c.status === 'violated').length,
    };

    return NextResponse.json({ data, stats });
  } catch (error) {
    console.error('Commitments GET Error:', error);
    return NextResponse.json({ error: 'Taahhütler getirilemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.caseId || !body.totalAmount || !body.installmentCount) {
      return NextResponse.json({ error: 'Dosya, tutar ve taksit sayısı zorunludur' }, { status: 400 });
    }

    const caseId = parseInt(body.caseId);
    const totalAmount = parseFloat(body.totalAmount);
    const installmentCount = parseInt(body.installmentCount);
    const installmentAmount = Math.round((totalAmount / installmentCount) * 100) / 100;
    const startDate = body.startDate ? new Date(body.startDate) : new Date();

    const session = await getSession();
    const _userId = session?.id || 1;

    // Create commitment
    const commitment = await prisma.commitment.create({
      data: {
        caseId,
        totalAmount,
        installmentCount,
        paidCount: 0,
        status: 'active',
        startDate,
        nextPaymentDate: startDate,
        nextPaymentAmount: installmentAmount,
      },
    });

    // Create installments
    const installments = [];
    for (let i = 1; i <= installmentCount; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));
      installments.push({
        commitmentId: commitment.id,
        installmentNumber: i,
        amount: i === installmentCount
          ? Math.round((totalAmount - installmentAmount * (installmentCount - 1)) * 100) / 100
          : installmentAmount,
        dueDate,
        status: 'pending',
      });
    }

    await prisma.commitmentInstallment.createMany({ data: installments });

    // Fetch full commitment with relations
    const full = await prisma.commitment.findUnique({
      where: { id: commitment.id },
      include: {
        case: {
          include: {
            debtor: { select: { firstName: true, lastName: true } },
          },
        },
        installments: { orderBy: { installmentNumber: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      data: full ? {
        id: full.id,
        caseId: full.case.caseNumber,
        debtor: `${full.case.debtor.firstName} ${full.case.debtor.lastName}`,
        totalAmount: full.totalAmount,
        installmentCount: full.installmentCount,
        paidCount: full.paidCount,
        status: full.status,
        startDate: full.startDate,
        nextPaymentDate: full.nextPaymentDate,
        nextPaymentAmount: full.nextPaymentAmount,
        installments: full.installments,
      } : null,
    });
  } catch (error) {
    console.error('Commitments POST Error:', error);
    return NextResponse.json({ error: 'Taahhüt oluşturulamadı' }, { status: 500 });
  }
}
