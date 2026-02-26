import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function d(offset: number): Date {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return now;
}

async function main() {
  await prisma.caseNotification.deleteMany();
  await prisma.caseNote.deleteMany();
  await prisma.commitmentInstallment.deleteMany();
  await prisma.commitment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.case.deleteMany();
  await prisma.court.deleteMany();
  await prisma.creditor.deleteMany();
  await prisma.debtor.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──
  const admin = await prisma.user.create({
    data: { email: 'talipfurkan@lawara.co', name: 'Talip Furkan Doğan', password: 'admin123', role: 'admin', phone: '+90 532 123 45 67' },
  });
  const user2 = await prisma.user.create({
    data: { email: 'yuksel@lawara.co', name: 'Yüksel Martı', password: 'user123', role: 'user', phone: '+90 533 987 65 43' },
  });

  // ── Courts ──
  const courts = [];
  const courtData = [
    { name: 'İstanbul 5. İcra Dairesi', city: 'İstanbul', district: 'Çağlayan', uyapCode: 'IST05' },
    { name: 'Ankara 3. İcra Dairesi', city: 'Ankara', district: 'Çankaya', uyapCode: 'ANK03' },
    { name: 'İzmir 2. İcra Dairesi', city: 'İzmir', district: 'Konak', uyapCode: 'IZM02' },
    { name: 'Bursa 1. İcra Dairesi', city: 'Bursa', district: 'Osmangazi', uyapCode: 'BRS01' },
    { name: 'Antalya 4. İcra Dairesi', city: 'Antalya', district: 'Muratpaşa', uyapCode: 'ANT04' },
    { name: 'İstanbul 8. İcra Dairesi', city: 'İstanbul', district: 'Çağlayan', uyapCode: 'IST08' },
    { name: 'İstanbul 12. İcra Dairesi', city: 'İstanbul', district: 'Çağlayan', uyapCode: 'IST12' },
    { name: 'Ankara 6. İcra Dairesi', city: 'Ankara', district: 'Çankaya', uyapCode: 'ANK06' },
    { name: 'İzmir 5. İcra Dairesi', city: 'İzmir', district: 'Konak', uyapCode: 'IZM05' },
    { name: 'Bursa 3. İcra Dairesi', city: 'Bursa', district: 'Osmangazi', uyapCode: 'BRS03' },
    { name: 'Konya 2. İcra Dairesi', city: 'Konya', district: 'Selçuklu', uyapCode: 'KNY02' },
    { name: 'Gaziantep 1. İcra Dairesi', city: 'Gaziantep', district: 'Şahinbey', uyapCode: 'GAZ01' },
  ];
  for (const c of courtData) {
    courts.push(await prisma.court.create({ data: { ...c, type: 'icra' } }));
  }

  // ── Creditors ──
  const creditors = [];
  const creditorData = [
    { name: 'Türkiye İş Bankası', taxNumber: '1234567890', type: 'bank', phone: '0212 316 00 00', email: 'icra@isbank.com.tr' },
    { name: 'Garanti BBVA', taxNumber: '2345678901', type: 'bank', phone: '0212 318 18 18', email: 'icra@garantibbva.com.tr' },
    { name: 'Yapı Kredi', taxNumber: '3456789012', type: 'bank', phone: '0212 339 70 00', email: 'icra@yapikredi.com.tr' },
    { name: 'Akbank', taxNumber: '4567890123', type: 'bank', phone: '0212 444 25 25', email: 'icra@akbank.com' },
    { name: 'QNB Finansbank', taxNumber: '5678901234', type: 'bank', phone: '0212 318 50 00' },
    { name: 'Anadolu Faktoring', taxNumber: '6789012345', type: 'company', phone: '0212 340 22 00' },
    { name: 'Deniz Leasing', taxNumber: '7890123456', type: 'company', phone: '0212 336 36 36' },
    { name: 'Halk Faktoring', taxNumber: '8901234567', type: 'company', phone: '0212 251 70 70' },
    { name: 'Mehmet Karaca', taxNumber: '9012345678', type: 'individual', phone: '0532 444 55 66' },
    { name: 'Ziraat Bankası', taxNumber: '0123456789', type: 'bank', phone: '0312 584 20 00', email: 'icra@ziraatbank.com.tr' },
  ];
  for (const c of creditorData) {
    creditors.push(await prisma.creditor.create({ data: c }));
  }

  // ── Debtors ──
  const debtors = [];
  const debtorData = [
    { tcNo: '12345678901', firstName: 'Ahmet', lastName: 'Yılmaz', phone: '0532 111 22 33', email: 'ahmet.yilmaz@email.com', city: 'İstanbul', district: 'Kadıköy', address: 'Caferağa Mah. Moda Cad. No:15' },
    { tcNo: '23456789012', firstName: 'Mehmet', lastName: 'Kaya', phone: '0545 222 33 44', city: 'Ankara', district: 'Çankaya', address: 'Kızılay Mah. Atatürk Blv. No:42' },
    { tcNo: '34567890123', firstName: 'Ayşe', lastName: 'Demir', phone: '0555 333 44 55', email: 'ayse.demir@email.com', city: 'İzmir', district: 'Konak', address: 'Alsancak Mah. Kordon Cad. No:8' },
    { tcNo: '45678901234', firstName: 'Fatma', lastName: 'Çelik', phone: '0542 444 55 66', city: 'Bursa', district: 'Osmangazi', address: 'Heykel Mah. Atatürk Cad. No:23' },
    { tcNo: '56789012345', firstName: 'Ali', lastName: 'Öztürk', phone: '0533 555 66 77', city: 'Antalya', district: 'Muratpaşa', address: 'Lara Mah. Güllük Cad. No:56' },
    { tcNo: '67890123456', firstName: 'Zeynep', lastName: 'Arslan', phone: '0544 666 77 88', email: 'zeynep@email.com', city: 'İstanbul', district: 'Beşiktaş', address: 'Levent Mah. Büyükdere Cad. No:99' },
    { tcNo: '78901234567', firstName: 'Mustafa', lastName: 'Şahin', phone: '0535 777 88 99', city: 'Ankara', district: 'Keçiören', address: 'Etlik Mah. Keçiören Cad. No:12' },
    { tcNo: '89012345678', firstName: 'Elif', lastName: 'Yıldız', phone: '0546 888 99 00', city: 'İzmir', district: 'Bornova', address: 'Erzene Mah. Ankara Cad. No:34' },
    { tcNo: '90123456789', firstName: 'Hasan', lastName: 'Koç', phone: '0537 999 00 11', city: 'İstanbul', district: 'Şişli', address: 'Mecidiyeköy Mah. Büyükdere Cad. No:67' },
    { tcNo: '01234567890', firstName: 'Selin', lastName: 'Aydın', phone: '0548 000 11 22', city: 'Bursa', district: 'Nilüfer', address: 'Görükle Mah. Üniversite Cad. No:45' },
    { tcNo: '11223344556', firstName: 'Emre', lastName: 'Yılmaz', phone: '0539 112 23 34', city: 'Konya', district: 'Selçuklu', address: 'Bosna Hersek Mah. Yeni Cad. No:7' },
    { tcNo: '22334455667', firstName: 'Derya', lastName: 'Aksoy', phone: '0541 223 34 45', city: 'Gaziantep', district: 'Şahinbey', address: 'İnönü Mah. Suburcu Cad. No:18' },
    { tcNo: '33445566778', firstName: 'Burak', lastName: 'Erdoğan', phone: '0536 334 45 56', city: 'İstanbul', district: 'Ümraniye', address: 'Atatürk Mah. Alemdağ Cad. No:33' },
    { tcNo: '44556677889', firstName: 'Canan', lastName: 'Polat', phone: '0543 445 56 67', city: 'Ankara', district: 'Mamak', address: 'Abidinpaşa Mah. Cevizlidere Cad. No:9' },
    { tcNo: '55667788990', firstName: 'Oğuz', lastName: 'Kılıç', phone: '0538 556 67 78', city: 'İzmir', district: 'Karşıyaka', address: 'Bostanlı Mah. Cemal Gürsel Cad. No:21' },
  ];
  for (const dd of debtorData) {
    debtors.push(await prisma.debtor.create({ data: dd }));
  }

  // ── Cases (25 dosya) ──
  const casesRaw = [
    { no: '2024/1234', dI: 0, cI: 0, coI: 0, p: 35000, i: 10230, t: 'ilamli', s: 'active', foy: 'F-101' },
    { no: '2024/1235', dI: 1, cI: 1, coI: 1, p: 100000, i: 28500, t: 'ilamsiz', s: 'pending' },
    { no: '2024/1236', dI: 2, cI: 2, coI: 2, p: 55000, i: 12890, t: 'ilamli', s: 'completed' },
    { no: '2024/1237', dI: 3, cI: 3, coI: 3, p: 20000, i: 3450, t: 'kambiyo', s: 'active' },
    { no: '2024/1238', dI: 4, cI: 4, coI: 4, p: 75000, i: 14120, t: 'ilamsiz', s: 'warning' },
    { no: '2024/1239', dI: 5, cI: 5, coI: 5, p: 130000, i: 26780, t: 'ilamli', s: 'active', foy: 'F-102' },
    { no: '2024/1240', dI: 6, cI: 6, coI: 7, p: 28000, i: 6560, t: 'kambiyo', s: 'pending' },
    { no: '2024/1241', dI: 7, cI: 7, coI: 8, p: 65000, i: 13900, t: 'ilamsiz', s: 'completed' },
    { no: '2024/1242', dI: 8, cI: 0, coI: 6, p: 200000, i: 34500, t: 'ilamli', s: 'active', foy: 'F-103' },
    { no: '2024/1243', dI: 9, cI: 1, coI: 9, p: 38000, i: 7670, t: 'kambiyo', s: 'warning' },
    { no: '2024/1244', dI: 0, cI: 2, coI: 5, p: 32100, i: 8200, t: 'ilamsiz', s: 'active' },
    { no: '2023/8976', dI: 0, cI: 3, coI: 1, p: 18500, i: 4300, t: 'ilamli', s: 'completed' },
    { no: '2024/1245', dI: 10, cI: 9, coI: 10, p: 42000, i: 9800, t: 'ilamsiz', s: 'active' },
    { no: '2024/1246', dI: 11, cI: 0, coI: 11, p: 88000, i: 21500, t: 'ilamli', s: 'pending' },
    { no: '2024/1247', dI: 12, cI: 4, coI: 0, p: 15000, i: 2100, t: 'kambiyo', s: 'active' },
    { no: '2024/1248', dI: 13, cI: 5, coI: 7, p: 310000, i: 67000, t: 'ilamli', s: 'warning' },
    { no: '2024/1249', dI: 14, cI: 8, coI: 8, p: 22000, i: 4800, t: 'ilamsiz', s: 'active' },
    { no: '2024/1250', dI: 0, cI: 9, coI: 0, p: 47500, i: 11200, t: 'kambiyo', s: 'active', foy: 'F-101' },
    { no: '2023/7654', dI: 5, cI: 1, coI: 5, p: 92000, i: 31000, t: 'ilamli', s: 'completed' },
    { no: '2023/7655', dI: 3, cI: 2, coI: 3, p: 8500, i: 1200, t: 'ilamsiz', s: 'completed' },
    { no: '2024/1251', dI: 8, cI: 6, coI: 6, p: 175000, i: 42000, t: 'ilamli', s: 'active' },
    { no: '2024/1252', dI: 1, cI: 7, coI: 1, p: 56000, i: 12300, t: 'kambiyo', s: 'pending' },
    { no: '2024/1253', dI: 6, cI: 3, coI: 7, p: 29000, i: 5600, t: 'ilamsiz', s: 'warning' },
    { no: '2024/1254', dI: 9, cI: 4, coI: 9, p: 120000, i: 28900, t: 'ilamli', s: 'active' },
    { no: '2024/1255', dI: 4, cI: 9, coI: 4, p: 63000, i: 14500, t: 'kambiyo', s: 'pending' },
  ];

  const cases = [];
  for (let idx = 0; idx < casesRaw.length; idx++) {
    const c = casesRaw[idx];
    const created = await prisma.case.create({
      data: {
        caseNumber: c.no,
        foyNumber: c.foy || null,
        debtorId: debtors[c.dI].id,
        creditorId: creditors[c.cI].id,
        courtId: courts[c.coI].id,
        principalAmount: c.p,
        interestAmount: c.i,
        totalAmount: c.p + c.i,
        caseType: c.t,
        status: c.s,
        openDate: d(-90 + idx * 3),
        createdById: idx % 3 === 0 ? user2.id : admin.id,
      },
    });
    cases.push(created);
  }

  // ── Transactions (çok sayıda) ──
  const txData = [
    { ci: 0, t: 'income', a: 15000, desc: 'Kısmi tahsilat - banka havalesi' },
    { ci: 0, t: 'expense', a: 2500, desc: 'Harç ödemesi - İstanbul 5. İcra' },
    { ci: 0, t: 'income', a: 8000, desc: 'İkinci kısmi ödeme' },
    { ci: 0, t: 'expense', a: 350, desc: 'Tebligat masrafı' },
    { ci: 1, t: 'income', a: 25000, desc: 'Kısmi ödeme - Mehmet Kaya' },
    { ci: 1, t: 'expense', a: 1800, desc: 'Harç ve masraf' },
    { ci: 2, t: 'income', a: 67890, desc: 'Tam tahsilat - Ayşe Demir' },
    { ci: 2, t: 'expense', a: 3200, desc: 'Harç + vekalet ücreti' },
    { ci: 3, t: 'income', a: 10000, desc: 'Tahsilat - Fatma Çelik' },
    { ci: 3, t: 'expense', a: 850, desc: 'Tebligat masrafı' },
    { ci: 3, t: 'income', a: 5000, desc: 'İkinci taksit ödemesi' },
    { ci: 4, t: 'expense', a: 1200, desc: 'Haciz masrafı' },
    { ci: 5, t: 'income', a: 45000, desc: 'Kısmi tahsilat - Zeynep Arslan' },
    { ci: 5, t: 'expense', a: 4500, desc: 'Harç ödemesi' },
    { ci: 5, t: 'income', a: 30000, desc: 'İkinci ödeme' },
    { ci: 7, t: 'income', a: 78900, desc: 'Tam tahsilat - Elif Yıldız' },
    { ci: 8, t: 'income', a: 50000, desc: 'Kısmi ödeme - Hasan Koç' },
    { ci: 8, t: 'expense', a: 6500, desc: 'Harç + masraflar' },
    { ci: 8, t: 'income', a: 80000, desc: 'İkinci büyük ödeme' },
    { ci: 9, t: 'expense', a: 750, desc: 'Tebligat masrafı' },
    { ci: 11, t: 'income', a: 22800, desc: 'Tam tahsilat - eski dosya' },
    { ci: 12, t: 'income', a: 15000, desc: 'Kısmi ödeme - Emre Yılmaz' },
    { ci: 14, t: 'income', a: 8500, desc: 'İlk taksit - Burak Erdoğan' },
    { ci: 16, t: 'income', a: 12000, desc: 'Kısmi ödeme - Oğuz Kılıç' },
    { ci: 17, t: 'income', a: 20000, desc: 'Kısmi tahsilat' },
    { ci: 18, t: 'income', a: 123000, desc: 'Tam tahsilat - Zeynep Arslan' },
    { ci: 19, t: 'income', a: 9700, desc: 'Tam tahsilat - Fatma Çelik' },
    { ci: 20, t: 'income', a: 60000, desc: 'Kısmi ödeme - Hasan Koç' },
    { ci: 20, t: 'expense', a: 8000, desc: 'Harç + vekalet' },
    { ci: 23, t: 'income', a: 35000, desc: 'İlk ödeme - Selin Aydın' },
  ];
  for (let i = 0; i < txData.length; i++) {
    const tx = txData[i];
    await prisma.transaction.create({
      data: {
        caseId: cases[tx.ci].id,
        type: tx.t,
        amount: tx.a,
        description: tx.desc,
        transactionDate: d(-60 + i * 2),
        createdById: i % 2 === 0 ? admin.id : user2.id,
      },
    });
  }

  // ── Commitments + Installments ──
  const com1 = await prisma.commitment.create({
    data: { caseId: cases[0].id, totalAmount: 45230, installmentCount: 6, paidCount: 3, status: 'active', startDate: d(-60), nextPaymentDate: d(15), nextPaymentAmount: 7538.33 },
  });
  for (let i = 1; i <= 6; i++) {
    await prisma.commitmentInstallment.create({
      data: { commitmentId: com1.id, installmentNumber: i, amount: 7538.33, dueDate: d(-60 + i * 30), paidDate: i <= 3 ? d(-60 + i * 30 + 2) : null, status: i <= 3 ? 'paid' : i === 4 ? 'pending' : 'pending' },
    });
  }

  const com2 = await prisma.commitment.create({
    data: { caseId: cases[3].id, totalAmount: 23450, installmentCount: 4, paidCount: 2, status: 'active', startDate: d(-45), nextPaymentDate: d(10), nextPaymentAmount: 5862.50 },
  });
  for (let i = 1; i <= 4; i++) {
    await prisma.commitmentInstallment.create({
      data: { commitmentId: com2.id, installmentNumber: i, amount: 5862.50, dueDate: d(-45 + i * 30), paidDate: i <= 2 ? d(-45 + i * 30 + 1) : null, status: i <= 2 ? 'paid' : 'pending' },
    });
  }

  const com3 = await prisma.commitment.create({
    data: { caseId: cases[1].id, totalAmount: 128500, installmentCount: 10, paidCount: 1, status: 'active', startDate: d(-30), nextPaymentDate: d(5), nextPaymentAmount: 12850 },
  });
  for (let i = 1; i <= 10; i++) {
    await prisma.commitmentInstallment.create({
      data: { commitmentId: com3.id, installmentNumber: i, amount: 12850, dueDate: d(-30 + i * 30), paidDate: i === 1 ? d(-28) : null, status: i === 1 ? 'paid' : 'pending' },
    });
  }

  const com4 = await prisma.commitment.create({
    data: { caseId: cases[7].id, totalAmount: 78900, installmentCount: 8, paidCount: 8, status: 'completed', startDate: d(-240) },
  });
  for (let i = 1; i <= 8; i++) {
    await prisma.commitmentInstallment.create({
      data: { commitmentId: com4.id, installmentNumber: i, amount: 9862.50, dueDate: d(-240 + i * 30), paidDate: d(-240 + i * 30 + 3), status: 'paid' },
    });
  }

  const com5 = await prisma.commitment.create({
    data: { caseId: cases[4].id, totalAmount: 89120, installmentCount: 5, paidCount: 1, status: 'violated', startDate: d(-90), nextPaymentDate: d(-30), nextPaymentAmount: 17824 },
  });
  for (let i = 1; i <= 5; i++) {
    await prisma.commitmentInstallment.create({
      data: { commitmentId: com5.id, installmentNumber: i, amount: 17824, dueDate: d(-90 + i * 30), paidDate: i === 1 ? d(-88) : null, status: i === 1 ? 'paid' : 'overdue' },
    });
  }

  // ── Case Notes ──
  const noteData = [
    { ci: 0, content: 'Borçlu ile görüşüldü. Bu hafta sonuna kadar ödemeyi yapacağını söyledi.', type: 'note', uid: admin.id },
    { ci: 0, content: 'DİKKAT: Borçlu daha önce 2 kez sözünü tutmadı. Hacze hazırlık yapılsın.', type: 'warning', uid: user2.id },
    { ci: 0, content: 'Cuma günü tekrar aranacak - ödeme kontrolü', type: 'reminder', uid: admin.id },
    { ci: 1, content: 'Taahhüt alındı, 10 taksit halinde ödeyecek.', type: 'note', uid: admin.id },
    { ci: 1, content: 'İlk taksit zamanında yatırıldı.', type: 'note', uid: user2.id },
    { ci: 2, content: 'Tam tahsilat yapıldı. Dosya kapatılabilir.', type: 'note', uid: admin.id },
    { ci: 3, content: 'Borçlu düzenli ödüyor, takip devam.', type: 'note', uid: admin.id },
    { ci: 3, content: 'Pazartesi tekrar aranacak.', type: 'reminder', uid: user2.id },
    { ci: 4, content: 'UYARI: Borçlu telefonlara cevap vermiyor. Adres tespiti yapılacak.', type: 'warning', uid: admin.id },
    { ci: 4, content: 'Taahhüt ihlal edildi. Haciz kararı alınacak.', type: 'warning', uid: user2.id },
    { ci: 5, content: 'Borçlu ile anlaşma sağlandı. Kalan tutar 2 taksitte ödenecek.', type: 'note', uid: admin.id },
    { ci: 8, content: 'Büyük dosya - müvekkil ile haftalık rapor paylaşılacak.', type: 'note', uid: admin.id },
    { ci: 8, content: '130.000 TL tahsil edildi, kalan 104.500 TL.', type: 'note', uid: user2.id },
    { ci: 9, content: 'Borçlu yurt dışına çıkış yasağı talep edilecek.', type: 'warning', uid: admin.id },
    { ci: 12, content: 'Yeni dosya açıldı, tebligat gönderilecek.', type: 'note', uid: admin.id },
    { ci: 15, content: 'DİKKAT: Çok yüksek tutarlı dosya. Öncelikli takip.', type: 'warning', uid: admin.id },
    { ci: 15, content: 'Borçlu avukatı ile görüşüldü, ödeme planı teklif edildi.', type: 'note', uid: user2.id },
    { ci: 20, content: 'Kısmi ödeme alındı, kalan için haciz hazırlığı.', type: 'note', uid: admin.id },
    { ci: 22, content: 'Borçlu adres değiştirmiş, yeni adres tespit edildi.', type: 'warning', uid: user2.id },
    { ci: 23, content: 'İlk ödeme alındı, takip devam ediyor.', type: 'note', uid: admin.id },
  ];
  for (const n of noteData) {
    await prisma.caseNote.create({
      data: { caseId: cases[n.ci].id, userId: n.uid, content: n.content, type: n.type },
    });
  }

  // ── Notifications ──
  const notifData = [
    { ci: 0, type: 'sms', recipient: '0532 111 22 33', content: 'Sayın Ahmet Yılmaz, 2024/1234 no.lu dosyanız için ödeme hatırlatması.', status: 'delivered' },
    { ci: 0, type: 'tebligat', recipient: 'Ahmet Yılmaz - Caferağa Mah.', content: 'Ödeme Emri Tebligatı', status: 'delivered', pttBarcode: 'RR123456789TR' },
    { ci: 0, type: 'email', recipient: 'ahmet.yilmaz@email.com', content: 'Ödeme hatırlatması - 2024/1234', status: 'delivered' },
    { ci: 1, type: 'sms', recipient: '0545 222 33 44', content: 'Taahhüt taksit hatırlatması', status: 'delivered' },
    { ci: 1, type: 'tebligat', recipient: 'Mehmet Kaya - Kızılay Mah.', content: '7 Örnek Ödeme Emri', status: 'sent', pttBarcode: 'RR234567890TR' },
    { ci: 2, type: 'sms', recipient: '0555 333 44 55', content: 'Dosyanız kapatılmıştır. Teşekkürler.', status: 'delivered' },
    { ci: 3, type: 'sms', recipient: '0542 444 55 66', content: 'Taksit ödeme hatırlatması', status: 'delivered' },
    { ci: 4, type: 'sms', recipient: '0533 555 66 77', content: 'Acil ödeme hatırlatması', status: 'failed' },
    { ci: 4, type: 'sms', recipient: '0533 555 66 77', content: 'İkinci ödeme hatırlatması', status: 'failed' },
    { ci: 4, type: 'tebligat', recipient: 'Ali Öztürk - Lara Mah.', content: 'Haciz İhbarnamesi', status: 'pending', pttBarcode: 'RR345678901TR' },
    { ci: 5, type: 'sms', recipient: '0544 666 77 88', content: 'Ödeme planı onaylandı', status: 'delivered' },
    { ci: 8, type: 'sms', recipient: '0537 999 00 11', content: 'Kalan borç hatırlatması', status: 'delivered' },
    { ci: 8, type: 'call', recipient: '0537 999 00 11', content: 'Otomatik arama - ödeme hatırlatma', status: 'delivered' },
    { ci: 9, type: 'tebligat', recipient: 'Selin Aydın - Görükle Mah.', content: 'Ödeme Emri', status: 'sent', pttBarcode: 'RR456789012TR' },
    { ci: 12, type: 'sms', recipient: '0539 112 23 34', content: 'Yeni dosya açılmıştır', status: 'delivered' },
    { ci: 15, type: 'sms', recipient: '0543 445 56 67', content: 'Acil ödeme talebi', status: 'delivered' },
    { ci: 15, type: 'tebligat', recipient: 'Canan Polat - Abidinpaşa Mah.', content: 'Haciz İhbarnamesi', status: 'pending', pttBarcode: 'RR567890123TR' },
  ];
  for (const n of notifData) {
    await prisma.caseNotification.create({
      data: { caseId: cases[n.ci].id, type: n.type, recipient: n.recipient, content: n.content, status: n.status, pttBarcode: n.pttBarcode || null },
    });
  }

  // ── Post-it Notes ──
  await prisma.postItNote.deleteMany();
  await prisma.postItNote.createMany({
    data: [
      { userId: admin.id, title: 'AYŞE Yıldız Alacaklı', content: 'Pazartesi Aranacak', color: 'yellow', caseId: 'GENEL - 1141', pinned: true },
      { userId: admin.id, title: 'Elektrik Faturası', content: 'Borçlar ile telefonda görüşüp KVKK bilgilerini vermemiz gerekiyor.', color: 'blue' },
      { userId: admin.id, title: 'Eski Bilgiler', content: 'Güncelleme:\n0532 654 8412 9232\n0532 9632 72', color: 'pink' },
      { userId: user2.id, title: 'Haciz Hazırlığı', content: '2024/1238 dosyası için haciz kararı alınacak. Araç tespiti yapıldı.', color: 'green' },
      { userId: admin.id, title: 'Müvekkil Toplantısı', content: 'Cuma 14:00 - Türkiye İş Bankası ile portföy değerlendirme toplantısı', color: 'purple' },
    ],
  });

  console.log('✅ Seed completed!');
  console.log(`   ${cases.length} dosya, ${debtors.length} borçlu, ${creditors.length} alacaklı, ${courts.length} mahkeme`);
  console.log(`   ${txData.length} işlem, 5 taahhüt, ${noteData.length} not, ${notifData.length} bildirim, 5 post-it`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
