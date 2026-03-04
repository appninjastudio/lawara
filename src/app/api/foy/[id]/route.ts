// İcra Föyü API Route - Kapsamlı İcra Dosyası Takip Sistemi
import { NextRequest, NextResponse } from 'next/server';
import type {
  IcraFoyu, IcraDosyasi, Taraf, AlacakKalemi, Tahsilat,
  IslemKaydi, Tebligat, Haciz, MalvarligiArastirmasi,
  OperasyonelTakip, BorcluGorusmesi, YerindeZiyaret, HesaplananDegerler,
} from '@/types/icra-foyu';

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const MOCK_DOSYA: IcraDosyasi = {
  id: 1,
  foyNo: 'F-2024-001',
  icraDairesi: 'İstanbul 5. İcra Dairesi',
  icraDairesiKodu: 'IST-ICR-005',
  dosyaYili: 2024,
  dosyaNo: '2024/1234',
  takipTuru: 'ilamsiz',
  dosyaAcilisTarihi: '2024-10-01',
  dosyaKapanisTarihi: null,
  dosyaStatusu: 'haciz_asamasinda',
  dosyaSorumlusu: 'Talip Furkan Doğan',
  dosyaSorumlusuId: 1,
  muvekkilId: 1,
  muvekkilAdi: 'ABC Bankası A.Ş.',
  muvekkilTuru: 'banka',
  icraBankaAdi: 'Ziraat Bankası',
  icraBankaIban: 'TR12 0001 0012 3456 7890 1234 56',
  icraBankaHesapNo: '1234-5678901',
  mtsTakibi: false,
  faizTuru: 'ticari_temerrut',
  faizOrani: 24,
  faizBaslangicTarihi: '2024-06-15',
  infazTarihi: null,
  aboneNo: 'ABN-2024-0042',
  musteriKodu: 'MK-00142',
  klasorNo: 'KL-A/2024/012',
  sistemNo: 'SYS-00001',
  createdAt: '2024-10-01T08:00:00Z',
  updatedAt: '2025-01-15T16:30:00Z',
  createdBy: 1,
};

const MOCK_TARAFLAR: Taraf[] = [
  {
    id: 1, dosyaId: 1, tarafRolu: 'alacakli', kisiTuru: 'tuzel',
    tckn: null, ad: 'ABC Bankası', soyad: 'A.Ş.', vkn: '1234567890',
    unvan: 'ABC Bankası Anonim Şirketi',
    telefon1: '02121234567', telefon2: null, eposta: 'hukuk@abcbanka.com.tr',
    adres: 'Levent Mah. Büyükdere Cad. No:100 Beşiktaş/İstanbul',
    il: 'İstanbul', ilce: 'Beşiktaş', postaKodu: '34340',
    mernisTarihi: null, mernisAdresi: null,
    dogumTarihi: null, babaAdi: null, anaAdi: null, dogumYeri: null,
    not: 'Müvekkil banka. İrtibat: Hukuk Müşavirliği',
    createdAt: '2024-10-01T08:00:00Z', updatedAt: '2024-10-01T08:00:00Z',
  },
  {
    id: 2, dosyaId: 1, tarafRolu: 'borclu', kisiTuru: 'gercek',
    tckn: '12345678901', ad: 'Ahmet', soyad: 'Yılmaz', vkn: null, unvan: null,
    telefon1: '05321234567', telefon2: '05069876543', eposta: 'ahmet.yilmaz@email.com',
    adres: 'Caferağa Mah. Moda Cad. No:15 D:8 Kadıköy/İstanbul',
    il: 'İstanbul', ilce: 'Kadıköy', postaKodu: '34710',
    mernisTarihi: '2024-10-02', mernisAdresi: 'Caferağa Mah. Moda Cad. No:15 D:8 Kadıköy/İstanbul',
    dogumTarihi: '1985-03-15', babaAdi: 'Mehmet', anaAdi: 'Fatma', dogumYeri: 'İstanbul',
    not: 'Borçlu ile telefon görüşmesi yapıldı. Ödeme planı teklif edildi.',
    createdAt: '2024-10-01T08:00:00Z', updatedAt: '2025-01-10T14:00:00Z',
  },
  {
    id: 3, dosyaId: 1, tarafRolu: 'kefil', kisiTuru: 'gercek',
    tckn: '98765432109', ad: 'Fatma', soyad: 'Yılmaz', vkn: null, unvan: null,
    telefon1: '05441234567', telefon2: null, eposta: null,
    adres: 'Bağdat Cad. No:200 D:5 Kadıköy/İstanbul',
    il: 'İstanbul', ilce: 'Kadıköy', postaKodu: '34726',
    mernisTarihi: '2024-10-02', mernisAdresi: 'Bağdat Cad. No:200 D:5 Kadıköy/İstanbul',
    dogumTarihi: '1988-07-22', babaAdi: 'Ali', anaAdi: 'Ayşe', dogumYeri: 'Ankara',
    not: 'Müşterek borçlu ve müteselsil kefil',
    createdAt: '2024-10-01T08:00:00Z', updatedAt: '2024-10-01T08:00:00Z',
  },
];

const MOCK_ALACAK: AlacakKalemi = {
  id: 1, dosyaId: 1,
  anaPara: 100000,
  islemiFaiz: 8500,
  isleyecekFaiz: 16200,
  faizTuru: 'ticari_temerrut',
  faizOrani: 24,
  faizBaslangicTarihi: '2024-06-15',
  vekaletUcreti: 15300,
  icraHarci: 4550,
  basvuruHarci: 427.60,
  vekilHarci: 75,
  pesinHarc: 2275,
  tahsilHarci: 0,
  cezaeviHarci: 0,
  tebligatMasrafi: 680,
  postaMasrafi: 245,
  hacizMasrafi: 1200,
  bilirkisiUcreti: 0,
  diger_masraf: 350,
  masrafAciklamasi: 'UYAP harç, dosya fotokopi, noter masrafı',
  toplamAlacak: 149802.60,
  toplamTahsilat: 25000,
  kalanBorc: 124802.60,
  createdAt: '2024-10-01T08:00:00Z',
  updatedAt: '2025-01-15T16:30:00Z',
};

const MOCK_TAHSILATLAR: Tahsilat[] = [
  {
    id: 1, dosyaId: 1,
    tahsilatTarihi: '2024-12-05',
    tahsilatTutari: 10000,
    odemeYontemi: 'banka_havalesi',
    tahsilatiAlan: 'Talip Furkan Doğan',
    anaParaPayi: 6500, faizPayi: 2000, harcPayi: 1000, masrafPayi: 500,
    muvekkilGonderilenTutar: 8500,
    muvekkilGonderimTarihi: '2024-12-08',
    vekilUcretiKesintisi: 1500,
    guncelKalanBorc: 139802.60,
    makbuzNo: 'MKB-2024-0156',
    aciklama: 'Borçlu kısmi ödeme yaptı (banka havalesi)',
    createdAt: '2024-12-05T10:00:00Z',
    createdBy: 1,
  },
  {
    id: 2, dosyaId: 1,
    tahsilatTarihi: '2024-12-10',
    tahsilatTutari: 15000,
    odemeYontemi: 'icra_kasasi',
    tahsilatiAlan: 'İcra Müdürlüğü',
    anaParaPayi: 10000, faizPayi: 3000, harcPayi: 1500, masrafPayi: 500,
    muvekkilGonderilenTutar: 12750,
    muvekkilGonderimTarihi: '2024-12-15',
    vekilUcretiKesintisi: 2250,
    guncelKalanBorc: 124802.60,
    makbuzNo: 'MKB-2024-0162',
    aciklama: 'İcra kasasına yatırılan tutar',
    createdAt: '2024-12-10T14:00:00Z',
    createdBy: 1,
  },
];

const MOCK_ISLEM_GECMISI: IslemKaydi[] = [
  { id: 1, dosyaId: 1, islemTipi: 'takip_acildi', islemTarihi: '2024-10-01', aciklama: 'İlamsız icra takibi başlatıldı. Ödeme emri düzenlendi.', iliskiliTebligatId: null, iliskiliHacizId: null, iliskiliTahsilatId: null, sonuc: 'Takip açıldı', belgeNo: '2024/1234', yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: '2024-10-01T08:00:00Z' },
  { id: 2, dosyaId: 1, islemTipi: 'odeme_emri_gonderildi', islemTarihi: '2024-10-01', aciklama: 'Örnek 7 ödeme emri borçlu Ahmet Yılmaz adresine gönderildi.', iliskiliTebligatId: 1, iliskiliHacizId: null, iliskiliTahsilatId: null, sonuc: 'Postaya verildi', belgeNo: 'RR123456789TR', yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: '2024-10-15', hatirlatmaAciklamasi: 'Tebligat takibi', createdAt: '2024-10-01T09:00:00Z' },
  { id: 3, dosyaId: 1, islemTipi: 'tebligat_teslim_edildi', islemTarihi: '2024-10-05', aciklama: 'Ödeme emri tebliğ edildi. 7201 s.K. m.21 uyarınca elden teslim.', iliskiliTebligatId: 1, iliskiliHacizId: null, iliskiliTahsilatId: null, sonuc: 'Tebliğ edildi', belgeNo: 'RR123456789TR', yapanKisi: 'Sistem', yapanKisiId: 0, hatirlatmaTarihi: '2024-10-12', hatirlatmaAciklamasi: 'İtiraz süresi kontrolü (7 gün)', createdAt: '2024-10-05T14:00:00Z' },
  { id: 4, dosyaId: 1, islemTipi: 'haciz_talebi_verildi', islemTarihi: '2024-10-20', aciklama: 'İtiraz süresi doldu. Borçlu itiraz etmedi. Haciz talep edildi.', iliskiliTebligatId: null, iliskiliHacizId: null, iliskiliTahsilatId: null, sonuc: 'Talep verildi', belgeNo: null, yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: '2024-10-20T10:00:00Z' },
  { id: 5, dosyaId: 1, islemTipi: 'banka_haczi_gonderildi', islemTarihi: '2024-11-01', aciklama: '89/1 haciz ihbarnamesi tüm bankalara gönderildi.', iliskiliTebligatId: 3, iliskiliHacizId: 1, iliskiliTahsilatId: null, sonuc: 'Gönderildi', belgeNo: 'HCZ-2024-0089', yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: '2024-11-20', hatirlatmaAciklamasi: 'Banka cevapları kontrolü', createdAt: '2024-11-01T09:00:00Z' },
  { id: 6, dosyaId: 1, islemTipi: 'arac_haczi', islemTarihi: '2024-11-10', aciklama: 'Araç üzerine haciz şerhi konulması için EGM\'ye müzekkere yazıldı.', iliskiliTebligatId: null, iliskiliHacizId: 3, iliskiliTahsilatId: null, sonuc: 'Yakalama şerhi konuldu', belgeNo: 'MZK-2024-0145', yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: '2024-11-10T11:00:00Z' },
  { id: 7, dosyaId: 1, islemTipi: 'maas_haczi_gonderildi', islemTarihi: '2024-11-15', aciklama: 'Maaş haczi müzekkeresi borçlunun işverenine gönderildi.', iliskiliTebligatId: 4, iliskiliHacizId: 5, iliskiliTahsilatId: null, sonuc: 'İşveren tebellüğ etti', belgeNo: 'MZK-2024-0167', yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: '2025-02-01', hatirlatmaAciklamasi: 'İlk maaş kesintisi kontrolü', createdAt: '2024-11-15T10:00:00Z' },
  { id: 8, dosyaId: 1, islemTipi: 'tapu_haczi', islemTarihi: '2024-12-01', aciklama: 'Kadıköy ilçesi taşınmaz üzerine haciz şerhi konulması talebi.', iliskiliTebligatId: null, iliskiliHacizId: 4, iliskiliTahsilatId: null, sonuc: 'Şerh konuldu', belgeNo: 'MZK-2024-0198', yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: '2024-12-01T09:00:00Z' },
  { id: 9, dosyaId: 1, islemTipi: 'tahsilat_yapildi', islemTarihi: '2024-12-05', aciklama: 'Borçludan ₺10.000 kısmi ödeme alındı (banka havalesi).', iliskiliTebligatId: null, iliskiliHacizId: null, iliskiliTahsilatId: 1, sonuc: '₺10.000 tahsil', belgeNo: 'MKB-2024-0156', yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: '2024-12-05T10:00:00Z' },
  { id: 10, dosyaId: 1, islemTipi: 'tahsilat_yapildi', islemTarihi: '2024-12-10', aciklama: 'İcra kasasından ₺15.000 tahsilat.', iliskiliTebligatId: null, iliskiliHacizId: null, iliskiliTahsilatId: 2, sonuc: '₺15.000 tahsil', belgeNo: 'MKB-2024-0162', yapanKisi: 'İcra Müdürlüğü', yapanKisiId: 0, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: '2024-12-10T14:00:00Z' },
  { id: 11, dosyaId: 1, islemTipi: 'borclu_gorusmesi', islemTarihi: '2025-01-05', aciklama: 'Borçlu ile telefon görüşmesi. Kalan borç için taksit teklif edildi.', iliskiliTebligatId: null, iliskiliHacizId: null, iliskiliTahsilatId: null, sonuc: 'Borçlu düşünecek', belgeNo: null, yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: '2025-01-12', hatirlatmaAciklamasi: 'Borçlu geri dönüş yapacak', createdAt: '2025-01-05T11:00:00Z' },
  { id: 12, dosyaId: 1, islemTipi: 'uyap_sorgusu', islemTarihi: '2025-01-10', aciklama: 'UYAP üzerinden malvarlığı sorgusu yapıldı. SGK, araç, tapu kontrol edildi.', iliskiliTebligatId: null, iliskiliHacizId: null, iliskiliTahsilatId: null, sonuc: 'Sonuçlar dosyaya eklendi', belgeNo: null, yapanKisi: 'Talip Furkan Doğan', yapanKisiId: 1, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: '2025-01-10T14:00:00Z' },
];

const MOCK_TEBLIGATLAR: Tebligat[] = [
  { id: 1, dosyaId: 1, tebligatTuru: 'odeme_emri', tebligatDurumu: 'teslim_edildi', alici: 'Ahmet Yılmaz', aliciAdres: 'Caferağa Mah. Moda Cad. No:15 D:8 Kadıköy/İstanbul', hazirlanisTarihi: '2024-10-01', gonderimTarihi: '2024-10-01', teslimTarihi: '2024-10-05', iadeTarihi: null, pttBarkodu: 'RR123456789TR', teslimSekli: 'Elden teslim (7201 s.K. m.21)', iadeNedeni: null, aciklama: 'Örnek 7 ödeme emri', createdAt: '2024-10-01T08:00:00Z', createdBy: 1 },
  { id: 2, dosyaId: 1, tebligatTuru: 'odeme_emri', tebligatDurumu: 'teslim_edildi', alici: 'Fatma Yılmaz (Kefil)', aliciAdres: 'Bağdat Cad. No:200 D:5 Kadıköy/İstanbul', hazirlanisTarihi: '2024-10-01', gonderimTarihi: '2024-10-01', teslimTarihi: '2024-10-06', iadeTarihi: null, pttBarkodu: 'RR123456790TR', teslimSekli: 'Elden teslim', iadeNedeni: null, aciklama: 'Kefil için ödeme emri', createdAt: '2024-10-01T08:00:00Z', createdBy: 1 },
  { id: 3, dosyaId: 1, tebligatTuru: 'haciz_ihbarnamesi_1', tebligatDurumu: 'teslim_edildi', alici: 'Ziraat Bankası Genel Müdürlüğü', aliciAdres: 'Atatürk Bulvarı No:8 Ulus/Ankara', hazirlanisTarihi: '2024-11-01', gonderimTarihi: '2024-11-01', teslimTarihi: '2024-11-05', iadeTarihi: null, pttBarkodu: 'RR456789012TR', teslimSekli: 'Kurumsal teslim', iadeNedeni: null, aciklama: '89/1 haciz ihbarnamesi - Ziraat Bankası', createdAt: '2024-11-01T09:00:00Z', createdBy: 1 },
  { id: 4, dosyaId: 1, tebligatTuru: 'maas_haczi', tebligatDurumu: 'teslim_edildi', alici: 'ABC Tekstil San. ve Tic. A.Ş.', aliciAdres: 'Osmanbey, Halaskargazi Cad. No:200 Şişli/İstanbul', hazirlanisTarihi: '2024-11-15', gonderimTarihi: '2024-11-15', teslimTarihi: '2024-11-18', iadeTarihi: null, pttBarkodu: 'RR111222333TR', teslimSekli: 'Elden teslim', iadeNedeni: null, aciklama: 'Maaş haczi müzekkeresi', createdAt: '2024-11-15T10:00:00Z', createdBy: 1 },
  { id: 5, dosyaId: 1, tebligatTuru: '103_davetiye', tebligatDurumu: 'gonderildi', alici: 'Ahmet Yılmaz', aliciAdres: 'Caferağa Mah. Moda Cad. No:15 D:8 Kadıköy/İstanbul', hazirlanisTarihi: '2025-01-15', gonderimTarihi: '2025-01-15', teslimTarihi: null, iadeTarihi: null, pttBarkodu: 'RR999888777TR', teslimSekli: null, iadeNedeni: null, aciklama: '103 davetiyesi - kıymet takdiri için', createdAt: '2025-01-15T08:00:00Z', createdBy: 1 },
];

const MOCK_HACIZLER: Haciz[] = [
  { id: 1, dosyaId: 1, hacizTuru: 'banka', hacizDurumu: 'olumlu_cevap', talepTarihi: '2024-11-01', uygulamaTarihi: '2024-11-05', kaldirmaTarihi: null, hedefKurum: 'Ziraat Bankası', hedefAdres: 'Atatürk Bulvarı No:8 Ulus/Ankara', cevapTarihi: '2024-11-07', cevapDurumu: 'Olumlu', cevapAciklamasi: 'Hesapta ₺12.450 bloke edildi', blokeEdilen: 12450, tahsilEdilen: 0, detaylar: { bankaAdi: 'Ziraat Bankası', hesapTuru: 'Vadesiz TL', iban: 'TR12 0001 0012 3456 7890 1234 56', blokeEdilen: 12450 }, aciklama: 'Banka hesabı haczi (İİK 89/1)', muzakkereNo: 'MZK-2024-0089', createdAt: '2024-11-01T09:00:00Z', createdBy: 1 },
  { id: 2, dosyaId: 1, hacizTuru: 'banka', hacizDurumu: 'olumsuz_cevap', talepTarihi: '2024-11-01', uygulamaTarihi: '2024-11-05', kaldirmaTarihi: null, hedefKurum: 'Garanti BBVA', hedefAdres: 'Levent Nispetiye Mah. Aytar Cad. No:2 Beşiktaş/İstanbul', cevapTarihi: '2024-11-08', cevapDurumu: 'Olumsuz', cevapAciklamasi: 'Hesapta yeterli bakiye bulunmamaktadır', blokeEdilen: 0, tahsilEdilen: 0, detaylar: { bankaAdi: 'Garanti BBVA', hesapTuru: 'Vadesiz TL', iban: 'TR98 0006 2000 1234 0006 7890 12', blokeEdilen: 0 }, aciklama: 'Banka hesabı haczi - olumsuz', muzakkereNo: 'MZK-2024-0090', createdAt: '2024-11-01T09:00:00Z', createdBy: 1 },
  { id: 3, dosyaId: 1, hacizTuru: 'arac', hacizDurumu: 'uygulanidi', talepTarihi: '2024-11-10', uygulamaTarihi: '2024-11-12', kaldirmaTarihi: null, hedefKurum: 'EGM Trafik Tescil', hedefAdres: null, cevapTarihi: '2024-11-12', cevapDurumu: 'Olumlu', cevapAciklamasi: 'Yakalama şerhi konuldu', blokeEdilen: 0, tahsilEdilen: 0, detaylar: { plaka: '34 ABC 123', marka: 'Toyota', model: 'Corolla', modelYili: 2020, sasiNo: 'JTDBT923X01234567', motorNo: '1NZ-FE-1234567', tahminiDeger: 850000, yakalamaSerhi: true }, aciklama: 'Araç haczi - yakalama şerhi', muzakkereNo: 'MZK-2024-0145', createdAt: '2024-11-10T11:00:00Z', createdBy: 1 },
  { id: 4, dosyaId: 1, hacizTuru: 'tasinmaz', hacizDurumu: 'uygulanidi', talepTarihi: '2024-12-01', uygulamaTarihi: '2024-12-05', kaldirmaTarihi: null, hedefKurum: 'Kadıköy Tapu Müdürlüğü', hedefAdres: 'Kadıköy/İstanbul', cevapTarihi: '2024-12-05', cevapDurumu: 'Olumlu', cevapAciklamasi: 'Haciz şerhi tapuya işlendi', blokeEdilen: 0, tahsilEdilen: 0, detaylar: { adres: 'Caferağa Mah. Moda Cad. No:15 D:8', il: 'İstanbul', ilce: 'Kadıköy', ada: '3', parsel: '15', alan: '85 m²', tapuNo: 'T-2024-001234', mulkTuru: 'Mesken (Daire)', tahminiDeger: 4500000, ipotekBilgisi: 'Yapı Kredi Bankası - ₺2.100.000 ipotek' }, aciklama: 'Taşınmaz haczi', muzakkereNo: 'MZK-2024-0198', createdAt: '2024-12-01T09:00:00Z', createdBy: 1 },
  { id: 5, dosyaId: 1, hacizTuru: 'maas', hacizDurumu: 'uygulanidi', talepTarihi: '2024-11-15', uygulamaTarihi: '2024-11-18', kaldirmaTarihi: null, hedefKurum: 'ABC Tekstil San. ve Tic. A.Ş.', hedefAdres: 'Osmanbey, Halaskargazi Cad. No:200 Şişli/İstanbul', cevapTarihi: '2024-11-20', cevapDurumu: 'Olumlu', cevapAciklamasi: 'İşveren maaş haczi müzekkeresini tebellüğ etmiştir. Kesinti Ocak 2025 başlayacak.', blokeEdilen: 0, tahsilEdilen: 0, detaylar: { isveren: 'ABC Tekstil San. ve Tic. A.Ş.', isverenVkn: '9876543210', sgkNo: '1234567890', aylikMaas: 42500, kesintOrani: 25, kesintiTutari: 10625, baslangicTarihi: '2025-01-01', toplamTahsilat: 0 }, aciklama: 'Maaş haczi - %25 kesinti', muzakkereNo: 'MZK-2024-0167', createdAt: '2024-11-15T10:00:00Z', createdBy: 1 },
];

const MOCK_MALVARLIGI: MalvarligiArastirmasi[] = [
  { id: 1, dosyaId: 1, sorguTuru: 'sgk', sorguTarihi: '2024-10-10', sonuc: 'olumlu', sonucAciklamasi: 'Borçlu aktif çalışan olarak tespit edildi.', sonucVerisi: null, calistigiIsyeri: 'ABC Tekstil San. ve Tic. A.Ş.', sgkTescilNo: '1234567890', isBaslangicTarihi: '2022-03-01', bankaBilgileri: null, aracBilgileri: null, tapuBilgileri: null, notlar: 'SGK 4/a kapsamında çalışıyor. Aylık brüt maaş: ₺42.500', createdAt: '2024-10-10T09:00:00Z', createdBy: 1 },
  { id: 2, dosyaId: 1, sorguTuru: 'banka', sorguTarihi: '2024-10-10', sonuc: 'olumlu', sonucAciklamasi: 'Birden fazla banka hesabı tespit edildi.', sonucVerisi: null, calistigiIsyeri: null, sgkTescilNo: null, isBaslangicTarihi: null, bankaBilgileri: JSON.stringify([{ banka: 'Ziraat Bankası', hesapTuru: 'Vadesiz TL', bakiye: '12.450 TL' }, { banka: 'Garanti BBVA', hesapTuru: 'Vadesiz TL', bakiye: '245 TL' }, { banka: 'İş Bankası', hesapTuru: 'Vadeli TL', bakiye: '35.000 TL' }]), aracBilgileri: null, tapuBilgileri: null, notlar: 'Toplam 3 farklı bankada hesap mevcut', createdAt: '2024-10-10T09:30:00Z', createdBy: 1 },
  { id: 3, dosyaId: 1, sorguTuru: 'arac', sorguTarihi: '2024-10-10', sonuc: 'olumlu', sonucAciklamasi: '1 adet araç tespit edildi.', sonucVerisi: null, calistigiIsyeri: null, sgkTescilNo: null, isBaslangicTarihi: null, bankaBilgileri: null, aracBilgileri: JSON.stringify([{ plaka: '34 ABC 123', marka: 'Toyota', model: 'Corolla', yil: 2020 }]), tapuBilgileri: null, notlar: 'Araç borçlu adına tescilli. Tahmini değer: ₺850.000', createdAt: '2024-10-10T10:00:00Z', createdBy: 1 },
  { id: 4, dosyaId: 1, sorguTuru: 'tapu', sorguTarihi: '2024-10-10', sonuc: 'olumlu', sonucAciklamasi: '1 adet taşınmaz tespit edildi.', sonucVerisi: null, calistigiIsyeri: null, sgkTescilNo: null, isBaslangicTarihi: null, bankaBilgileri: null, aracBilgileri: null, tapuBilgileri: JSON.stringify([{ il: 'İstanbul', ilce: 'Kadıköy', ada: '3', parsel: '15', alan: '85 m²', mulkTuru: 'Mesken', tahminiDeger: '₺4.500.000' }]), notlar: 'Taşınmaz üzerinde Yapı Kredi Bankası ipoteği mevcut (₺2.100.000)', createdAt: '2024-10-10T10:30:00Z', createdBy: 1 },
  { id: 5, dosyaId: 1, sorguTuru: 'mernis', sorguTarihi: '2024-10-02', sonuc: 'olumlu', sonucAciklamasi: 'MERNİS adresi doğrulandı.', sonucVerisi: null, calistigiIsyeri: null, sgkTescilNo: null, isBaslangicTarihi: null, bankaBilgileri: null, aracBilgileri: null, tapuBilgileri: null, notlar: 'MERNİS adresi: Caferağa Mah. Moda Cad. No:15 D:8 Kadıköy/İstanbul', createdAt: '2024-10-02T09:00:00Z', createdBy: 1 },
];

const MOCK_OPERASYONEL: OperasyonelTakip = {
  id: 1, dosyaId: 1,
  sorumluPersonel: 'Talip Furkan Doğan',
  sorumluPersonelId: 1,
  sonIslemTarihi: '2025-01-15',
  sonrakiIslemTarihi: '2025-02-01',
  hatirlatmaTarihi: '2025-01-20',
  riskSkoru: 3,
  tahsilOlasiligi: 'yuksek',
  icNotlar: 'Borçlunun aktif çalışması ve taşınmaz varlığı sebebiyle tahsil olasılığı yüksek. Maaş haczi Ocak ayında başlayacak. Taşınmaz satışı da değerlendirilmeli. Borçlu ile son görüşmede ödeme planı teklif edildi, dönüş beklenilyor.',
  oncelik: 'yuksek',
  sonDurumOzeti: 'Haciz aşamasında. ₺25.000 tahsil edildi (toplam ₺149.802). Maaş haczi Ocak 2025 başlayacak. Banka haczi + araç haczi + tapu haczi aktif.',
  updatedAt: '2025-01-15T16:30:00Z',
};

const MOCK_GORUSMELER: BorcluGorusmesi[] = [
  { id: 1, dosyaId: 1, tarafId: 2, gorusmeTarihi: '2024-11-20', gorusmeTuru: 'telefon', gorusmeYapan: 'Talip Furkan Doğan', sonuc: 'belirsiz', odemeVaadi: false, vaadEdilenTutar: null, vaadEdilenTarih: null, aciklama: 'Borçlu ile ilk telefon görüşmesi yapıldı. Borçlu durumunu açıkladı, ödeme imkanı olmadığını beyan etti.', createdAt: '2024-11-20T14:00:00Z', createdBy: 1 },
  { id: 2, dosyaId: 1, tarafId: 2, gorusmeTarihi: '2024-12-02', gorusmeTuru: 'telefon', gorusmeYapan: 'Talip Furkan Doğan', sonuc: 'olumlu', odemeVaadi: true, vaadEdilenTutar: 10000, vaadEdilenTarih: '2024-12-05', aciklama: 'Borçlu ₺10.000 kısmi ödeme yapma sözü verdi. Banka havalesi ile ödeme yapacağını belirtti.', createdAt: '2024-12-02T11:00:00Z', createdBy: 1 },
  { id: 3, dosyaId: 1, tarafId: 2, gorusmeTarihi: '2025-01-05', gorusmeTuru: 'telefon', gorusmeYapan: 'Talip Furkan Doğan', sonuc: 'belirsiz', odemeVaadi: false, vaadEdilenTutar: null, vaadEdilenTarih: null, aciklama: 'Kalan borç için ödeme planı teklif edildi. 12 taksit × ₺10.400. Borçlu düşüneceğini söyledi.', createdAt: '2025-01-05T11:00:00Z', createdBy: 1 },
];

const MOCK_ZIYARETLER: YerindeZiyaret[] = [
  { id: 1, dosyaId: 1, tarafId: 2, ziyaretTarihi: '2024-12-15', ziyaretAdresi: 'Caferağa Mah. Moda Cad. No:15 D:8 Kadıköy/İstanbul', ziyaretEden: 'Talip Furkan Doğan', sonuc: 'gorusuldu', aciklama: 'Borçlu evde idi. Yüz yüze görüşme yapıldı. Ekonomik durumunu anlattı. İkinci bir ödeme planı değerlendirildi.', createdAt: '2024-12-15T10:00:00Z', createdBy: 1 },
];

// ─── HESAPLAMA FONKSİYONLARI ────────────────────────────────────────────────

function hesaplaGuncelFaiz(alacak: AlacakKalemi): number {
  if (!alacak.faizBaslangicTarihi || !alacak.faizOrani) return alacak.isleyecekFaiz;
  const baslangic = new Date(alacak.faizBaslangicTarihi);
  const bugun = new Date();
  const gunFarki = Math.floor((bugun.getTime() - baslangic.getTime()) / (1000 * 60 * 60 * 24));
  const gunlukOran = (alacak.faizOrani || 9) / 365 / 100;
  return Math.round(alacak.anaPara * gunlukOran * gunFarki * 100) / 100;
}

function hesaplaDegerler(alacak: AlacakKalemi, tahsilatlar: Tahsilat[]): HesaplananDegerler {
  const toplamHarclar = alacak.icraHarci + alacak.basvuruHarci + alacak.vekilHarci + alacak.pesinHarc + alacak.tahsilHarci + alacak.cezaeviHarci;
  const toplamMasraflar = alacak.tebligatMasrafi + alacak.postaMasrafi + alacak.hacizMasrafi + alacak.bilirkisiUcreti + alacak.diger_masraf;
  const guncelFaiz = hesaplaGuncelFaiz(alacak);
  const toplamAlacak = alacak.anaPara + alacak.islemiFaiz + guncelFaiz + alacak.vekaletUcreti + toplamHarclar + toplamMasraflar;
  const toplamTahsilat = tahsilatlar.reduce((sum, t) => sum + t.tahsilatTutari, 0);
  const kalanBorc = toplamAlacak - toplamTahsilat;
  const tahsilYuzdesi = toplamAlacak > 0 ? Math.round((toplamTahsilat / toplamAlacak) * 10000) / 100 : 0;

  return {
    toplamAnaPara: alacak.anaPara,
    toplamIslemiFaiz: alacak.islemiFaiz,
    toplamIsleyecekFaiz: guncelFaiz,
    toplamVekaletUcreti: alacak.vekaletUcreti,
    toplamHarclar,
    toplamMasraflar,
    toplamAlacak,
    toplamTahsilat,
    kalanBorc,
    tahsilYuzdesi,
    guncelFaiz,
  };
}

// ─── API ROUTES ─────────────────────────────────────────────────────────────

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dosyaId = parseInt(id);

    const foyu: IcraFoyu = {
      dosya: { ...MOCK_DOSYA, id: dosyaId },
      taraflar: MOCK_TARAFLAR,
      alacakKalemleri: MOCK_ALACAK,
      tahsilatlar: MOCK_TAHSILATLAR,
      islemGecmisi: MOCK_ISLEM_GECMISI,
      tebligatlar: MOCK_TEBLIGATLAR,
      hacizler: MOCK_HACIZLER,
      malvarligiArastirmalari: MOCK_MALVARLIGI,
      operasyonelTakip: MOCK_OPERASYONEL,
      gorusmeler: MOCK_GORUSMELER,
      ziyaretler: MOCK_ZIYARETLER,
    };

    const hesaplanan = hesaplaDegerler(MOCK_ALACAK, MOCK_TAHSILATLAR);

    return NextResponse.json({
      data: foyu,
      hesaplanan,
      success: true,
    });
  } catch (error) {
    console.error('Föy GET Error:', error);
    return NextResponse.json({ error: 'Föy verisi getirilemedi' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Simulate update
    const updated = { ...MOCK_DOSYA, id: parseInt(id), ...body, updatedAt: new Date().toISOString() };

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Föy başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Föy PUT Error:', error);
    return NextResponse.json({ error: 'Föy güncellenemedi' }, { status: 500 });
  }
}
