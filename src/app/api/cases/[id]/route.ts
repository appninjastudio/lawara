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
  seizures: [
    {
      id: 1, type: 'bank', status: 'active', createdAt: '2024-11-20T10:00:00Z',
      description: 'Banka Hesabı Haczi (İİK 89/1)',
      details: {
        bankName: 'Ziraat Bankası',
        accountType: 'Vadesiz TL',
        iban: 'TR12 0001 0012 3456 7890 1234 56',
        blockedAmount: 12450,
        responseDate: '2024-11-22T14:00:00Z',
        responseStatus: 'positive',
        responseNote: 'Hesapta ₺12.450 bloke edildi'
      }
    },
    {
      id: 2, type: 'bank', status: 'active', createdAt: '2024-11-20T10:00:00Z',
      description: 'Banka Hesabı Haczi (İİK 89/1)',
      details: {
        bankName: 'Garanti BBVA',
        accountType: 'Vadesiz TL',
        iban: 'TR98 0006 2000 1234 0006 7890 12',
        blockedAmount: 0,
        responseDate: '2024-11-23T09:00:00Z',
        responseStatus: 'negative',
        responseNote: 'Hesapta yeterli bakiye bulunmamaktadır'
      }
    },
    {
      id: 3, type: 'vehicle', status: 'active', createdAt: '2024-11-25T09:00:00Z',
      description: 'Araç Haczi',
      details: {
        plate: '34 ABC 123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        chassisNo: 'JTDBT923X01234567',
        engineNo: '1NZ-FE-1234567',
        registrationDate: '2024-11-25T09:00:00Z',
        estimatedValue: 850000,
        seizureNote: 'Yakalama şerhi konuldu'
      }
    },
    {
      id: 4, type: 'property', status: 'pending', createdAt: '2024-12-01T11:00:00Z',
      description: 'Taşınmaz Haczi',
      details: {
        address: 'Kadıköy, Caferağa Mah. Moda Cad. No:15 D:8',
        city: 'İstanbul',
        district: 'Kadıköy',
        parcel: '3 Ada, 15 Parsel',
        area: '85 m²',
        propertyType: 'Mesken (Daire)',
        tapuNo: 'T-2024-001234',
        estimatedValue: 4500000,
        mortgageInfo: 'Yapı Kredi Bankası - ₺2.100.000 ipotek',
        seizureNote: 'Tapu müdürlüğüne haciz şerhi yazısı gönderildi'
      }
    },
    {
      id: 5, type: 'salary', status: 'active', createdAt: '2024-12-05T08:00:00Z',
      description: 'Maaş Haczi',
      details: {
        employer: 'ABC Tekstil San. ve Tic. A.Ş.',
        employerTaxNo: '1234567890',
        sgkNo: '1234567890',
        monthlySalary: 42500,
        deductionRate: 25,
        deductionAmount: 10625,
        startDate: '2025-01-01T00:00:00Z',
        totalCollected: 0,
        responseStatus: 'confirmed',
        responseNote: 'İşveren maaş haczi müzekkeresini tebellüğ etmiştir'
      }
    },
    {
      id: 6, type: 'receivable', status: 'pending', createdAt: '2024-12-10T14:00:00Z',
      description: 'İcra Dosya Alacağı Haczi',
      details: {
        thirdPartyCourt: 'İstanbul 8. İcra Dairesi',
        thirdPartyCaseNo: '2023/4567',
        thirdPartyDebtor: 'Mehmet Kara',
        expectedAmount: 35000,
        seizureNote: 'Üçüncü kişi nezdindeki alacağa haciz konulması talep edildi'
      }
    },
  ],
  lawsuits: [
    {
      id: 1, type: 'taahhudu_ihlal', status: 'active',
      courtName: 'İstanbul 12. İcra Ceza Mahkemesi',
      caseNumber: '2024/5678',
      filingDate: '2024-12-15T00:00:00Z',
      nextHearingDate: '2025-02-20T10:00:00Z',
      subject: 'Taahhüdü İhlal (İİK m.340)',
      description: 'Borçlu 12 taksitlik ödeme taahhüdünün 4. taksitini ödemeyerek taahhüdü ihlal etmiştir.',
      plaintiff: 'ABC Bankası vekili Av. Talip Furkan Doğan',
      defendant: 'Ahmet Yılmaz',
      requestedPenalty: '3 aya kadar tazyik hapsi',
      hearings: [
        { id: 1, date: '2025-01-15T10:00:00Z', type: 'İlk Duruşma', result: 'Sanık hazır, savunması alındı. Karar için süre verildi.', nextDate: '2025-02-20T10:00:00Z' },
      ],
      documents: [
        { id: 1, name: 'Şikayet Dilekçesi', date: '2024-12-15T00:00:00Z', type: 'dilekce' },
        { id: 2, name: 'Taahhüt Tutanağı Sureti', date: '2024-10-01T00:00:00Z', type: 'tutanak' },
        { id: 3, name: 'Ödeme Tablosu', date: '2024-12-15T00:00:00Z', type: 'tablo' },
      ]
    },
    {
      id: 2, type: 'itiraz', status: 'completed',
      courtName: 'İstanbul 3. İcra Hukuk Mahkemesi',
      caseNumber: '2024/8901',
      filingDate: '2024-10-05T00:00:00Z',
      nextHearingDate: null,
      subject: 'İtirazın Kaldırılması (İİK m.68)',
      description: 'Borçlunun ödeme emrine itirazının kaldırılması talebi. Mahkeme itirazın kaldırılmasına karar vermiştir.',
      plaintiff: 'ABC Bankası vekili Av. Talip Furkan Doğan',
      defendant: 'Ahmet Yılmaz',
      requestedPenalty: null,
      result: 'KABUL - İtirazın kaldırılmasına, %20 icra inkar tazminatına hükmedilmiştir.',
      hearings: [
        { id: 1, date: '2024-10-20T10:00:00Z', type: 'İlk Duruşma', result: 'Taraflar dinlendi, belge inceleme yapıldı.', nextDate: '2024-11-15T10:00:00Z' },
        { id: 2, date: '2024-11-15T10:00:00Z', type: 'Karar Duruşması', result: 'İtirazın kaldırılmasına, %20 icra inkar tazminatına karar verildi.', nextDate: null },
      ],
      documents: [
        { id: 1, name: 'Dava Dilekçesi', date: '2024-10-05T00:00:00Z', type: 'dilekce' },
        { id: 2, name: 'Gerekçeli Karar', date: '2024-11-15T00:00:00Z', type: 'karar' },
      ]
    },
  ],
  tebligats: [
    { id: 1, type: 'odeme_emri', status: 'delivered', recipient: 'Ahmet Yılmaz', address: 'Kadıköy, Caferağa Mah. Moda Cad. No:15 D:8 İstanbul', sentDate: '2024-10-01T00:00:00Z', deliveryDate: '2024-10-05T00:00:00Z', pttBarcode: 'RR123456789TR', deliveryMethod: 'Elden teslim (7201 s.K. m.21)' },
    { id: 2, type: '103_davetiye', status: 'delivered', recipient: 'Ahmet Yılmaz', address: 'Kadıköy, Caferağa Mah. Moda Cad. No:15 D:8 İstanbul', sentDate: '2024-11-15T00:00:00Z', deliveryDate: '2024-11-18T00:00:00Z', pttBarcode: 'RR987654321TR', deliveryMethod: 'Elden teslim' },
    { id: 3, type: 'haciz_ihbarnamesi', status: 'sent', recipient: 'Ziraat Bankası Genel Müdürlüğü', address: 'Atatürk Bulvarı No:8 Ulus/Ankara', sentDate: '2024-11-20T00:00:00Z', deliveryDate: null, pttBarcode: 'RR456789012TR', deliveryMethod: null },
    { id: 4, type: 'maas_haczi_muze', status: 'delivered', recipient: 'ABC Tekstil San. ve Tic. A.Ş.', address: 'Osmanbey, Halaskargazi Cad. No:200 Şişli/İstanbul', sentDate: '2024-12-05T00:00:00Z', deliveryDate: '2024-12-08T00:00:00Z', pttBarcode: 'RR111222333TR', deliveryMethod: 'Elden teslim' },
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
