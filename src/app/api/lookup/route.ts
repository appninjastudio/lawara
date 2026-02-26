import { NextRequest, NextResponse } from 'next/server';

const MOCK_DEBTORS = [
  { id: 1, firstName: 'Ahmet', lastName: 'Yılmaz', tcNo: '12345678901' },
  { id: 2, firstName: 'Mehmet', lastName: 'Demir', tcNo: '23456789012' },
  { id: 3, firstName: 'Fatma', lastName: 'Kaya', tcNo: '34567890123' },
  { id: 4, firstName: 'Ali', lastName: 'Öztürk', tcNo: '45678901234' },
  { id: 5, firstName: 'Ayşe', lastName: 'Çelik', tcNo: '56789012345' },
];

const MOCK_CREDITORS = [
  { id: 1, name: 'ABC Bankası', type: 'banka' },
  { id: 2, name: 'XYZ Finans', type: 'finans' },
  { id: 3, name: 'DEF Leasing', type: 'leasing' },
  { id: 4, name: 'GHI Bankası', type: 'banka' },
  { id: 5, name: 'JKL Faktoring', type: 'faktoring' },
];

const MOCK_COURTS = [
  { id: 1, name: 'İstanbul 5. İcra Dairesi', city: 'İstanbul' },
  { id: 2, name: 'Ankara 3. İcra Dairesi', city: 'Ankara' },
  { id: 3, name: 'İzmir 2. İcra Dairesi', city: 'İzmir' },
  { id: 4, name: 'Bursa 1. İcra Dairesi', city: 'Bursa' },
  { id: 5, name: 'Antalya 4. İcra Dairesi', city: 'Antalya' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'debtors') return NextResponse.json({ data: MOCK_DEBTORS });
    if (type === 'creditors') return NextResponse.json({ data: MOCK_CREDITORS });
    if (type === 'courts') return NextResponse.json({ data: MOCK_COURTS });

    return NextResponse.json({ data: { debtors: MOCK_DEBTORS, creditors: MOCK_CREDITORS, courts: MOCK_COURTS } });
  } catch (error) {
    console.error('Lookup GET Error:', error);
    return NextResponse.json({ error: 'Veriler getirilemedi' }, { status: 500 });
  }
}
