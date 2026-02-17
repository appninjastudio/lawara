import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalCases,
      activeCases,
      pendingCases,
      completedCases,
      warningCases,
      totalDebtors,
      totalCreditors,
      transactions,
      recentCases,
      recentNotes,
    ] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: 'active' } }),
      prisma.case.count({ where: { status: 'pending' } }),
      prisma.case.count({ where: { status: 'completed' } }),
      prisma.case.count({ where: { status: 'warning' } }),
      prisma.debtor.count(),
      prisma.creditor.count(),
      prisma.transaction.findMany(),
      prisma.case.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          debtor: { select: { firstName: true, lastName: true } },
          creditor: { select: { name: true } },
          court: { select: { name: true } },
        },
      }),
      prisma.caseNote.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          case: { select: { caseNumber: true } },
        },
      }),
    ]);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const allCases = await prisma.case.findMany({
      select: { totalAmount: true },
    });
    const totalPortfolio = allCases.reduce((sum, c) => sum + c.totalAmount, 0);

    return NextResponse.json({
      stats: {
        totalCases,
        activeCases,
        pendingCases,
        completedCases,
        warningCases,
        totalDebtors,
        totalCreditors,
        totalIncome,
        totalExpense,
        netIncome: totalIncome - totalExpense,
        totalPortfolio,
        collectionRate: totalPortfolio > 0 ? Math.round((totalIncome / totalPortfolio) * 100) : 0,
      },
      recentCases,
      recentNotes,
    });
  } catch (error) {
    console.error('Dashboard GET Error:', error);
    return NextResponse.json({ error: 'Dashboard verileri getirilemedi' }, { status: 500 });
  }
}
