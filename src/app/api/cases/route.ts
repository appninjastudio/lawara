// Cases API Routes - Mock Data for Vercel
import { NextRequest, NextResponse } from 'next/server';

const MOCK_CASES = [
  { id: 1, caseNumber: '2024/1234', foyNumber: 'F-001', status: 'active', caseType: 'ilamsiz', principalAmount: 100000, interestAmount: 25000, totalAmount: 125000, createdAt: '2024-12-15T10:00:00Z', debtor: { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', tcNo: '12345678901', phone: '05321234567', address: 'İstanbul' }, creditor: { id: 1, name: 'ABC Bankası', type: 'banka' }, court: { id: 1, name: 'İstanbul 5. İcra Dairesi', city: 'İstanbul' }, _count: { notes: 3, transactions: 5, commitments: 1 } },
  { id: 2, caseNumber: '2024/1235', foyNumber: 'F-002', status: 'active', caseType: 'ilamli', principalAmount: 75000, interestAmount: 14000, totalAmount: 89000, createdAt: '2024-12-14T09:00:00Z', debtor: { id: 2, firstName: 'Mehmet', lastName: 'Demir', tcNo: '23456789012', phone: '05451234567', address: 'Ankara' }, creditor: { id: 2, name: 'XYZ Finans', type: 'finans' }, court: { id: 2, name: 'Ankara 3. İcra Dairesi', city: 'Ankara' }, _count: { notes: 2, transactions: 3, commitments: 0 } },
  { id: 3, caseNumber: '2024/1236', foyNumber: 'F-003', status: 'pending', caseType: 'ilamsiz', principalAmount: 35000, interestAmount: 10000, totalAmount: 45000, createdAt: '2024-12-13T14:00:00Z', debtor: { id: 3, firstName: 'Fatma', lastName: 'Kaya', tcNo: '34567890123', phone: '05551234567', address: 'İzmir' }, creditor: { id: 3, name: 'DEF Leasing', type: 'leasing' }, court: { id: 3, name: 'İzmir 2. İcra Dairesi', city: 'İzmir' }, _count: { notes: 1, transactions: 2, commitments: 1 } },
  { id: 4, caseNumber: '2024/1237', foyNumber: 'F-004', status: 'warning', caseType: 'ilamli', principalAmount: 200000, interestAmount: 30000, totalAmount: 230000, createdAt: '2024-12-12T11:00:00Z', debtor: { id: 4, firstName: 'Ali', lastName: 'Öztürk', tcNo: '45678901234', phone: '05421234567', address: 'Bursa' }, creditor: { id: 4, name: 'GHI Bankası', type: 'banka' }, court: { id: 4, name: 'Bursa 1. İcra Dairesi', city: 'Bursa' }, _count: { notes: 4, transactions: 6, commitments: 2 } },
  { id: 5, caseNumber: '2024/1238', foyNumber: 'F-005', status: 'completed', caseType: 'ilamsiz', principalAmount: 50000, interestAmount: 17000, totalAmount: 67000, createdAt: '2024-12-11T16:00:00Z', debtor: { id: 5, firstName: 'Ayşe', lastName: 'Çelik', tcNo: '56789012345', phone: '05331234567', address: 'Antalya' }, creditor: { id: 5, name: 'JKL Faktoring', type: 'faktoring' }, court: { id: 5, name: 'Antalya 4. İcra Dairesi', city: 'Antalya' }, _count: { notes: 2, transactions: 4, commitments: 1 } },
  { id: 6, caseNumber: '2024/1239', foyNumber: 'F-006', status: 'active', caseType: 'ilamsiz', principalAmount: 60000, interestAmount: 12000, totalAmount: 72000, createdAt: '2024-12-10T08:00:00Z', debtor: { id: 6, firstName: 'Hasan', lastName: 'Arslan', tcNo: '67890123456', phone: '05361234567', address: 'Konya' }, creditor: { id: 1, name: 'ABC Bankası', type: 'banka' }, court: { id: 6, name: 'Konya 2. İcra Dairesi', city: 'Konya' }, _count: { notes: 1, transactions: 2, commitments: 0 } },
  { id: 7, caseNumber: '2024/1240', foyNumber: 'F-007', status: 'active', caseType: 'ilamli', principalAmount: 150000, interestAmount: 35000, totalAmount: 185000, createdAt: '2024-12-09T13:00:00Z', debtor: { id: 7, firstName: 'Zeynep', lastName: 'Koç', tcNo: '78901234567', phone: '05441234567', address: 'Trabzon' }, creditor: { id: 2, name: 'XYZ Finans', type: 'finans' }, court: { id: 7, name: 'Trabzon 1. İcra Dairesi', city: 'Trabzon' }, _count: { notes: 3, transactions: 5, commitments: 1 } },
  { id: 8, caseNumber: '2024/1241', foyNumber: 'F-008', status: 'pending', caseType: 'ilamsiz', principalAmount: 28000, interestAmount: 7000, totalAmount: 35000, createdAt: '2024-12-08T10:00:00Z', debtor: { id: 8, firstName: 'Mustafa', lastName: 'Şahin', tcNo: '89012345678', phone: '05521234567', address: 'Adana' }, creditor: { id: 3, name: 'DEF Leasing', type: 'leasing' }, court: { id: 8, name: 'Adana 3. İcra Dairesi', city: 'Adana' }, _count: { notes: 0, transactions: 1, commitments: 0 } },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let filtered = [...MOCK_CASES];
    if (status) filtered = filtered.filter(c => c.status === status);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.caseNumber.toLowerCase().includes(s) ||
        c.debtor.firstName.toLowerCase().includes(s) ||
        c.debtor.lastName.toLowerCase().includes(s) ||
        c.creditor.name.toLowerCase().includes(s)
      );
    }

    const total = filtered.length;
    const data = filtered.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error('Cases GET Error:', error);
    return NextResponse.json({ error: 'Dosyalar getirilemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newCase = {
      id: Date.now(),
      caseNumber: body.caseNumber || `2024/${Math.floor(Math.random() * 9000) + 1000}`,
      foyNumber: body.foyNumber || null,
      status: 'active',
      caseType: body.caseType || 'ilamsiz',
      principalAmount: parseFloat(body.principalAmount || '0'),
      interestAmount: parseFloat(body.interestAmount || '0'),
      totalAmount: parseFloat(body.principalAmount || '0') + parseFloat(body.interestAmount || '0'),
      createdAt: new Date().toISOString(),
      debtor: { id: 1, firstName: 'Yeni', lastName: 'Borçlu', tcNo: '00000000000', phone: '05001234567', address: 'İstanbul' },
      creditor: { id: 1, name: 'ABC Bankası', type: 'banka' },
      court: { id: 1, name: 'İstanbul 5. İcra Dairesi', city: 'İstanbul' },
      _count: { notes: 0, transactions: 0, commitments: 0 },
    };
    return NextResponse.json({ success: true, data: newCase, message: 'Dosya başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Cases POST Error:', error);
    return NextResponse.json({ error: 'Dosya oluşturulamadı' }, { status: 500 });
  }
}
