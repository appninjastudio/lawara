// ============================================================================
// İCRA FÖYÜ VERİ MODELİ - Türkiye Hukuk Büroları İcra Takip Sistemi
// ============================================================================
// Bu dosya, Türkiye'deki icra takip sürecine uygun eksiksiz bir
// "İcra Föyü" veri yapısı tanımlar. 10.000+ dosya yönetimi için optimize.
// ============================================================================

// ─── ENUM TİPLERİ ──────────────────────────────────────────────────────────

export type TakipTuru =
  | 'ilamsiz'           // İlamsız İcra (İİK m.42-72)
  | 'ilamli'            // İlamlı İcra (İİK m.24-41)
  | 'kambiyo'           // Kambiyo Senetlerine Özgü (İİK m.167-176)
  | 'kira'              // Kira Alacağı / Tahliye (İİK m.269-276)
  | 'rehin'             // Rehinin Paraya Çevrilmesi (İİK m.145-153)
  | 'ipotek'            // İpoteğin Paraya Çevrilmesi (İİK m.145-153)
  | 'iflas'             // İflas Yoluyla Takip (İİK m.154-166)
  | 'cocuk_teslimi'     // Çocuk Teslimi / İlam (İİK m.25)
  | 'tasinir_teslimi'   // Taşınır Teslimi (İİK m.24)
  | 'tasinmaz_tahliye'; // Taşınmaz Tahliyesi (İİK m.26)

export type DosyaStatusu =
  | 'acik'              // Açık / Aktif takip
  | 'derdest'           // Derdest (devam eden)
  | 'haciz_asamasinda'  // Haciz aşamasında
  | 'satis_asamasinda'  // Satış aşamasında
  | 'itirazli'          // Borçlu itiraz etmiş
  | 'tehirli'           // Tehir-i icra (durdurulmuş)
  | 'taahhutlu'         // Taahhüt alınmış
  | 'takipsiz'          // Takipsiz bırakılmış
  | 'tahsil_edildi'     // Tam tahsilat yapılmış
  | 'infaz_edildi'      // İnfaz edilmiş
  | 'kapatildi'         // Dosya kapatılmış
  | 'arsiv';            // Arşivlenmiş

export type FaizTuru =
  | 'yasal'             // Yasal faiz (%9 yıllık - 3095 s.K.)
  | 'ticari_temerrut'   // Ticari temerrüt faizi (TCMB reeskont)
  | 'avans'             // Avans faizi
  | 'kar_payi'          // Katılım bankası kar payı
  | 'sozlesmeli'        // Sözleşmesel faiz
  | 'diger';            // Diğer

export type TebligatTuru =
  | 'odeme_emri'        // Ödeme emri
  | 'icra_emri'         // İcra emri (ilamlı)
  | 'tahliye_emri'      // Tahliye emri
  | '103_davetiye'      // 103 davetiyesi
  | 'haciz_ihbarnamesi_1' // 89/1 haciz ihbarnamesi
  | 'haciz_ihbarnamesi_2' // 89/2 haciz ihbarnamesi
  | 'haciz_ihbarnamesi_3' // 89/3 haciz ihbarnamesi
  | 'maas_haczi'        // Maaş haczi müzekkeresi
  | 'satis_ilani'       // Satış ilanı
  | 'kiymet_takdiri'    // Kıymet takdiri
  | 'diger';            // Diğer

export type TebligatDurumu =
  | 'hazirlaniyor'      // Hazırlanıyor
  | 'gonderildi'        // Postaya verildi
  | 'teslim_edildi'     // Tebliğ edildi
  | 'iade'              // İade geldi
  | 'bila_teblig'       // Bila tebliğ (bulunamadı)
  | 'mernis'            // MERNİS adresine gönderildi
  | 'ilanen';           // İlanen tebliğ

export type HacizTuru =
  | 'banka'             // Banka hesabı haczi (İİK 89/1)
  | 'maas'              // Maaş haczi
  | 'arac'              // Araç haczi
  | 'tasinmaz'          // Taşınmaz haczi (tapu şerhi)
  | 'menkul'            // Menkul haczi (fiili)
  | 'alacak'            // Alacak haczi (3. kişilerdeki)
  | 'hisse'             // Şirket hissesi haczi
  | 'kira_geliri'       // Kira geliri haczi
  | 'sgk_iade'          // SGK iade alacağı haczi
  | 'vergi_iade'        // Vergi iade alacağı haczi
  | 'diger';            // Diğer

export type HacizDurumu =
  | 'talep_edildi'      // Talep verildi
  | 'muzakkere_gonderildi' // Müzekkere gönderildi
  | 'uygulanidi'        // Haciz uygulandı
  | 'olumlu_cevap'      // Olumlu cevap geldi
  | 'olumsuz_cevap'     // Olumsuz cevap (bakiye yok vb.)
  | 'kaldirdildi'       // Haciz kaldırıldı
  | 'satisa_cikti';     // Satışa çıkarıldı

export type IslemTipi =
  | 'takip_acildi'
  | 'odeme_emri_gonderildi'
  | 'tebligat_cikti'
  | 'tebligat_teslim_edildi'
  | 'tebligat_iade'
  | 'itiraz_edildi'
  | 'itiraz_kaldirildi'
  | 'haciz_talebi_verildi'
  | 'banka_haczi_gonderildi'
  | 'maas_haczi_gonderildi'
  | 'arac_haczi'
  | 'tapu_haczi'
  | 'menkul_haczi'
  | 'kiymet_takdiri'
  | 'satis_talebi'
  | 'satis_yapildi'
  | 'ihale_yapildi'
  | 'taahhut_alindi'
  | 'taahhut_ihlal'
  | 'tahsilat_yapildi'
  | 'masraf_yapildi'
  | 'harc_yatirildi'
  | 'dosya_kapandi'
  | 'tehir_icra'
  | 'tehir_kaldirildi'
  | 'borclu_gorusmesi'
  | 'yerinde_ziyaret'
  | 'uyap_sorgusu'
  | 'not_eklendi'
  | 'diger';

export type OdemeYontemi =
  | 'banka_havalesi'
  | 'elden_odeme'
  | 'icra_kasasi'
  | 'posta_havalesi'
  | 'kredi_karti'
  | 'haciz_tahsilati'
  | 'satis_geliri'
  | 'takas_mahsup'
  | 'diger';

export type MalvarligiSorguTuru =
  | 'sgk'              // SGK sorgusu (çalışma durumu)
  | 'banka'            // Banka sorgusu (hesap bilgisi)
  | 'arac'             // Araç sorgusu (EGM)
  | 'tapu'             // Tapu sorgusu (TKGM)
  | 'mernis'           // MERNİS adresi
  | 'gelir_vergisi'    // Gelir vergisi mükellefiyet
  | 'ticaret_sicil'    // Ticaret sicil sorgusu
  | 'diger';

export type RiskSkoru = 1 | 2 | 3 | 4 | 5; // 1=Düşük, 5=Çok Yüksek

export type TahsilOlasiligi =
  | 'cok_yuksek'       // %80+
  | 'yuksek'           // %60-80
  | 'orta'             // %40-60
  | 'dusuk'            // %20-40
  | 'cok_dusuk';       // %0-20

// ─── TABLE: cases (DOSYA BİLGİLERİ) ────────────────────────────────────────

export interface IcraDosyasi {
  id: number;
  // Dosya Bilgileri
  foyNo: string;                      // Büro iç föy numarası (auto-generated)
  icraDairesi: string;                // İcra dairesi adı
  icraDairesiKodu: string | null;     // UYAP icra dairesi kodu
  dosyaYili: number;                  // Dosya yılı (2024)
  dosyaNo: string;                    // Esas numarası (2024/1234)
  takipTuru: TakipTuru;               // Takip türü
  dosyaAcilisTarihi: string;          // ISO date
  dosyaKapanisTarihi: string | null;  // ISO date
  dosyaStatusu: DosyaStatusu;        // Dosya durumu
  dosyaSorumlusu: string;             // Sorumlu personel adı
  dosyaSorumlusuId: number;           // Sorumlu personel ID
  muvekkilId: number;                 // Müvekkil ID
  muvekkilAdi: string;                // Müvekkil adı
  muvekkilTuru: string;               // banka, finans, leasing, bireysel, sirket
  // Banka / Kurum bilgileri
  icraBankaAdi: string | null;        // İcra dairesi banka adı
  icraBankaIban: string | null;       // İcra dairesi IBAN
  icraBankaHesapNo: string | null;    // Hesap no
  // MTS
  mtsTakibi: boolean;                 // Menfi Tespit Davası takibi
  // Faiz
  faizTuru: FaizTuru;                 // Faiz türü
  faizOrani: number | null;           // Yıllık faiz oranı (%)
  faizBaslangicTarihi: string | null; // ISO date
  // İnfaz
  infazTarihi: string | null;         // ISO date
  // Dosya Meta
  aboneNo: string | null;             // Müşteri/abone numarası
  musteriKodu: string | null;         // Müşteri kodu
  klasorNo: string | null;            // Fiziksel klasör numarası
  sistemNo: string | null;            // İç sistem numarası
  // Timestamps
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

// ─── TABLE: parties (TARAFLAR) ──────────────────────────────────────────────

export type TarafRolu = 'alacakli' | 'borclu' | 'kefil' | 'ucuncu_kisi' | 'vekil';
export type KisiTuru = 'gercek' | 'tuzel';

export interface Taraf {
  id: number;
  dosyaId: number;
  tarafRolu: TarafRolu;
  kisiTuru: KisiTuru;
  // Gerçek kişi
  tckn: string | null;                // TC Kimlik No (11 hane)
  ad: string;
  soyad: string | null;
  // Tüzel kişi
  vkn: string | null;                 // Vergi Kimlik No (10 hane)
  unvan: string | null;               // Ticari unvan
  // İletişim
  telefon1: string | null;
  telefon2: string | null;
  eposta: string | null;
  adres: string | null;
  il: string | null;
  ilce: string | null;
  postaKodu: string | null;
  // MERNİS bilgileri
  mernisTarihi: string | null;        // Son MERNİS sorgu tarihi
  mernisAdresi: string | null;        // MERNİS kayıtlı adres
  // Ek bilgiler
  dogumTarihi: string | null;
  babaAdi: string | null;
  anaAdi: string | null;
  dogumYeri: string | null;
  // Notlar
  not: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── TABLE: claims (ALACAK KALEMLERİ) ──────────────────────────────────────

export interface AlacakKalemi {
  id: number;
  dosyaId: number;
  // Ana kalemler
  anaPara: number;                    // Ana para (₺)
  islemiFaiz: number;                 // İşlemiş faiz (₺) - takip tarihine kadar
  isleyecekFaiz: number;              // İşleyecek faiz (₺) - takip tarihinden sonra (auto-calc)
  faizTuru: FaizTuru;
  faizOrani: number | null;           // Yıllık %
  faizBaslangicTarihi: string;        // Faiz başlangıç tarihi
  // Yasal giderler
  vekaletUcreti: number;              // Vekalet ücreti (₺)
  icraHarci: number;                  // İcra harcı (%2, %4.55 vb.)
  basvuruHarci: number;               // Başvuru harcı
  vekilHarci: number;                 // Vekil harcı
  pesinHarc: number;                  // Peşin harç
  tahsilHarci: number;                // Tahsil harcı (auto-calc - tahsilat üzerinden)
  cezaeviHarci: number;               // Cezaevi harcı (auto-calc)
  // Masraflar
  tebligatMasrafi: number;            // Tebligat masrafı
  postaMasrafi: number;               // Posta giderleri
  hacizMasrafi: number;               // Haciz masrafları
  bilirkisiUcreti: number;            // Bilirkişi ücreti
  diger_masraf: number;               // Diğer masraflar
  masrafAciklamasi: string | null;    // Masraf açıklaması
  // Hesaplanan alanlar
  toplamAlacak: number;               // AUTO: anaPara + faizler + harçlar + masraflar
  toplamTahsilat: number;             // AUTO: tüm ödemeler toplamı
  kalanBorc: number;                  // AUTO: toplamAlacak - toplamTahsilat
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ─── TABLE: payments (TAHSİLAT TAKİBİ) ─────────────────────────────────────

export interface Tahsilat {
  id: number;
  dosyaId: number;
  tahsilatTarihi: string;             // ISO date
  tahsilatTutari: number;             // ₺
  odemeYontemi: OdemeYontemi;
  tahsilatiAlan: string;              // Tahsilatı alan kişi
  // Dağılım
  anaParaPayi: number;               // Ana paraya düşen kısım
  faizPayi: number;                   // Faize düşen kısım
  harcPayi: number;                   // Harca düşen kısım
  masrafPayi: number;                 // Masrafa düşen kısım
  // Müvekkil aktarımı
  muvekkilGonderilenTutar: number;    // Müvekkile gönderilen tutar
  muvekkilGonderimTarihi: string | null; // Müvekkile gönderim tarihi
  vekilUcretiKesintisi: number;       // Vekâlet ücreti kesintisi
  // Kalan
  guncelKalanBorc: number;            // AUTO: tahsilat sonrası kalan borç
  // Makbuz
  makbuzNo: string | null;            // Makbuz/dekont numarası
  aciklama: string | null;
  createdAt: string;
  createdBy: number;
}

// ─── TABLE: actions (İŞLEM GEÇMİŞİ / TIMELINE) ────────────────────────────

export interface IslemKaydi {
  id: number;
  dosyaId: number;
  islemTipi: IslemTipi;
  islemTarihi: string;                // ISO date
  aciklama: string;
  // İlişkili veri
  iliskiliTebligatId: number | null;
  iliskiliHacizId: number | null;
  iliskiliTahsilatId: number | null;
  // Meta
  sonuc: string | null;               // İşlem sonucu
  belgeNo: string | null;             // Belge/evrak numarası
  yapanKisi: string;                  // İşlemi yapan personel
  yapanKisiId: number;
  // Hatırlatma
  hatirlatmaTarihi: string | null;    // Sonraki hatırlatma tarihi
  hatirlatmaAciklamasi: string | null;
  // Timestamps
  createdAt: string;
}

// ─── TABLE: tebligats (TEBLİGATLAR) ────────────────────────────────────────

export interface Tebligat {
  id: number;
  dosyaId: number;
  tebligatTuru: TebligatTuru;
  tebligatDurumu: TebligatDurumu;
  // Alıcı
  alici: string;                      // Alıcı adı
  aliciAdres: string;                 // Gönderim adresi
  // Tarihler
  hazirlanisTarihi: string;           // Hazırlanış tarihi
  gonderimTarihi: string | null;      // Postaya verilme tarihi
  teslimTarihi: string | null;        // Tebliğ/teslim tarihi
  iadeTarihi: string | null;          // İade tarihi (varsa)
  // PTT
  pttBarkodu: string | null;          // PTT barkod numarası
  teslimSekli: string | null;         // Teslim şekli (elden, kapıya vb.)
  iadeNedeni: string | null;          // İade nedeni (varsa)
  // Meta
  aciklama: string | null;
  createdAt: string;
  createdBy: number;
}

// ─── TABLE: seizures (HACİZLER) ────────────────────────────────────────────

export interface Haciz {
  id: number;
  dosyaId: number;
  hacizTuru: HacizTuru;
  hacizDurumu: HacizDurumu;
  // Genel
  talepTarihi: string;                // Talep tarihi
  uygulamaTarihi: string | null;      // Uygulama tarihi
  kaldirmaTarihi: string | null;      // Kaldırma tarihi
  // Hedef bilgileri
  hedefKurum: string | null;          // Banka adı, işyeri adı vb.
  hedefAdres: string | null;          // Kurum adresi
  // Cevap
  cevapTarihi: string | null;
  cevapDurumu: string | null;         // Olumlu/Olumsuz
  cevapAciklamasi: string | null;
  // Tutar
  blokeEdilen: number;                // Bloke edilen tutar
  tahsilEdilen: number;               // Hacizden tahsil edilen
  // Detaylar (JSON - haciz türüne göre değişir)
  detaylar: HacizDetay;
  // Meta
  aciklama: string | null;
  muzakkereNo: string | null;         // Müzekkere numarası
  createdAt: string;
  createdBy: number;
}

// Haciz türüne göre detay
export interface HacizDetayBanka {
  bankaAdi: string;
  hesapTuru: string;
  iban: string | null;
  blokeEdilen: number;
}

export interface HacizDetayMaas {
  isveren: string;
  isverenVkn: string | null;
  sgkNo: string | null;
  aylikMaas: number | null;
  kesintOrani: number;                // % olarak
  kesintiTutari: number;
  baslangicTarihi: string | null;
  toplamTahsilat: number;
}

export interface HacizDetayArac {
  plaka: string;
  marka: string;
  model: string;
  modelYili: number | null;
  sasiNo: string | null;
  motorNo: string | null;
  tahminiDeger: number | null;
  yakalamaSerhi: boolean;
}

export interface HacizDetayTasinmaz {
  adres: string;
  il: string;
  ilce: string;
  ada: string | null;
  parsel: string | null;
  alan: string | null;
  tapuNo: string | null;
  mulkTuru: string | null;            // Mesken, arsa, tarla vb.
  tahminiDeger: number | null;
  ipotekBilgisi: string | null;
}

export interface HacizDetayMenkul {
  malCinsi: string;
  adet: number;
  tahminiDeger: number | null;
  yediemin: string | null;            // Yediemin adı
  yedieminAdres: string | null;
  bulunduguYer: string;
}

export type HacizDetay =
  | HacizDetayBanka
  | HacizDetayMaas
  | HacizDetayArac
  | HacizDetayTasinmaz
  | HacizDetayMenkul
  | Record<string, unknown>;

// ─── TABLE: asset_investigations (MALVARLIĞI ARAŞTIRMASI) ───────────────────

export interface MalvarligiArastirmasi {
  id: number;
  dosyaId: number;
  sorguTuru: MalvarligiSorguTuru;
  sorguTarihi: string;                // ISO date
  // Sonuç
  sonuc: 'olumlu' | 'olumsuz' | 'beklemede';
  sonucAciklamasi: string | null;
  sonucVerisi: string | null;         // JSON veri (sorgu sonucu ham veri)
  // SGK
  calistigiIsyeri: string | null;
  sgkTescilNo: string | null;
  isBaslangicTarihi: string | null;
  // Banka
  bankaBilgileri: string | null;      // JSON: [{banka, hesapTuru, bakiye}]
  // Araç
  aracBilgileri: string | null;       // JSON: [{plaka, marka, model, yil}]
  // Tapu
  tapuBilgileri: string | null;       // JSON: [{il, ilce, ada, parsel, alan}]
  // Notlar
  notlar: string | null;
  createdAt: string;
  createdBy: number;
}

// ─── OPERASYONEL TAKİP ─────────────────────────────────────────────────────

export interface OperasyonelTakip {
  id: number;
  dosyaId: number;
  // Sorumluluk
  sorumluPersonel: string;
  sorumluPersonelId: number;
  // Tarihler
  sonIslemTarihi: string | null;
  sonrakiIslemTarihi: string | null;
  hatirlatmaTarihi: string | null;
  // Risk değerlendirmesi
  riskSkoru: RiskSkoru;               // 1-5 (1=düşük, 5=çok yüksek)
  tahsilOlasiligi: TahsilOlasiligi;
  // İç notlar
  icNotlar: string | null;
  // Öncelik
  oncelik: 'acil' | 'yuksek' | 'normal' | 'dusuk';
  // Son durum özeti (oto-oluşturulan)
  sonDurumOzeti: string | null;
  // Timestamps
  updatedAt: string;
}

// ─── BORÇLU GÖRÜŞME / ZİYARET KAYITLARI ────────────────────────────────────

export interface BorcluGorusmesi {
  id: number;
  dosyaId: number;
  tarafId: number;                    // Hangi borçlu
  gorusmeTarihi: string;
  gorusmeTuru: 'telefon' | 'yuzeyuze' | 'online';
  gorusmeYapan: string;
  sonuc: 'olumlu' | 'olumsuz' | 'belirsiz';
  odemeVaadi: boolean;
  vaadEdilenTutar: number | null;
  vaadEdilenTarih: string | null;
  aciklama: string;
  createdAt: string;
  createdBy: number;
}

export interface YerindeZiyaret {
  id: number;
  dosyaId: number;
  tarafId: number;
  ziyaretTarihi: string;
  ziyaretAdresi: string;
  ziyaretEden: string;
  sonuc: 'gorusuldu' | 'gorusulemedi' | 'adres_yanlis';
  aciklama: string;
  createdAt: string;
  createdBy: number;
}

// ─── TABLE: documents (BELGELER - UYAP ÖNEMLİ BELGELER) ─────────────────────

export type BelgeKategorisi =
  | 'odeme_emri'          // Ödeme emri
  | 'icra_emri'           // İcra emri
  | 'takip_talebi'        // Takip talebi
  | 'ilamlar'             // Mahkeme ilamları / kararları
  | 'vekaletname'         // Vekaletname
  | 'tebligat'            // Tebligat evrakları
  | 'haciz_tutanagi'      // Haciz tutanakları
  | 'haciz_ihbarnamesi'   // 89/1, 89/2, 89/3 ihbarnameleri
  | 'kiymet_takdiri'      // Kıymet takdir raporu
  | 'satis_ilani'         // Satış ilanı
  | 'bilirkisi_raporu'    // Bilirkişi raporu
  | 'itiraz_dilekce'      // İtiraz dilekçesi
  | 'itiraz_kaldirma'     // İtirazın kaldırılması
  | 'taahhut'             // Taahhüt belgesi
  | 'banka_cevabi'        // Banka cevap yazısı
  | 'sgk_cevabi'          // SGK cevap yazısı
  | 'tapu_cevabi'         // Tapu cevap yazısı
  | 'maaş_haczi_muzakkere' // Maaş haczi müzekkeresi
  | 'dekont'              // Ödeme dekontları
  | 'sozlesme'            // Sözleşme/kredi sözleşmesi
  | 'senet'               // Senet, bono, çek
  | 'diger';              // Diğer belgeler

export type BelgeKaynagi =
  | 'uyap'                // UYAP'tan indirilen
  | 'manuel'              // Manuel yüklenen
  | 'tarama'              // Taranmış belge
  | 'email'               // E-posta eki
  | 'diger';              // Diğer

export interface Belge {
  id: number;
  dosyaId: number;
  // Belge bilgileri
  belgeAdi: string;                   // Belge başlığı (görünen ad)
  dosyaAdi: string;                   // Orijinal dosya adı (filename.pdf)
  belgeKategorisi: BelgeKategorisi;   // Belge kategorisi
  belgeKaynagi: BelgeKaynagi;         // Nereden geldi
  // Dosya bilgileri
  dosyaBoyutu: number;                // Byte cinsinden
  dosyaTipi: string;                  // MIME type (application/pdf, image/jpeg vb.)
  dosyaUzantisi: string;              // .pdf, .docx, .jpg vb.
  // UYAP bilgileri
  uyapEvrakId: string | null;         // UYAP evrak ID
  uyapEvrakTuru: string | null;       // UYAP evrak türü
  uyapIndirmeTarihi: string | null;   // UYAP'tan indirilme tarihi
  // İçerik
  aciklama: string | null;            // Belge açıklaması
  onemliMi: boolean;                  // Önemli/yıldızlı belge
  etiketler: string[];                // Etiketler (arama için)
  // Depolama
  depolamaYolu: string | null;        // Dosya yolu veya URL
  onizlemeUrl: string | null;         // Küçük resim / önizleme URL
  // Meta
  yukleyenKisi: string;               // Yükleyen kişi adı
  yukleyenKisiId: number;
  createdAt: string;
  updatedAt: string;
}

// ─── BÜTÜN FOY BİRLEŞİK YAPISI (İcra Föyü Tam Görünüm) ───────────────────

export interface IcraFoyu {
  dosya: IcraDosyasi;
  taraflar: Taraf[];
  alacakKalemleri: AlacakKalemi;
  tahsilatlar: Tahsilat[];
  islemGecmisi: IslemKaydi[];
  tebligatlar: Tebligat[];
  hacizler: Haciz[];
  malvarligiArastirmalari: MalvarligiArastirmasi[];
  operasyonelTakip: OperasyonelTakip;
  gorusmeler: BorcluGorusmesi[];
  ziyaretler: YerindeZiyaret[];
  belgeler: Belge[];
}

// ─── HESAPLANAN (COMPUTED) ALANLAR ─────────────────────────────────────────

export interface HesaplananDegerler {
  toplamAnaPara: number;
  toplamIslemiFaiz: number;
  toplamIsleyecekFaiz: number;
  toplamVekaletUcreti: number;
  toplamHarclar: number;              // icra + başvuru + vekil + peşin
  toplamMasraflar: number;            // tebligat + posta + haciz + bilirkişi + diğer
  toplamAlacak: number;               // Herşeyin toplamı
  toplamTahsilat: number;
  kalanBorc: number;                  // toplamAlacak - toplamTahsilat
  tahsilYuzdesi: number;              // (toplamTahsilat / toplamAlacak) * 100
  guncelFaiz: number;                 // Bugüne kadar işleyen faiz (live calc)
}

// ─── DROPDOWN SEÇENEKLERİ ──────────────────────────────────────────────────

export const TAKIP_TURU_OPTIONS: { value: TakipTuru; label: string }[] = [
  { value: 'ilamsiz', label: 'İlamsız İcra' },
  { value: 'ilamli', label: 'İlamlı İcra' },
  { value: 'kambiyo', label: 'Kambiyo Senetlerine Özgü' },
  { value: 'kira', label: 'Kira Alacağı / Tahliye' },
  { value: 'rehin', label: 'Rehinin Paraya Çevrilmesi' },
  { value: 'ipotek', label: 'İpoteğin Paraya Çevrilmesi' },
  { value: 'iflas', label: 'İflas Yoluyla Takip' },
  { value: 'cocuk_teslimi', label: 'Çocuk Teslimi' },
  { value: 'tasinir_teslimi', label: 'Taşınır Teslimi' },
  { value: 'tasinmaz_tahliye', label: 'Taşınmaz Tahliyesi' },
];

export const DOSYA_STATUSU_OPTIONS: { value: DosyaStatusu; label: string; color: string }[] = [
  { value: 'acik', label: 'Açık', color: 'blue' },
  { value: 'derdest', label: 'Derdest', color: 'blue' },
  { value: 'haciz_asamasinda', label: 'Haciz Aşamasında', color: 'orange' },
  { value: 'satis_asamasinda', label: 'Satış Aşamasında', color: 'purple' },
  { value: 'itirazli', label: 'İtirazlı', color: 'red' },
  { value: 'tehirli', label: 'Tehir-i İcra', color: 'yellow' },
  { value: 'taahhutlu', label: 'Taahhütlü', color: 'cyan' },
  { value: 'takipsiz', label: 'Takipsiz', color: 'gray' },
  { value: 'tahsil_edildi', label: 'Tahsil Edildi', color: 'green' },
  { value: 'infaz_edildi', label: 'İnfaz Edildi', color: 'green' },
  { value: 'kapatildi', label: 'Kapatıldı', color: 'slate' },
  { value: 'arsiv', label: 'Arşiv', color: 'slate' },
];

export const FAIZ_TURU_OPTIONS: { value: FaizTuru; label: string }[] = [
  { value: 'yasal', label: 'Yasal Faiz (%9)' },
  { value: 'ticari_temerrut', label: 'Ticari Temerrüt Faizi' },
  { value: 'avans', label: 'Avans Faizi' },
  { value: 'kar_payi', label: 'Kar Payı' },
  { value: 'sozlesmeli', label: 'Sözleşmesel Faiz' },
  { value: 'diger', label: 'Diğer' },
];

export const ODEME_YONTEMI_OPTIONS: { value: OdemeYontemi; label: string }[] = [
  { value: 'banka_havalesi', label: 'Banka Havalesi' },
  { value: 'elden_odeme', label: 'Elden Ödeme' },
  { value: 'icra_kasasi', label: 'İcra Kasası' },
  { value: 'posta_havalesi', label: 'Posta Havalesi' },
  { value: 'kredi_karti', label: 'Kredi Kartı' },
  { value: 'haciz_tahsilati', label: 'Haciz Tahsilatı' },
  { value: 'satis_geliri', label: 'Satış Geliri' },
  { value: 'takas_mahsup', label: 'Takas/Mahsup' },
  { value: 'diger', label: 'Diğer' },
];

export const RISK_SKORU_OPTIONS: { value: RiskSkoru; label: string; color: string }[] = [
  { value: 1, label: 'Düşük Risk', color: 'green' },
  { value: 2, label: 'Orta-Düşük Risk', color: 'lime' },
  { value: 3, label: 'Orta Risk', color: 'yellow' },
  { value: 4, label: 'Yüksek Risk', color: 'orange' },
  { value: 5, label: 'Çok Yüksek Risk', color: 'red' },
];

export const TAHSIL_OLASILIGI_OPTIONS: { value: TahsilOlasiligi; label: string; color: string }[] = [
  { value: 'cok_yuksek', label: 'Çok Yüksek (%80+)', color: 'green' },
  { value: 'yuksek', label: 'Yüksek (%60-80)', color: 'lime' },
  { value: 'orta', label: 'Orta (%40-60)', color: 'yellow' },
  { value: 'dusuk', label: 'Düşük (%20-40)', color: 'orange' },
  { value: 'cok_dusuk', label: 'Çok Düşük (%0-20)', color: 'red' },
];

export const HACIZ_TURU_OPTIONS: { value: HacizTuru; label: string }[] = [
  { value: 'banka', label: 'Banka Haczi' },
  { value: 'maas', label: 'Maaş Haczi' },
  { value: 'arac', label: 'Araç Haczi' },
  { value: 'tasinmaz', label: 'Taşınmaz Haczi' },
  { value: 'menkul', label: 'Menkul Haczi' },
  { value: 'alacak', label: 'Alacak Haczi' },
  { value: 'hisse', label: 'Şirket Hissesi Haczi' },
  { value: 'kira_geliri', label: 'Kira Geliri Haczi' },
  { value: 'sgk_iade', label: 'SGK İade Haczi' },
  { value: 'vergi_iade', label: 'Vergi İade Haczi' },
  { value: 'diger', label: 'Diğer' },
];

export const TEBLIGAT_TURU_OPTIONS: { value: TebligatTuru; label: string }[] = [
  { value: 'odeme_emri', label: 'Ödeme Emri' },
  { value: 'icra_emri', label: 'İcra Emri' },
  { value: 'tahliye_emri', label: 'Tahliye Emri' },
  { value: '103_davetiye', label: '103 Davetiyesi' },
  { value: 'haciz_ihbarnamesi_1', label: '89/1 Haciz İhbarnamesi' },
  { value: 'haciz_ihbarnamesi_2', label: '89/2 Haciz İhbarnamesi' },
  { value: 'haciz_ihbarnamesi_3', label: '89/3 Haciz İhbarnamesi' },
  { value: 'maas_haczi', label: 'Maaş Haczi Müzekkeresi' },
  { value: 'satis_ilani', label: 'Satış İlanı' },
  { value: 'kiymet_takdiri', label: 'Kıymet Takdiri' },
  { value: 'diger', label: 'Diğer' },
];

export const ISLEM_TIPI_OPTIONS: { value: IslemTipi; label: string; icon: string }[] = [
  { value: 'takip_acildi', label: 'Takip Açıldı', icon: 'FolderOpen' },
  { value: 'odeme_emri_gonderildi', label: 'Ödeme Emri Gönderildi', icon: 'Send' },
  { value: 'tebligat_cikti', label: 'Tebligat Çıktı', icon: 'Mail' },
  { value: 'tebligat_teslim_edildi', label: 'Tebligat Teslim Edildi', icon: 'MailCheck' },
  { value: 'tebligat_iade', label: 'Tebligat İade', icon: 'MailX' },
  { value: 'itiraz_edildi', label: 'İtiraz Edildi', icon: 'ShieldAlert' },
  { value: 'itiraz_kaldirildi', label: 'İtiraz Kaldırıldı', icon: 'ShieldCheck' },
  { value: 'haciz_talebi_verildi', label: 'Haciz Talebi Verildi', icon: 'Gavel' },
  { value: 'banka_haczi_gonderildi', label: 'Banka Haczi Gönderildi', icon: 'Building2' },
  { value: 'maas_haczi_gonderildi', label: 'Maaş Haczi Gönderildi', icon: 'Banknote' },
  { value: 'arac_haczi', label: 'Araç Haczi', icon: 'Car' },
  { value: 'tapu_haczi', label: 'Tapu Haczi', icon: 'Landmark' },
  { value: 'menkul_haczi', label: 'Menkul Haczi', icon: 'Package' },
  { value: 'kiymet_takdiri', label: 'Kıymet Takdiri', icon: 'Calculator' },
  { value: 'satis_talebi', label: 'Satış Talebi', icon: 'ShoppingCart' },
  { value: 'satis_yapildi', label: 'Satış Yapıldı', icon: 'CheckCircle2' },
  { value: 'ihale_yapildi', label: 'İhale Yapıldı', icon: 'Hammer' },
  { value: 'taahhut_alindi', label: 'Taahhüt Alındı', icon: 'FileSignature' },
  { value: 'taahhut_ihlal', label: 'Taahhüt İhlal', icon: 'AlertTriangle' },
  { value: 'tahsilat_yapildi', label: 'Tahsilat Yapıldı', icon: 'CircleDollarSign' },
  { value: 'masraf_yapildi', label: 'Masraf Yapıldı', icon: 'Receipt' },
  { value: 'harc_yatirildi', label: 'Harç Yatırıldı', icon: 'CreditCard' },
  { value: 'dosya_kapandi', label: 'Dosya Kapandı', icon: 'FolderClosed' },
  { value: 'tehir_icra', label: 'Tehir-i İcra', icon: 'Pause' },
  { value: 'tehir_kaldirildi', label: 'Tehir Kaldırıldı', icon: 'Play' },
  { value: 'borclu_gorusmesi', label: 'Borçlu Görüşmesi', icon: 'MessageSquare' },
  { value: 'yerinde_ziyaret', label: 'Yerinde Ziyaret', icon: 'Navigation' },
  { value: 'uyap_sorgusu', label: 'UYAP Sorgusu', icon: 'Search' },
  { value: 'not_eklendi', label: 'Not Eklendi', icon: 'StickyNote' },
  { value: 'diger', label: 'Diğer', icon: 'MoreHorizontal' },
];

export const BELGE_KATEGORISI_OPTIONS: { value: BelgeKategorisi; label: string; icon: string }[] = [
  { value: 'odeme_emri', label: 'Ödeme Emri', icon: 'FileText' },
  { value: 'icra_emri', label: 'İcra Emri', icon: 'FileText' },
  { value: 'takip_talebi', label: 'Takip Talebi', icon: 'FilePlus' },
  { value: 'ilamlar', label: 'Mahkeme İlamı / Kararı', icon: 'Gavel' },
  { value: 'vekaletname', label: 'Vekaletname', icon: 'FileSignature' },
  { value: 'tebligat', label: 'Tebligat Evrakı', icon: 'Mail' },
  { value: 'haciz_tutanagi', label: 'Haciz Tutanağı', icon: 'Shield' },
  { value: 'haciz_ihbarnamesi', label: 'Haciz İhbarnamesi (89/1-2-3)', icon: 'ShieldAlert' },
  { value: 'kiymet_takdiri', label: 'Kıymet Takdir Raporu', icon: 'Calculator' },
  { value: 'satis_ilani', label: 'Satış İlanı', icon: 'ShoppingCart' },
  { value: 'bilirkisi_raporu', label: 'Bilirkişi Raporu', icon: 'ClipboardCheck' },
  { value: 'itiraz_dilekce', label: 'İtiraz Dilekçesi', icon: 'ShieldAlert' },
  { value: 'itiraz_kaldirma', label: 'İtirazın Kaldırılması', icon: 'ShieldCheck' },
  { value: 'taahhut', label: 'Taahhüt Belgesi', icon: 'FileSignature' },
  { value: 'banka_cevabi', label: 'Banka Cevap Yazısı', icon: 'Building2' },
  { value: 'sgk_cevabi', label: 'SGK Cevap Yazısı', icon: 'Building2' },
  { value: 'tapu_cevabi', label: 'Tapu Cevap Yazısı', icon: 'Landmark' },
  { value: 'maaş_haczi_muzakkere', label: 'Maaş Haczi Müzekkeresi', icon: 'Banknote' },
  { value: 'dekont', label: 'Ödeme Dekontu', icon: 'Receipt' },
  { value: 'sozlesme', label: 'Sözleşme / Kredi Sözleşmesi', icon: 'FileText' },
  { value: 'senet', label: 'Senet / Bono / Çek', icon: 'CreditCard' },
  { value: 'diger', label: 'Diğer', icon: 'File' },
];

export const BELGE_KAYNAGI_OPTIONS: { value: BelgeKaynagi; label: string }[] = [
  { value: 'uyap', label: 'UYAP\'tan İndirildi' },
  { value: 'manuel', label: 'Manuel Yüklendi' },
  { value: 'tarama', label: 'Taranmış Belge' },
  { value: 'email', label: 'E-posta Eki' },
  { value: 'diger', label: 'Diğer' },
];
