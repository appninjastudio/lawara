'use client';

import Header from '@/components/Header';
import {
  ArrowLeft, Edit2, User, Building2, Landmark,
  FileText, Loader2, Search,
  Banknote, MessageSquare, Navigation,
  Shield, BarChart3,
  Car, Package, CircleDollarSign, Activity, ChevronDown,
  Star, Download, FolderOpen, Paperclip, ExternalLink,
} from 'lucide-react';
import { useState, useEffect, use } from 'react';
import clsx from 'clsx';
import type { IcraFoyu, HesaplananDegerler } from '@/types/icra-foyu';
import { DOSYA_STATUSU_OPTIONS, FAIZ_TURU_OPTIONS, ODEME_YONTEMI_OPTIONS, TAHSIL_OLASILIGI_OPTIONS, HACIZ_TURU_OPTIONS, TEBLIGAT_TURU_OPTIONS, BELGE_KATEGORISI_OPTIONS, BELGE_KAYNAGI_OPTIONS, TAKIP_TURU_OPTIONS } from '@/types/icra-foyu';

type TabKey = 'dosya' | 'taraflar' | 'alacak' | 'tahsilat' | 'islemler' | 'hacizler' | 'malvarligi' | 'belgeler' | 'operasyonel';
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'dosya', label: 'Dosya Bilgileri', icon: <FileText className="w-4 h-4" /> },
  { key: 'taraflar', label: 'Taraflar', icon: <User className="w-4 h-4" /> },
  { key: 'alacak', label: 'Alacak Kalemleri', icon: <Banknote className="w-4 h-4" /> },
  { key: 'tahsilat', label: 'Tahsilat', icon: <CircleDollarSign className="w-4 h-4" /> },
  { key: 'islemler', label: 'İşlem Geçmişi', icon: <Activity className="w-4 h-4" /> },
  { key: 'hacizler', label: 'Haciz & Tebligat', icon: <Shield className="w-4 h-4" /> },
  { key: 'malvarligi', label: 'Malvarlığı', icon: <Search className="w-4 h-4" /> },
  { key: 'belgeler', label: 'Belgeler', icon: <FolderOpen className="w-4 h-4" /> },
  { key: 'operasyonel', label: 'Operasyonel', icon: <BarChart3 className="w-4 h-4" /> },
];

function fc(n: number) { return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(n); }
function fd(d: string | null) { if (!d) return '-'; return new Date(d).toLocaleDateString('tr-TR'); }
function fsize(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / 1048576).toFixed(1)} MB`; }
function getFileIcon(ext: string) {
  if (['.pdf'].includes(ext)) return 'text-red-600 bg-red-50';
  if (['.doc', '.docx'].includes(ext)) return 'text-blue-600 bg-blue-50';
  if (['.xls', '.xlsx'].includes(ext)) return 'text-emerald-600 bg-emerald-50';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'text-purple-600 bg-purple-50';
  return 'text-slate-600 bg-slate-50';
}

function InfoBox({ label, value }: { label: string; value: string | number | null | undefined }) {
  return <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p><p className="text-sm font-semibold text-slate-900">{value || '-'}</p></div>;
}

export default function FoyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('dosya');
  const [foyu, setFoyu] = useState<IcraFoyu | null>(null);
  const [hesaplanan, setHesaplanan] = useState<HesaplananDegerler | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedHaciz, setExpandedHaciz] = useState<number | null>(null);
  const [belgeArama, setBelgeArama] = useState('');
  const [belgeKategoriFiltre, setBelgeKategoriFiltre] = useState<string>('all');
  const [belgeKaynakFiltre, setBelgeKaynakFiltre] = useState<string>('all');
  const [belgeSadecaOnemli, setBelgeSadecaOnemli] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/foy/${id}`);
        const json = await res.json();
        if (json.success) { setFoyu(json.data); setHesaplanan(json.hesaplanan); }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="flex flex-col h-full"><Header title="İcra Föyü" subtitle="Yükleniyor..." /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-icra-mid animate-spin" /></div></div>;
  if (!foyu) return <div className="flex flex-col h-full"><Header title="İcra Föyü" subtitle="Bulunamadı" /><div className="flex-1 flex flex-col items-center justify-center text-slate-400"><FileText className="w-16 h-16 mb-4" /><p>Föy bulunamadı</p><a href="/cases" className="mt-4 text-icra-mid hover:underline">Dosya listesine dön</a></div></div>;

  const { dosya, taraflar, alacakKalemleri, tahsilatlar, islemGecmisi, tebligatlar, hacizler, malvarligiArastirmalari, operasyonelTakip, gorusmeler, ziyaretler, belgeler } = foyu;
  const borclu = taraflar.find(t => t.tarafRolu === 'borclu');
  const statusOpt = DOSYA_STATUSU_OPTIONS.find(o => o.value === dosya.dosyaStatusu);

  return (
    <div className="flex flex-col h-full">
      <Header title={`İcra Föyü — ${dosya.foyNo}`} subtitle={`${dosya.dosyaNo} | ${borclu ? `${borclu.ad} ${borclu.soyad}` : ''} | ${dosya.muvekkilAdi}`} />
      <div className="flex-1 overflow-auto">

        {/* KPI Bar */}
        <div className="bg-gradient-to-r from-icra-darkest to-icra-dark text-white px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <a href={`/cases/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft className="w-4 h-4" /> Dosya Detayına Dön</a>
            <a href={`/cases/${id}/foy/edit`} className="px-4 py-1.5 bg-icra-mid hover:bg-icra-light text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
              <Edit2 className="w-3.5 h-3.5" /> Föyü Düzenle
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { l: 'Toplam Alacak', v: fc(hesaplanan?.toplamAlacak || 0), c: 'text-white' },
              { l: 'Tahsilat', v: fc(hesaplanan?.toplamTahsilat || 0), c: 'text-emerald-400' },
              { l: 'Kalan Borç', v: fc(hesaplanan?.kalanBorc || 0), c: 'text-orange-400' },
              { l: 'Tahsil %', v: `%${hesaplanan?.tahsilYuzdesi?.toFixed(1) || '0'}`, c: 'text-icra-light' },
              { l: 'Durum', v: statusOpt?.label || dosya.dosyaStatusu, c: 'text-icra-light' },
              { l: 'Risk', v: `${operasyonelTakip.riskSkoru}/5`, c: 'text-yellow-400' },
            ].map((k, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3"><p className="text-[10px] uppercase tracking-wider text-slate-400">{k.l}</p><p className={clsx('text-lg font-bold', k.c)}>{k.v}</p></div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex overflow-x-auto px-4">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={clsx('flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer', activeTab === tab.key ? 'border-icra-mid text-icra-dark bg-icra-light/10' : 'border-transparent text-slate-500 hover:text-slate-700')}>{tab.icon} {tab.label}</button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* DOSYA BİLGİLERİ */}
          {activeTab === 'dosya' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-icra-mid" /> Dosya Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoBox label="Föy No" value={dosya.foyNo} />
                <InfoBox label="İcra Dairesi" value={dosya.icraDairesi} />
                <InfoBox label="Dosya/Esas No" value={dosya.dosyaNo} />
                <InfoBox label="Takip Türü" value={TAKIP_TURU_OPTIONS.find(o => o.value === dosya.takipTuru)?.label} />
                <InfoBox label="Dosya Durumu" value={statusOpt?.label} />
                <InfoBox label="Dosya Sorumlusu" value={dosya.dosyaSorumlusu} />
                <InfoBox label="Takip Açılış Tarihi" value={fd(dosya.dosyaAcilisTarihi)} />
                <InfoBox label="İnfaz Tarihi" value={fd(dosya.infazTarihi)} />
                <InfoBox label="Müvekkil" value={dosya.muvekkilAdi} />
              </div>
              <h4 className="text-sm font-semibold text-slate-700 pt-2">Banka & Faiz</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoBox label="İcra Banka Adı" value={dosya.icraBankaAdi} />
                <InfoBox label="İcra IBAN" value={dosya.icraBankaIban} />
                <InfoBox label="Faiz Türü" value={FAIZ_TURU_OPTIONS.find(o => o.value === dosya.faizTuru)?.label} />
                <InfoBox label="Faiz Oranı" value={dosya.faizOrani ? `%${dosya.faizOrani}` : '-'} />
                <InfoBox label="MTS Takibi" value={dosya.mtsTakibi ? 'Evet' : 'Hayır'} />
              </div>
              <h4 className="text-sm font-semibold text-slate-700 pt-2">Ek Bilgiler</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoBox label="Abone No" value={dosya.aboneNo} />
                <InfoBox label="Müşteri Kodu" value={dosya.musteriKodu} />
                <InfoBox label="Klasör No" value={dosya.klasorNo} />
              </div>
            </div>
          )}

          {/* TARAFLAR */}
          {activeTab === 'taraflar' && taraflar.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', t.tarafRolu === 'alacakli' ? 'bg-emerald-100' : t.tarafRolu === 'borclu' ? 'bg-red-100' : 'bg-amber-100')}>
                  {t.kisiTuru === 'tuzel' ? <Building2 className="w-5 h-5 text-blue-600" /> : <User className={clsx('w-5 h-5', t.tarafRolu === 'borclu' ? 'text-red-600' : 'text-emerald-600')} />}
                </div>
                <div><h4 className="font-semibold text-slate-900">{t.ad} {t.soyad}</h4><p className="text-xs text-slate-500">{t.tarafRolu === 'alacakli' ? 'Alacaklı' : t.tarafRolu === 'borclu' ? 'Borçlu' : 'Kefil'} {t.kisiTuru === 'tuzel' ? '(Tüzel)' : '(Gerçek)'}</p></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {t.tckn && <InfoBox label="TCKN" value={t.tckn} />}
                {t.vkn && <InfoBox label="VKN" value={t.vkn} />}
                {t.telefon1 && <InfoBox label="Telefon" value={t.telefon1} />}
                {t.eposta && <InfoBox label="E-posta" value={t.eposta} />}
                {t.il && <InfoBox label="İl/İlçe" value={`${t.il}/${t.ilce}`} />}
                {t.dogumTarihi && <InfoBox label="Doğum" value={fd(t.dogumTarihi)} />}
                {t.babaAdi && <InfoBox label="Baba/Ana" value={`${t.babaAdi}/${t.anaAdi}`} />}
              </div>
              {t.adres && <div className="mt-3 p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Adres</p><p className="text-sm">{t.adres}</p></div>}
              {t.mernisAdresi && <div className="mt-2 p-3 bg-blue-50 rounded-xl"><p className="text-[10px] text-blue-600 uppercase">MERNİS ({fd(t.mernisTarihi)})</p><p className="text-sm">{t.mernisAdresi}</p></div>}
              {t.not && <div className="mt-2 p-3 bg-yellow-50 rounded-xl"><p className="text-xs text-yellow-800"><strong>Not:</strong> {t.not}</p></div>}
            </div>
          ))}

          {/* ALACAK KALEMLERİ */}
          {activeTab === 'alacak' && hesaplanan && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2"><Banknote className="w-5 h-5 text-icra-mid" /> Alacak Kalemleri</h3>
              <div className="space-y-2">
                {[
                  ['Ana Para', alacakKalemleri.anaPara], ['İşlemiş Faiz', alacakKalemleri.islemiFaiz],
                  ['İşleyecek Faiz (Güncel)', hesaplanan.guncelFaiz], ['Vekalet Ücreti', alacakKalemleri.vekaletUcreti],
                  ['İcra Harcı', alacakKalemleri.icraHarci], ['Başvuru Harcı', alacakKalemleri.basvuruHarci],
                  ['Peşin Harç', alacakKalemleri.pesinHarc], ['Tebligat Masrafı', alacakKalemleri.tebligatMasrafi],
                  ['Posta Masrafı', alacakKalemleri.postaMasrafi], ['Haciz Masrafı', alacakKalemleri.hacizMasrafi],
                  ['Diğer Masraflar', alacakKalemleri.diger_masraf],
                ].map(([l, v], i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-slate-100"><span className="text-sm text-slate-600">{l as string}</span><span className="text-sm font-semibold">{fc(v as number)}</span></div>
                ))}
                <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-3 mt-3"><span className="font-bold text-blue-800">TOPLAM ALACAK</span><span className="text-lg font-bold text-blue-800">{fc(hesaplanan.toplamAlacak)}</span></div>
                <div className="flex justify-between py-2 bg-emerald-50 rounded-lg px-3"><span className="font-bold text-emerald-800">TAHSİLAT (-)</span><span className="text-lg font-bold text-emerald-800">{fc(hesaplanan.toplamTahsilat)}</span></div>
                <div className="flex justify-between py-3 bg-red-50 rounded-lg px-3"><span className="font-bold text-red-800">KALAN BORÇ</span><span className="text-xl font-bold text-red-800">{fc(hesaplanan.kalanBorc)}</span></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                <InfoBox label="Faiz Türü" value={FAIZ_TURU_OPTIONS.find(o => o.value === alacakKalemleri.faizTuru)?.label} />
                <InfoBox label="Oran" value={`%${alacakKalemleri.faizOrani}`} />
                <InfoBox label="Başlangıç" value={fd(alacakKalemleri.faizBaslangicTarihi)} />
                <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Tahsil %</p><p className="text-sm font-semibold text-emerald-600">%{hesaplanan.tahsilYuzdesi.toFixed(1)}</p></div>
              </div>
            </div>
          )}

          {/* TAHSİLAT */}
          {activeTab === 'tahsilat' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Tahsilat Kayıtları ({tahsilatlar.length})</h3>
              {tahsilatlar.sort((a, b) => b.tahsilatTarihi.localeCompare(a.tahsilatTarihi)).map(t => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CircleDollarSign className="w-5 h-5 text-emerald-600" /></div>
                      <div><p className="text-sm font-semibold">{fc(t.tahsilatTutari)}</p><p className="text-xs text-slate-500">{fd(t.tahsilatTarihi)} — {ODEME_YONTEMI_OPTIONS.find(o => o.value === t.odemeYontemi)?.label}</p></div>
                    </div>
                    {t.makbuzNo && <span className="text-xs text-slate-400 font-mono">{t.makbuzNo}</span>}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-slate-50 rounded"><span className="text-slate-500">Ana Para:</span> <span className="font-semibold">{fc(t.anaParaPayi)}</span></div>
                    <div className="p-2 bg-slate-50 rounded"><span className="text-slate-500">Faiz:</span> <span className="font-semibold">{fc(t.faizPayi)}</span></div>
                    <div className="p-2 bg-slate-50 rounded"><span className="text-slate-500">Müvekkile:</span> <span className="font-semibold">{fc(t.muvekkilGonderilenTutar)}</span></div>
                    <div className="p-2 bg-slate-50 rounded"><span className="text-slate-500">Kalan:</span> <span className="font-semibold text-red-600">{fc(t.guncelKalanBorc)}</span></div>
                  </div>
                  {t.aciklama && <p className="text-xs text-slate-500 mt-2">{t.aciklama}</p>}
                </div>
              ))}
              {tahsilatlar.length === 0 && <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center"><CircleDollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-sm text-slate-500">Henüz tahsilat kaydı yok</p></div>}
            </div>
          )}

          {/* İŞLEM GEÇMİŞİ */}
          {activeTab === 'islemler' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">İşlem Geçmişi ({islemGecmisi.length})</h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
                {islemGecmisi.sort((a, b) => b.islemTarihi.localeCompare(a.islemTarihi)).map(is => (
                  <div key={is.id} className="relative pl-12 pb-4">
                    <div className={clsx('absolute left-3 w-5 h-5 rounded-full border-2 border-white shadow-sm', is.islemTipi.includes('tahsilat') ? 'bg-emerald-500' : is.islemTipi.includes('haciz') || is.islemTipi.includes('tapu') || is.islemTipi.includes('arac') ? 'bg-orange-500' : is.islemTipi.includes('tebligat') ? 'bg-blue-500' : 'bg-slate-400')}><div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div></div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 cursor-pointer hover:shadow-md" onClick={() => setExpandedId(expandedId === is.id ? null : is.id)}>
                      <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{is.aciklama}</p><p className="text-xs text-slate-500 mt-0.5">{fd(is.islemTarihi)} — {is.yapanKisi}</p></div><ChevronDown className={clsx('w-4 h-4 text-slate-400 transition-transform', expandedId === is.id && 'rotate-180')} /></div>
                      {expandedId === is.id && <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        {is.sonuc && <div className="p-2 bg-slate-50 rounded">Sonuç: {is.sonuc}</div>}
                        {is.belgeNo && <div className="p-2 bg-slate-50 rounded">Belge: {is.belgeNo}</div>}
                        {is.hatirlatmaTarihi && <div className="p-2 bg-amber-50 rounded col-span-2 text-amber-700">Hatırlatma: {fd(is.hatirlatmaTarihi)} {is.hatirlatmaAciklamasi && `— ${is.hatirlatmaAciklamasi}`}</div>}
                      </div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HACİZLER & TEBLİGATLAR */}
          {activeTab === 'hacizler' && (
            <div className="space-y-6">
              <h3 className="text-base font-semibold">Hacizler ({hacizler.length})</h3>
              {hacizler.map(h => (
                <div key={h.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedHaciz(expandedHaciz === h.id ? null : h.id)}>
                    <div className="flex items-center gap-3">
                      <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', h.hacizDurumu === 'olumlu_cevap' || h.hacizDurumu === 'uygulanidi' ? 'bg-emerald-100' : h.hacizDurumu === 'olumsuz_cevap' ? 'bg-red-100' : 'bg-amber-100')}>
                        {h.hacizTuru === 'banka' ? <Building2 className="w-5 h-5 text-blue-600" /> : h.hacizTuru === 'arac' ? <Car className="w-5 h-5 text-purple-600" /> : h.hacizTuru === 'tasinmaz' ? <Landmark className="w-5 h-5 text-orange-600" /> : h.hacizTuru === 'maas' ? <Banknote className="w-5 h-5 text-cyan-600" /> : <Package className="w-5 h-5 text-slate-600" />}
                      </div>
                      <div><p className="text-sm font-semibold">{HACIZ_TURU_OPTIONS.find(o => o.value === h.hacizTuru)?.label} — {h.hedefKurum}</p><p className="text-xs text-slate-500">Talep: {fd(h.talepTarihi)} | {h.muzakkereNo || '-'}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', h.hacizDurumu === 'olumlu_cevap' || h.hacizDurumu === 'uygulanidi' ? 'bg-emerald-100 text-emerald-700' : h.hacizDurumu === 'olumsuz_cevap' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>{h.cevapDurumu || h.hacizDurumu}</span>
                      <ChevronDown className={clsx('w-4 h-4 text-slate-400', expandedHaciz === h.id && 'rotate-180')} />
                    </div>
                  </div>
                  {expandedHaciz === h.id && <div className="mt-3 pt-3 border-t text-xs space-y-1">
                    {h.cevapAciklamasi && <p><strong>Cevap:</strong> {h.cevapAciklamasi}</p>}
                    {h.blokeEdilen > 0 && <p className="text-emerald-600 font-semibold">Bloke: {fc(h.blokeEdilen)}</p>}
                    {h.aciklama && <p className="text-slate-500">{h.aciklama}</p>}
                  </div>}
                </div>
              ))}
              <h3 className="text-base font-semibold pt-2">Tebligatlar ({tebligatlar.length})</h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full"><thead><tr className="bg-slate-50 border-b">
                  {['Tür','Alıcı','Gönderim','Teslim','Durum','PTT Barkod'].map(h => <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">{h}</th>)}
                </tr></thead><tbody className="divide-y divide-slate-100">
                  {tebligatlar.map(teb => (
                    <tr key={teb.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-xs font-medium">{TEBLIGAT_TURU_OPTIONS.find(o => o.value === teb.tebligatTuru)?.label}</td>
                      <td className="px-3 py-2 text-xs">{teb.alici}</td>
                      <td className="px-3 py-2 text-xs">{fd(teb.gonderimTarihi)}</td>
                      <td className="px-3 py-2 text-xs">{fd(teb.teslimTarihi)}</td>
                      <td className="px-3 py-2"><span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', teb.tebligatDurumu === 'teslim_edildi' ? 'bg-emerald-100 text-emerald-700' : teb.tebligatDurumu === 'gonderildi' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700')}>{teb.tebligatDurumu === 'teslim_edildi' ? 'Teslim' : teb.tebligatDurumu === 'gonderildi' ? 'Gönderildi' : teb.tebligatDurumu}</span></td>
                      <td className="px-3 py-2 text-xs font-mono text-slate-500">{teb.pttBarkodu || '-'}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          )}

          {/* MALVARLIĞI */}
          {activeTab === 'malvarligi' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Malvarlığı Araştırması</h3>
              {malvarligiArastirmalari.map(m => (
                <div key={m.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3"><div className={clsx('w-9 h-9 rounded-full flex items-center justify-center', m.sonuc === 'olumlu' ? 'bg-emerald-100' : 'bg-red-100')}><Search className={clsx('w-4 h-4', m.sonuc === 'olumlu' ? 'text-emerald-600' : 'text-red-600')} /></div><div><p className="text-sm font-semibold">{m.sorguTuru.toUpperCase()} Sorgusu</p><p className="text-xs text-slate-500">{fd(m.sorguTarihi)}</p></div></div>
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', m.sonuc === 'olumlu' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{m.sonuc === 'olumlu' ? 'Olumlu' : 'Olumsuz'}</span>
                  </div>
                  <p className="text-xs text-slate-600">{m.sonucAciklamasi}</p>
                  {m.calistigiIsyeri && <p className="text-xs text-slate-500 mt-1"><strong>İşyeri:</strong> {m.calistigiIsyeri}</p>}
                  {m.notlar && <p className="text-xs text-slate-500 mt-1 italic">{m.notlar}</p>}
                </div>
              ))}
            </div>
          )}

          {/* BELGELER */}
          {activeTab === 'belgeler' && (() => {
            const filtered = belgeler.filter(b => {
              if (belgeSadecaOnemli && !b.onemliMi) return false;
              if (belgeKategoriFiltre !== 'all' && b.belgeKategorisi !== belgeKategoriFiltre) return false;
              if (belgeKaynakFiltre !== 'all' && b.belgeKaynagi !== belgeKaynakFiltre) return false;
              if (belgeArama) { const q = belgeArama.toLowerCase(); return b.belgeAdi.toLowerCase().includes(q) || b.dosyaAdi.toLowerCase().includes(q) || (b.aciklama || '').toLowerCase().includes(q) || b.etiketler.some(e => e.toLowerCase().includes(q)); }
              return true;
            }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            const uyapCount = belgeler.filter(b => b.belgeKaynagi === 'uyap').length;
            const onemliCount = belgeler.filter(b => b.onemliMi).length;
            const toplamBoyut = belgeler.reduce((s, b) => s + b.dosyaBoyutu, 0);
            return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"><FolderOpen className="w-4 h-4 text-blue-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">Toplam Belge</p><p className="text-lg font-bold text-slate-900">{belgeler.length}</p></div></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center"><ExternalLink className="w-4 h-4 text-indigo-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">UYAP Belge</p><p className="text-lg font-bold text-indigo-700">{uyapCount}</p></div></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center"><Star className="w-4 h-4 text-amber-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">Önemli</p><p className="text-lg font-bold text-amber-700">{onemliCount}</p></div></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"><Paperclip className="w-4 h-4 text-slate-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">Toplam Boyut</p><p className="text-lg font-bold text-slate-700">{fsize(toplamBoyut)}</p></div></div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={belgeArama} onChange={e => setBelgeArama(e.target.value)} placeholder="Belge ara (ad, açıklama, etiket)..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid" /></div>
                  <select value={belgeKategoriFiltre} onChange={e => setBelgeKategoriFiltre(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-icra-mid"><option value="all">Tüm Kategoriler</option>{BELGE_KATEGORISI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  <select value={belgeKaynakFiltre} onChange={e => setBelgeKaynakFiltre(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-icra-mid"><option value="all">Tüm Kaynaklar</option>{BELGE_KAYNAGI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  <button onClick={() => setBelgeSadecaOnemli(!belgeSadecaOnemli)} className={clsx('px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border cursor-pointer', belgeSadecaOnemli ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}><Star className={clsx('w-3.5 h-3.5', belgeSadecaOnemli && 'fill-amber-400')} /> Önemli</button>
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center"><FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" /><p className="text-sm text-slate-500">Eşleşen belge bulunamadı</p></div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(b => {
                    const katOpt = BELGE_KATEGORISI_OPTIONS.find(o => o.value === b.belgeKategorisi);
                    const kaynakOpt = BELGE_KAYNAGI_OPTIONS.find(o => o.value === b.belgeKaynagi);
                    return (
                    <div key={b.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', getFileIcon(b.dosyaUzantisi))}><FileText className="w-5 h-5" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2"><h4 className="text-sm font-semibold text-slate-900 truncate">{b.belgeAdi}</h4>{b.onemliMi && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />}</div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{b.dosyaAdi}</p>
                            </div>
                            <button className="p-1.5 rounded-lg text-icra-mid hover:bg-icra-light/10 cursor-pointer flex-shrink-0" title="İndir"><Download className="w-4 h-4" /></button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">{katOpt?.label || b.belgeKategorisi}</span>
                            <span className={clsx('px-2 py-0.5 rounded text-[10px] font-medium', b.belgeKaynagi === 'uyap' ? 'bg-icra-light/15 text-icra-dark' : b.belgeKaynagi === 'tarama' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-600')}>{kaynakOpt?.label || b.belgeKaynagi}</span>
                            <span className="text-[10px] text-slate-400">{fsize(b.dosyaBoyutu)}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] text-slate-400">{fd(b.createdAt)}</span>
                            {b.uyapEvrakId && <><span className="text-[10px] text-slate-400">•</span><span className="text-[10px] text-icra-mid font-mono">{b.uyapEvrakId}</span></>}
                          </div>
                          {b.aciklama && <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{b.aciklama}</p>}
                          {b.etiketler.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{b.etiketler.map((e, i) => <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-icra-mid rounded text-[10px]">#{e}</span>)}</div>}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })()}

          {/* OPERASYONEL TAKİP */}
          {activeTab === 'operasyonel' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-icra-mid" /> Operasyonel Takip</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoBox label="Sorumlu" value={operasyonelTakip.sorumluPersonel} />
                  <InfoBox label="Son İşlem" value={fd(operasyonelTakip.sonIslemTarihi)} />
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Sonraki İşlem</p><p className="text-sm font-semibold text-icra-mid">{fd(operasyonelTakip.sonrakiIslemTarihi)}</p></div>
                  <div className="p-3 bg-amber-50 rounded-xl"><p className="text-[10px] text-amber-600 uppercase">Hatırlatma</p><p className="text-sm font-semibold text-amber-700">{fd(operasyonelTakip.hatirlatmaTarihi)}</p></div>
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Risk</p><div className="flex gap-1 mt-1">{[1,2,3,4,5].map(i => <div key={i} className={clsx('w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center', i <= operasyonelTakip.riskSkoru ? (operasyonelTakip.riskSkoru <= 2 ? 'bg-emerald-500 text-white' : operasyonelTakip.riskSkoru <= 3 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-200')}>{i}</div>)}</div></div>
                  <InfoBox label="Tahsil Olasılığı" value={TAHSIL_OLASILIGI_OPTIONS.find(o => o.value === operasyonelTakip.tahsilOlasiligi)?.label} />
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Öncelik</p><p className={clsx('text-sm font-semibold', operasyonelTakip.oncelik === 'acil' ? 'text-red-600' : operasyonelTakip.oncelik === 'yuksek' ? 'text-orange-600' : 'text-slate-700')}>{operasyonelTakip.oncelik.charAt(0).toUpperCase() + operasyonelTakip.oncelik.slice(1)}</p></div>
                </div>
                {operasyonelTakip.icNotlar && <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl"><p className="text-xs font-semibold text-yellow-800 mb-1">İç Notlar</p><p className="text-sm text-yellow-900">{operasyonelTakip.icNotlar}</p></div>}
                {operasyonelTakip.sonDurumOzeti && <div className="mt-3 p-4 bg-icra-light/10 border border-icra-light/20 rounded-xl"><p className="text-xs font-semibold text-icra-dark mb-1">Son Durum Özeti</p><p className="text-sm text-icra-darkest">{operasyonelTakip.sonDurumOzeti}</p></div>}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <h4 className="text-sm font-semibold mb-3">Görüşmeler ({gorusmeler.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">{gorusmeler.map(g => <div key={g.id} className="p-2.5 bg-slate-50 rounded-lg"><div className="flex justify-between"><p className="text-xs font-semibold">{fd(g.gorusmeTarihi)} — {g.gorusmeTuru}</p><span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', g.sonuc === 'olumlu' ? 'bg-emerald-100 text-emerald-700' : g.sonuc === 'olumsuz' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>{g.sonuc}</span></div><p className="text-xs text-slate-600 mt-1">{g.aciklama}</p></div>)}</div>
                  {gorusmeler.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Henüz görüşme kaydı yok</p>}
                </div>
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <h4 className="text-sm font-semibold mb-3">Ziyaretler ({ziyaretler.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">{ziyaretler.map(z => <div key={z.id} className="p-2.5 bg-slate-50 rounded-lg"><div className="flex justify-between"><p className="text-xs font-semibold">{fd(z.ziyaretTarihi)}</p><span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', z.sonuc === 'gorusuldu' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{z.sonuc === 'gorusuldu' ? 'Görüşüldü' : 'Görüşülemedi'}</span></div><p className="text-xs text-slate-500">{z.ziyaretAdresi}</p><p className="text-xs text-slate-600 mt-1">{z.aciklama}</p></div>)}</div>
                  {ziyaretler.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Henüz ziyaret kaydı yok</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
