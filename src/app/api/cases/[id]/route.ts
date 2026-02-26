// Single Case API Routes - Mock Data for Vercel
import { NextRequest, NextResponse } from 'next/server';

const MOCK_CASE_DETAIL = {
  id: 1, caseNumber: '2024/1234', foyNumber: 'F-001', status: 'active', caseType: 'ilamsiz',
  principalAmount: 100000, interestAmount: 25000, totalAmount: 125000,
  createdAt: '2024-12-15T10:00:00Z', updatedAt: '2024-12-15T10:00:00Z',
  debtor: { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', tcNo: '12345678901', phone: '05321234567', email: 'ahmet@email.com', address: 'Kadıköy, İstanbul' },
  creditor: { id: 1, name: 'ABC Bankası', type: 'banka', taxNo: '1234567890', address: 'Levent, İstanbul' },
  court: { id: 1, name: 'İstanbul 5. İcra Dairesi', city: 'İstanbul' },
  createdBy: { id: 1, name: 'Talip Furkan Doğan', email: 'talipfurkan@lawara.co' },
  transactions: [
    { id: 1, caseId: 1, type: 'income', amount: 15000, description: 'Kısmi ödeme', transactionDate: '2024-12-10T10:00:00Z' },
    { id: 2, caseId: 1, type: 'expense', amount: 2500, description: 'Harç ödemesi', transactionDate: '2024-12-08T14:00:00Z' },
    { id: 3, caseId: 1, type: 'income', amount: 10000, description: 'Taksit ödemesi', transactionDate: '2024-12-05T09:00:00Z' },
  ],
  commitments: [
    { id: 1, caseId: 1, totalAmount: 125000, installmentCount: 12, paidCount: 3, status: 'active', startDate: '2024-10-01T00:00:00Z', nextPaymentDate: '2025-01-01T00:00:00Z', nextPaymentAmount: 10416.67, installments: [
      { id: 1, installmentNumber: 1, amount: 10416.67, dueDate: '2024-10-01T00:00:00Z', status: 'paid', paidDate: '2024-10-01T00:00:00Z' },
      { id: 2, installmentNumber: 2, amount: 10416.67, dueDate: '2024-11-01T00:00:00Z', status: 'paid', paidDate: '2024-11-02T00:00:00Z' },
      { id: 3, installmentNumber: 3, amount: 10416.67, dueDate: '2024-12-01T00:00:00Z', status: 'paid', paidDate: '2024-12-01T00:00:00Z' },
      { id: 4, installmentNumber: 4, amount: 10416.67, dueDate: '2025-01-01T00:00:00Z', status: 'pending' },
    ] },
  ],
  notes: [
    { id: 1, content: 'Borçlu ile görüşme yapıldı, ödeme planı teklif edildi.', type: 'note', createdAt: '2024-12-15T14:30:00Z', user: { id: 1, name: 'Talip Furkan Doğan' } },
    { id: 2, content: 'Tebligat başarıyla teslim edildi.', type: 'note', createdAt: '2024-12-10T09:00:00Z', user: { id: 1, name: 'Talip Furkan Doğan' } },
    { id: 3, content: 'Ödeme planı kabul edildi, taahhüt alındı.', type: 'reminder', createdAt: '2024-12-05T11:00:00Z', user: { id: 1, name: 'Talip Furkan Doğan' } },
  ],
  notifications: [
    { id: 1, title: 'Ödeme alındı', message: '15.000 TL kısmi ödeme yapıldı', type: 'payment', read: true, createdAt: '2024-12-10T10:00:00Z' },
    { id: 2, title: 'Tebligat teslim', message: 'Tebligat borçluya teslim edildi', type: 'info', read: true, createdAt: '2024-12-08T14:00:00Z' },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = parseInt(id);
    const caseData = { ...MOCK_CASE_DETAIL, id: caseId };
    return NextResponse.json({ data: caseData });
  } catch (error) {
    console.error('Case GET Error:', error);
    return NextResponse.json({ error: 'Dosya getirilemedi' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = { ...MOCK_CASE_DETAIL, id: parseInt(id), ...body };
    return NextResponse.json({ success: true, data: updated, message: 'Dosya başarıyla güncellendi' });
  } catch (error) {
    console.error('Case PUT Error:', error);
    return NextResponse.json({ error: 'Dosya güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    return NextResponse.json({ success: true, message: 'Dosya başarıyla silindi' });
  } catch (error) {
    console.error('Case DELETE Error:', error);
    return NextResponse.json({ error: 'Dosya silinemedi' }, { status: 500 });
  }
}
