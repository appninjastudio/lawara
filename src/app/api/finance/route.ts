import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [transactions, commitments, cases] = await Promise.all([
      prisma.transaction.findMany({ orderBy: { transactionDate: 'desc' } }),
      prisma.commitment.findMany(),
      prisma.case.findMany({ select: { totalAmount: true } }),
    ]);

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalPortfolio = cases.reduce((s, c) => s + c.totalAmount, 0);
    const collectionRate = totalPortfolio > 0 ? Math.round((totalIncome / totalPortfolio) * 1000) / 10 : 0;

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        totalPortfolio,
        collectionRate,
        totalCases: cases.length,
      },
      commitmentStats: {
        total: commitments.length,
        active: commitments.filter(c => c.status === 'active').length,
        completed: commitments.filter(c => c.status === 'completed').length,
        violated: commitments.filter(c => c.status === 'violated').length,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        caseId: t.caseId,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.transactionDate,
      })),
    });
  } catch (error) {
    console.error('Finance GET Error:', error);
    return NextResponse.json({ error: 'Finans verileri getirilemedi' }, { status: 500 });
  }
}
