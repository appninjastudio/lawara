import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      stats: {
        totalCases: 156,
        activeCases: 89,
        pendingCases: 34,
        completedCases: 28,
        warningCases: 5,
        totalDebtors: 142,
        totalCreditors: 23,
        totalIncome: 2450000,
        totalExpense: 180000,
        netIncome: 2270000,
        totalPortfolio: 8750000,
        collectionRate: 28,
      },
      recentCases: [
        { id: 1, caseNumber: '2024/1234', status: 'active', totalAmount: 125000, caseType: 'ilamsiz', createdAt: '2024-12-15T10:00:00Z', debtor: { firstName: 'Ahmet', lastName: 'Yılmaz' }, creditor: { name: 'ABC Bankası' }, court: { name: 'İstanbul 5. İcra Dairesi' } },
        { id: 2, caseNumber: '2024/1235', status: 'active', totalAmount: 89000, caseType: 'ilamli', createdAt: '2024-12-14T09:00:00Z', debtor: { firstName: 'Mehmet', lastName: 'Demir' }, creditor: { name: 'XYZ Finans' }, court: { name: 'Ankara 3. İcra Dairesi' } },
        { id: 3, caseNumber: '2024/1236', status: 'pending', totalAmount: 45000, caseType: 'ilamsiz', createdAt: '2024-12-13T14:00:00Z', debtor: { firstName: 'Fatma', lastName: 'Kaya' }, creditor: { name: 'DEF Leasing' }, court: { name: 'İzmir 2. İcra Dairesi' } },
        { id: 4, caseNumber: '2024/1237', status: 'warning', totalAmount: 230000, caseType: 'ilamli', createdAt: '2024-12-12T11:00:00Z', debtor: { firstName: 'Ali', lastName: 'Öztürk' }, creditor: { name: 'GHI Bankası' }, court: { name: 'Bursa 1. İcra Dairesi' } },
        { id: 5, caseNumber: '2024/1238', status: 'completed', totalAmount: 67000, caseType: 'ilamsiz', createdAt: '2024-12-11T16:00:00Z', debtor: { firstName: 'Ayşe', lastName: 'Çelik' }, creditor: { name: 'JKL Faktoring' }, court: { name: 'Antalya 4. İcra Dairesi' } },
      ],
      recentNotes: [
        { id: 1, content: 'Borçlu ile görüşme yapıldı, ödeme planı teklif edildi.', type: 'note', createdAt: '2024-12-15T14:30:00Z', user: { name: 'Talip Furkan Doğan' }, case: { caseNumber: '2024/1234' } },
        { id: 2, content: 'Tebligat iade geldi, yeni adres araştırması yapılacak.', type: 'warning', createdAt: '2024-12-14T11:00:00Z', user: { name: 'Talip Furkan Doğan' }, case: { caseNumber: '2024/1235' } },
        { id: 3, content: 'Haciz işlemi için randevu alındı.', type: 'reminder', createdAt: '2024-12-13T09:00:00Z', user: { name: 'Talip Furkan Doğan' }, case: { caseNumber: '2024/1237' } },
      ],
    });
  } catch (error) {
    console.error('Dashboard GET Error:', error);
    return NextResponse.json({ error: 'Dashboard verileri getirilemedi' }, { status: 500 });
  }
}
