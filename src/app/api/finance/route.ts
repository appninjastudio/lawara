import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      stats: {
        totalIncome: 2450000,
        totalExpense: 180000,
        totalPortfolio: 8750000,
        collectionRate: 28,
        totalCases: 156,
      },
      commitmentStats: {
        total: 5,
        active: 2,
        completed: 2,
        violated: 1,
      },
      transactions: [
        { id: 1, caseId: 1, type: 'income', amount: 15000, description: 'Kısmi ödeme - Ahmet Yılmaz', date: '2024-12-15T10:00:00Z' },
        { id: 2, caseId: 1, type: 'expense', amount: 2500, description: 'Harç ödemesi', date: '2024-12-14T14:00:00Z' },
        { id: 3, caseId: 2, type: 'income', amount: 25000, description: 'Taksit ödemesi - Mehmet Demir', date: '2024-12-13T09:00:00Z' },
        { id: 4, caseId: 4, type: 'income', amount: 50000, description: 'Kısmi ödeme - Ali Öztürk', date: '2024-12-12T11:00:00Z' },
        { id: 5, caseId: 3, type: 'expense', amount: 1800, description: 'Tebligat masrafı', date: '2024-12-11T16:00:00Z' },
        { id: 6, caseId: 5, type: 'income', amount: 67000, description: 'Tam ödeme - Ayşe Çelik', date: '2024-12-10T10:00:00Z' },
        { id: 7, caseId: 7, type: 'income', amount: 10277.78, description: 'Taksit ödemesi - Zeynep Koç', date: '2024-12-09T13:00:00Z' },
        { id: 8, caseId: 1, type: 'expense', amount: 3200, description: 'Avukat masrafı', date: '2024-12-08T08:00:00Z' },
      ],
    });
  } catch (error) {
    console.error('Finance GET Error:', error);
    return NextResponse.json({ error: 'Finans verileri getirilemedi' }, { status: 500 });
  }
}
