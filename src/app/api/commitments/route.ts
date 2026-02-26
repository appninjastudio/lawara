import { NextRequest, NextResponse } from 'next/server';

const MOCK_COMMITMENTS = [
  { id: 1, caseId: '2024/1234', debtor: 'Ahmet Yılmaz', totalAmount: 125000, installmentCount: 12, paidCount: 3, status: 'active', startDate: '2024-10-01T00:00:00Z', nextPaymentDate: '2025-01-01T00:00:00Z', nextPaymentAmount: 10416.67, installments: [] },
  { id: 2, caseId: '2024/1236', debtor: 'Fatma Kaya', totalAmount: 45000, installmentCount: 6, paidCount: 6, status: 'completed', startDate: '2024-06-01T00:00:00Z', nextPaymentDate: null, nextPaymentAmount: 0, installments: [] },
  { id: 3, caseId: '2024/1237', debtor: 'Ali Öztürk', totalAmount: 230000, installmentCount: 24, paidCount: 5, status: 'violated', startDate: '2024-07-01T00:00:00Z', nextPaymentDate: '2024-12-01T00:00:00Z', nextPaymentAmount: 9583.33, installments: [] },
  { id: 4, caseId: '2024/1240', debtor: 'Zeynep Koç', totalAmount: 185000, installmentCount: 18, paidCount: 2, status: 'active', startDate: '2024-11-01T00:00:00Z', nextPaymentDate: '2025-01-01T00:00:00Z', nextPaymentAmount: 10277.78, installments: [] },
  { id: 5, caseId: '2024/1238', debtor: 'Ayşe Çelik', totalAmount: 67000, installmentCount: 8, paidCount: 8, status: 'completed', startDate: '2024-04-01T00:00:00Z', nextPaymentDate: null, nextPaymentAmount: 0, installments: [] },
];

export async function GET() {
  try {
    const stats = {
      total: MOCK_COMMITMENTS.length,
      active: MOCK_COMMITMENTS.filter(c => c.status === 'active').length,
      completed: MOCK_COMMITMENTS.filter(c => c.status === 'completed').length,
      violated: MOCK_COMMITMENTS.filter(c => c.status === 'violated').length,
    };
    return NextResponse.json({ data: MOCK_COMMITMENTS, stats });
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
    const totalAmount = parseFloat(body.totalAmount);
    const installmentCount = parseInt(body.installmentCount);
    const installmentAmount = Math.round((totalAmount / installmentCount) * 100) / 100;
    const newCommitment = {
      id: Date.now(),
      caseId: body.caseId,
      debtor: 'Yeni Borçlu',
      totalAmount,
      installmentCount,
      paidCount: 0,
      status: 'active',
      startDate: new Date().toISOString(),
      nextPaymentDate: new Date().toISOString(),
      nextPaymentAmount: installmentAmount,
      installments: [],
    };
    return NextResponse.json({ success: true, data: newCommitment });
  } catch (error) {
    console.error('Commitments POST Error:', error);
    return NextResponse.json({ error: 'Taahhüt oluşturulamadı' }, { status: 500 });
  }
}
