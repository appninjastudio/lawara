'use client';

import Header from '@/components/Header';
import {
  ArrowLeft, Save, Trash2, Eye, Edit2, User, Building2, Landmark,
  FileText, Calendar, Phone, MapPin, CreditCard, Clock, CheckCircle2,
  AlertTriangle, XCircle, Loader2, Plus, Search, UserPlus,
  Home as HomeIcon, Banknote, Info, X, MessageSquare, Navigation,
  ArrowUpDown, TrendingUp, Shield, BarChart3, Receipt, Mail,
  Car, Package, CircleDollarSign, Activity, ChevronDown,
  Star, Upload, Download, FolderOpen, Filter, Paperclip, ExternalLink,
} from 'lucide-react';
import { useState, useEffect, use } from 'react';
import clsx from 'clsx';
import type { IcraFoyu, HesaplananDegerler, Tahsilat, IslemKaydi, BorcluGorusmesi, YerindeZiyaret, Belge, BelgeKategorisi, BelgeKaynagi } from '@/types/icra-foyu';
import { TAKIP_TURU_OPTIONS, DOSYA_STATUSU_OPTIONS, FAIZ_TURU_OPTIONS, ODEME_YONTEMI_OPTIONS, TAHSIL_OLASILIGI_OPTIONS, HACIZ_TURU_OPTIONS, TEBLIGAT_TURU_OPTIONS, BELGE_KATEGORISI_OPTIONS, BELGE_KAYNAGI_OPTIONS } from '@/types/icra-foyu';

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

export default function FoyUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('dosya');
  const [foyu, setFoyu] = useState<IcraFoyu | null>(null);
  const [hesaplanan, setHesaplanan] = useState<HesaplananDegerler | null>(null);
  const [dosyaForm, setDosyaForm] = useState({ icraDairesi: '', dosyaNo: '', takipTuru: 'ilamsiz', dosyaStatusu: 'acik', dosyaAcilisTarihi: '', infazTarihi: '', faizTuru: 'yasal', faizOrani: '', icraBankaAdi: '', icraBankaIban: '', mtsTakibi: false, aboneNo: '', musteriKodu: '', klasorNo: '', foyNo: '', dosyaSorumlusu: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedHaciz, setExpandedHaciz] = useState<number | null>(null);
  const [localGorusmeler, setLocalGorusmeler] = useState<BorcluGorusmesi[]>([]);
  const [localZiyaretler, setLocalZiyaretler] = useState<YerindeZiyaret[]>([]);
  const [localTahsilatlar, setLocalTahsilatlar] = useState<Tahsilat[]>([]);
  const [localIslemler, setLocalIslemler] = useState<IslemKaydi[]>([]);
  const [localBelgeler, setLocalBelgeler] = useState<Belge[]>([]);
  const [belgeArama, setBelgeArama] = useState('');
  const [belgeKategoriFiltre, setBelgeKategoriFiltre] = useState<string>('all');
  const [belgeKaynakFiltre, setBelgeKaynakFiltre] = useState<string>('all');
  const [belgeSadecaOnemli, setBelgeSadecaOnemli] = useState(false);
  const [mForm, setMForm] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/foy/${id}`);
        const json = await res.json();
        if (json.success) {
          setFoyu(json.data); setHesaplanan(json.hesaplanan);
          setLocalGorusmeler(json.data.gorusmeler || []);
          setLocalZiyaretler(json.data.ziyaretler || []);
          setLocalTahsilatlar(json.data.tahsilatlar || []);
          setLocalIslemler(json.data.islemGecmisi || []);
          setLocalBelgeler(json.data.belgeler || []);
          const d = json.data.dosya;
          setDosyaForm({ icraDairesi: d.icraDairesi || '', dosyaNo: d.dosyaNo || '', takipTuru: d.takipTuru || 'ilamsiz', dosyaStatusu: d.dosyaStatusu || 'acik', dosyaAcilisTarihi: d.dosyaAcilisTarihi || '', infazTarihi: d.infazTarihi || '', faizTuru: d.faizTuru || 'yasal', faizOrani: d.faizOrani?.toString() || '', icraBankaAdi: d.icraBankaAdi || '', icraBankaIban: d.icraBankaIban || '', mtsTakibi: d.mtsTakibi || false, aboneNo: d.aboneNo || '', musteriKodu: d.musteriKodu || '', klasorNo: d.klasorNo || '', foyNo: d.foyNo || '', dosyaSorumlusu: d.dosyaSorumlusu || '' });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const showToastMsg = (m: string, t: 'success' | 'error' = 'success') => { setToast({ message: m, type: t }); setTimeout(() => setToast(null), 3000); };

  const handleSave = async () => {
    setSaving(true);
    try { await fetch(`/api/foy/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dosyaForm) }); await new Promise(r => setTimeout(r, 500)); showToastMsg('Föy başarıyla güncellendi'); }
    catch { showToastMsg('Güncelleme hatası', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => { setDeleting(true); await new Promise(r => setTimeout(r, 1000)); showToastMsg('Takip silindi'); setShowDeleteModal(false); setTimeout(() => { window.location.href = '/cases'; }, 1500); setDeleting(false); };

  const handleModalSubmit = async () => {
    if (!mForm.aciklama?.trim() && showModal !== 'tahsilat' && showModal !== 'belge') { showToastMsg('Açıklama giriniz', 'error'); return; }
    if (showModal === 'tahsilat' && !mForm.tutar) { showToastMsg('Tutar giriniz', 'error'); return; }
    setModalSaving(true);
    await new Promise(r => setTimeout(r, 500));
    const now = new Date().toISOString();
    const tarih = mForm.tarih || now.split('T')[0];

    if (showModal === 'gorusme') {
      setLocalGorusmeler(prev => [{ id: Date.now(), dosyaId: parseInt(id), tarafId: 2, gorusmeTarihi: tarih, gorusmeTuru: (mForm.tur || 'telefon') as BorcluGorusmesi['gorusmeTuru'], gorusmeYapan: foyu?.dosya.dosyaSorumlusu || '', sonuc: (mForm.sonuc || 'olumlu') as BorcluGorusmesi['sonuc'], odemeVaadi: false, vaadEdilenTutar: null, vaadEdilenTarih: null, aciklama: mForm.aciklama || '', createdAt: now, createdBy: 1 }, ...prev]);
      showToastMsg('Görüşme eklendi');
    } else if (showModal === 'ziyaret') {
      setLocalZiyaretler(prev => [{ id: Date.now(), dosyaId: parseInt(id), tarafId: 2, ziyaretTarihi: tarih, ziyaretAdresi: mForm.adres || '', ziyaretEden: foyu?.dosya.dosyaSorumlusu || '', sonuc: (mForm.sonuc || 'gorusulemedi') as YerindeZiyaret['sonuc'], aciklama: mForm.aciklama || '', createdAt: now, createdBy: 1 }, ...prev]);
      showToastMsg('Ziyaret eklendi');
    } else if (showModal === 'tahsilat') {
      const tutar = parseFloat(mForm.tutar || '0');
      setLocalTahsilatlar(prev => [{ id: Date.now(), dosyaId: parseInt(id), tahsilatTarihi: tarih, tahsilatTutari: tutar, odemeYontemi: (mForm.yontem || 'banka_havalesi') as Tahsilat['odemeYontemi'], tahsilatiAlan: foyu?.dosya.dosyaSorumlusu || '', anaParaPayi: tutar * 0.65, faizPayi: tutar * 0.2, harcPayi: tutar * 0.1, masrafPayi: tutar * 0.05, muvekkilGonderilenTutar: tutar * 0.85, muvekkilGonderimTarihi: null, vekilUcretiKesintisi: tutar * 0.15, guncelKalanBorc: (hesaplanan?.kalanBorc || 0) - tutar, makbuzNo: `MKB-${Date.now()}`, aciklama: mForm.aciklama || '', createdAt: now, createdBy: 1 }, ...prev]);
      showToastMsg('Tahsilat eklendi');
    } else if (showModal === 'islem') {
      setLocalIslemler(prev => [{ id: Date.now(), dosyaId: parseInt(id), islemTipi: (mForm.tip || 'not_eklendi') as IslemKaydi['islemTipi'], islemTarihi: tarih, aciklama: mForm.aciklama || '', iliskiliTebligatId: null, iliskiliHacizId: null, iliskiliTahsilatId: null, sonuc: null, belgeNo: null, yapanKisi: foyu?.dosya.dosyaSorumlusu || '', yapanKisiId: 1, hatirlatmaTarihi: null, hatirlatmaAciklamasi: null, createdAt: now }, ...prev]);
      showToastMsg('İşlem eklendi');
    } else if (showModal === 'belge') {
      if (!mForm.belgeAdi?.trim()) { setModalSaving(false); showToastMsg('Belge adı giriniz', 'error'); return; }
      const yeniBelge: Belge = {
        id: Date.now(), dosyaId: parseInt(id),
        belgeAdi: mForm.belgeAdi || '', dosyaAdi: mForm.dosyaAdi || `belge_${Date.now()}.pdf`,
        belgeKategorisi: (mForm.kategori || 'diger') as BelgeKategorisi,
        belgeKaynagi: (mForm.kaynak || 'manuel') as BelgeKaynagi,
        dosyaBoyutu: Math.floor(Math.random() * 3000000) + 50000,
        dosyaTipi: 'application/pdf', dosyaUzantisi: '.pdf',
        uyapEvrakId: mForm.kaynak === 'uyap' ? `UYAP-EVR-${Date.now()}` : null,
        uyapEvrakTuru: mForm.kaynak === 'uyap' ? mForm.belgeAdi : null,
        uyapIndirmeTarihi: mForm.kaynak === 'uyap' ? tarih : null,
        aciklama: mForm.aciklama || null, onemliMi: mForm.onemli === 'true',
        etiketler: (mForm.etiketler || '').split(',').map(e => e.trim()).filter(Boolean),
        depolamaYolu: `/belgeler/${dosyaForm.dosyaNo?.replace('/', '_')}/${mForm.dosyaAdi || 'belge.pdf'}`,
        onizlemeUrl: null,
        yukleyenKisi: foyu?.dosya.dosyaSorumlusu || '', yukleyenKisiId: 1,
        createdAt: now, updatedAt: now,
      };
      setLocalBelgeler(prev => [yeniBelge, ...prev]);
      showToastMsg('Belge eklendi');
    }
    setModalSaving(false); setShowModal(null); setMForm({});
  };

  if (loading) return <div className="flex flex-col h-full"><Header title="İcra Föyü" subtitle="Yükleniyor..." /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div></div>;
  if (!foyu) return <div className="flex flex-col h-full"><Header title="İcra Föyü" subtitle="Bulunamadı" /><div className="flex-1 flex flex-col items-center justify-center text-slate-400"><FileText className="w-16 h-16 mb-4" /><p>Föy bulunamadı</p><a href="/cases" className="mt-4 text-blue-600 hover:underline">Dosya listesine dön</a></div></div>;

  const { dosya, taraflar, alacakKalemleri, tebligatlar, hacizler, malvarligiArastirmalari, operasyonelTakip } = foyu;
  const borclu = taraflar.find(t => t.tarafRolu === 'borclu');
  const statusOpt = DOSYA_STATUSU_OPTIONS.find(o => o.value === dosya.dosyaStatusu);

  // Input helper
  const inp = (label: string, key: string, type = 'text', ro = false) => (
    <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
    <input type={type} value={(dosyaForm as Record<string, unknown>)[key] as string || ''} readOnly={ro} onChange={e => setDosyaForm(p => ({ ...p, [key]: e.target.value }))} className={clsx('w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500', ro && 'bg-slate-50')} /></div>
  );
  const sel = (label: string, key: string, opts: {value:string;label:string}[]) => (
    <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
    <select value={(dosyaForm as Record<string, unknown>)[key] as string || ''} onChange={e => setDosyaForm(p => ({ ...p, [key]: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">{opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header title={`İcra Föyü — ${dosya.foyNo}`} subtitle={`${dosya.dosyaNo} | ${borclu ? `${borclu.ad} ${borclu.soyad}` : ''} | ${dosya.muvekkilAdi}`} />
      <div className="flex-1 overflow-auto">
        {toast && <div className={clsx('fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white', toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600')}>{toast.message}</div>}

        {/* KPI Bar */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <a href={`/cases/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white"><ArrowLeft className="w-4 h-4" /> Dosya Detayına Dön</a>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowDeleteModal(true)} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Sil</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 cursor-pointer">{saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Kaydet</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { l: 'Toplam Alacak', v: fc(hesaplanan?.toplamAlacak || 0), c: 'text-white' },
              { l: 'Tahsilat', v: fc(hesaplanan?.toplamTahsilat || 0), c: 'text-emerald-400' },
              { l: 'Kalan Borç', v: fc(hesaplanan?.kalanBorc || 0), c: 'text-orange-400' },
              { l: 'Tahsil %', v: `%${hesaplanan?.tahsilYuzdesi?.toFixed(1) || '0'}`, c: 'text-cyan-400' },
              { l: 'Durum', v: statusOpt?.label || dosya.dosyaStatusu, c: 'text-blue-300' },
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
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={clsx('flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer', activeTab === tab.key ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700')}>{tab.icon} {tab.label}</button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* DOSYA BİLGİLERİ */}
          {activeTab === 'dosya' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Dosya Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inp('Föy No', 'foyNo')} {inp('İcra Dairesi', 'icraDairesi')} {inp('Dosya/Esas No', 'dosyaNo')}
                {sel('Takip Türü', 'takipTuru', TAKIP_TURU_OPTIONS)} {sel('Dosya Durumu', 'dosyaStatusu', DOSYA_STATUSU_OPTIONS)} {inp('Dosya Sorumlusu', 'dosyaSorumlusu')}
                {inp('Takip Açılış Tarihi', 'dosyaAcilisTarihi', 'date')} {inp('İnfaz Tarihi', 'infazTarihi', 'date')}
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Müvekkil</label><input type="text" readOnly value={dosya.muvekkilAdi} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" /></div>
              </div>
              <h4 className="text-sm font-semibold text-slate-700 pt-2">Banka & Faiz</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inp('İcra Banka Adı', 'icraBankaAdi')} {inp('İcra IBAN', 'icraBankaIban')} {sel('Faiz Türü', 'faizTuru', FAIZ_TURU_OPTIONS)} {inp('Faiz Oranı (%)', 'faizOrani', 'number')}
                <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={dosyaForm.mtsTakibi} onChange={e => setDosyaForm(p => ({ ...p, mtsTakibi: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" /><span className="text-sm text-slate-700">MTS Takibi</span></label></div>
              </div>
              <h4 className="text-sm font-semibold text-slate-700 pt-2">Ek Bilgiler</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {inp('Abone No', 'aboneNo')} {inp('Müşteri Kodu', 'musteriKodu')} {inp('Klasör No', 'klasorNo')}
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
                {t.tckn && <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">TCKN</p><p className="text-sm font-mono font-semibold">{t.tckn}</p></div>}
                {t.vkn && <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">VKN</p><p className="text-sm font-mono font-semibold">{t.vkn}</p></div>}
                {t.telefon1 && <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">Telefon</p><p className="text-sm font-semibold">{t.telefon1}</p></div>}
                {t.eposta && <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">E-posta</p><p className="text-sm font-semibold">{t.eposta}</p></div>}
                {t.il && <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">İl/İlçe</p><p className="text-sm font-semibold">{t.il}/{t.ilce}</p></div>}
                {t.dogumTarihi && <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">Doğum</p><p className="text-sm font-semibold">{fd(t.dogumTarihi)}</p></div>}
                {t.babaAdi && <div className="p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">Baba/Ana</p><p className="text-sm font-semibold">{t.babaAdi}/{t.anaAdi}</p></div>}
              </div>
              {t.adres && <div className="mt-3 p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">Adres</p><p className="text-sm">{t.adres}</p></div>}
              {t.mernisAdresi && <div className="mt-2 p-2 bg-blue-50 rounded-lg"><p className="text-[10px] text-blue-600">MERNİS ({fd(t.mernisTarihi)})</p><p className="text-sm">{t.mernisAdresi}</p></div>}
              {t.not && <div className="mt-2 p-2 bg-yellow-50 rounded-lg"><p className="text-xs text-yellow-800"><strong>Not:</strong> {t.not}</p></div>}
            </div>
          ))}

          {/* ALACAK KALEMLERİ */}
          {activeTab === 'alacak' && hesaplanan && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2"><Banknote className="w-5 h-5 text-blue-600" /> Alacak Kalemleri</h3>
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
                <div className="p-3 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500 uppercase">Faiz Türü</p><p className="text-sm font-semibold">{FAIZ_TURU_OPTIONS.find(o => o.value === alacakKalemleri.faizTuru)?.label}</p></div>
                <div className="p-3 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500 uppercase">Oran</p><p className="text-sm font-semibold">%{alacakKalemleri.faizOrani}</p></div>
                <div className="p-3 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500 uppercase">Başlangıç</p><p className="text-sm font-semibold">{fd(alacakKalemleri.faizBaslangicTarihi)}</p></div>
                <div className="p-3 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500 uppercase">Tahsil %</p><p className="text-sm font-semibold text-emerald-600">%{hesaplanan.tahsilYuzdesi.toFixed(1)}</p></div>
              </div>
            </div>
          )}

          {/* TAHSİLAT */}
          {activeTab === 'tahsilat' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold">Tahsilat Kayıtları</h3>
                <button onClick={() => { setMForm({ tarih: new Date().toISOString().split('T')[0], tutar: '', yontem: 'banka_havalesi', aciklama: '' }); setShowModal('tahsilat'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Tahsilat Ekle</button>
              </div>
              {localTahsilatlar.sort((a, b) => b.tahsilatTarihi.localeCompare(a.tahsilatTarihi)).map(t => (
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
            </div>
          )}

          {/* İŞLEM GEÇMİŞİ */}
          {activeTab === 'islemler' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold">İşlem Geçmişi (Timeline)</h3>
                <button onClick={() => { setMForm({ tarih: new Date().toISOString().split('T')[0], tip: 'not_eklendi', aciklama: '' }); setShowModal('islem'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> İşlem Ekle</button>
              </div>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />
                {localIslemler.sort((a, b) => b.islemTarihi.localeCompare(a.islemTarihi)).map(is => (
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
            const filtered = localBelgeler.filter(b => {
              if (belgeSadecaOnemli && !b.onemliMi) return false;
              if (belgeKategoriFiltre !== 'all' && b.belgeKategorisi !== belgeKategoriFiltre) return false;
              if (belgeKaynakFiltre !== 'all' && b.belgeKaynagi !== belgeKaynakFiltre) return false;
              if (belgeArama) { const q = belgeArama.toLowerCase(); return b.belgeAdi.toLowerCase().includes(q) || b.dosyaAdi.toLowerCase().includes(q) || (b.aciklama || '').toLowerCase().includes(q) || b.etiketler.some(e => e.toLowerCase().includes(q)); }
              return true;
            }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
            const uyapCount = localBelgeler.filter(b => b.belgeKaynagi === 'uyap').length;
            const onemliCount = localBelgeler.filter(b => b.onemliMi).length;
            const toplamBoyut = localBelgeler.reduce((s, b) => s + b.dosyaBoyutu, 0);
            return (
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"><FolderOpen className="w-4 h-4 text-blue-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">Toplam Belge</p><p className="text-lg font-bold text-slate-900">{localBelgeler.length}</p></div></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center"><ExternalLink className="w-4 h-4 text-indigo-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">UYAP Belge</p><p className="text-lg font-bold text-indigo-700">{uyapCount}</p></div></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center"><Star className="w-4 h-4 text-amber-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">Önemli</p><p className="text-lg font-bold text-amber-700">{onemliCount}</p></div></div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"><Paperclip className="w-4 h-4 text-slate-600" /></div><div><p className="text-[10px] text-slate-500 uppercase">Toplam Boyut</p><p className="text-lg font-bold text-slate-700">{fsize(toplamBoyut)}</p></div></div>
              </div>
              {/* Toolbar */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px] relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" value={belgeArama} onChange={e => setBelgeArama(e.target.value)} placeholder="Belge ara (ad, açıklama, etiket)..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  <select value={belgeKategoriFiltre} onChange={e => setBelgeKategoriFiltre(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="all">Tüm Kategoriler</option>{BELGE_KATEGORISI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  <select value={belgeKaynakFiltre} onChange={e => setBelgeKaynakFiltre(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="all">Tüm Kaynaklar</option>{BELGE_KAYNAGI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                  <button onClick={() => setBelgeSadecaOnemli(!belgeSadecaOnemli)} className={clsx('px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border cursor-pointer', belgeSadecaOnemli ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}><Star className={clsx('w-3.5 h-3.5', belgeSadecaOnemli && 'fill-amber-400')} /> Önemli</button>
                  <button onClick={() => { setMForm({ belgeAdi: '', dosyaAdi: '', kategori: 'diger', kaynak: 'manuel', aciklama: '', onemli: 'false', etiketler: '' }); setShowModal('belge'); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer"><Upload className="w-3.5 h-3.5" /> Belge Ekle</button>
                </div>
              </div>
              {/* Belge Listesi */}
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
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button onClick={() => setLocalBelgeler(prev => prev.map(x => x.id === b.id ? { ...x, onemliMi: !x.onemliMi } : x))} className={clsx('p-1.5 rounded-lg cursor-pointer', b.onemliMi ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100')} title={b.onemliMi ? 'Önemli kaldır' : 'Önemli işaretle'}><Star className={clsx('w-4 h-4', b.onemliMi && 'fill-amber-400')} /></button>
                              <button className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer" title="İndir"><Download className="w-4 h-4" /></button>
                              <button onClick={() => setLocalBelgeler(prev => prev.filter(x => x.id !== b.id))} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer" title="Sil"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">{katOpt?.label || b.belgeKategorisi}</span>
                            <span className={clsx('px-2 py-0.5 rounded text-[10px] font-medium', b.belgeKaynagi === 'uyap' ? 'bg-indigo-100 text-indigo-700' : b.belgeKaynagi === 'tarama' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-600')}>{kaynakOpt?.label || b.belgeKaynagi}</span>
                            <span className="text-[10px] text-slate-400">{fsize(b.dosyaBoyutu)}</span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] text-slate-400">{fd(b.createdAt)}</span>
                            {b.uyapEvrakId && <><span className="text-[10px] text-slate-400">•</span><span className="text-[10px] text-indigo-500 font-mono">{b.uyapEvrakId}</span></>}
                          </div>
                          {b.aciklama && <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{b.aciklama}</p>}
                          {b.etiketler.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{b.etiketler.map((e, i) => <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">#{e}</span>)}</div>}
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
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600" /> Operasyonel Takip</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Sorumlu</p><p className="text-sm font-semibold">{operasyonelTakip.sorumluPersonel}</p></div>
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Son İşlem</p><p className="text-sm font-semibold">{fd(operasyonelTakip.sonIslemTarihi)}</p></div>
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Sonraki İşlem</p><p className="text-sm font-semibold text-blue-600">{fd(operasyonelTakip.sonrakiIslemTarihi)}</p></div>
                  <div className="p-3 bg-amber-50 rounded-xl"><p className="text-[10px] text-amber-600 uppercase">Hatırlatma</p><p className="text-sm font-semibold text-amber-700">{fd(operasyonelTakip.hatirlatmaTarihi)}</p></div>
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Risk</p><div className="flex gap-1 mt-1">{[1,2,3,4,5].map(i => <div key={i} className={clsx('w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center', i <= operasyonelTakip.riskSkoru ? (operasyonelTakip.riskSkoru <= 2 ? 'bg-emerald-500 text-white' : operasyonelTakip.riskSkoru <= 3 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white') : 'bg-slate-200')}>{i}</div>)}</div></div>
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Tahsil Olasılığı</p><p className="text-sm font-semibold">{TAHSIL_OLASILIGI_OPTIONS.find(o => o.value === operasyonelTakip.tahsilOlasiligi)?.label}</p></div>
                  <div className="p-3 bg-slate-50 rounded-xl"><p className="text-[10px] text-slate-500 uppercase">Öncelik</p><p className={clsx('text-sm font-semibold', operasyonelTakip.oncelik === 'acil' ? 'text-red-600' : operasyonelTakip.oncelik === 'yuksek' ? 'text-orange-600' : 'text-slate-700')}>{operasyonelTakip.oncelik.charAt(0).toUpperCase() + operasyonelTakip.oncelik.slice(1)}</p></div>
                </div>
                {operasyonelTakip.icNotlar && <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-xl"><p className="text-xs font-semibold text-yellow-800 mb-1">İç Notlar</p><p className="text-sm text-yellow-900">{operasyonelTakip.icNotlar}</p></div>}
                {operasyonelTakip.sonDurumOzeti && <div className="mt-3 p-4 bg-blue-50 border border-blue-100 rounded-xl"><p className="text-xs font-semibold text-blue-800 mb-1">Son Durum Özeti</p><p className="text-sm text-blue-900">{operasyonelTakip.sonDurumOzeti}</p></div>}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-semibold">Görüşmeler ({localGorusmeler.length})</h4><button onClick={() => { setMForm({ tarih: new Date().toISOString().split('T')[0], aciklama: '', sonuc: 'olumlu', tur: 'telefon' }); setShowModal('gorusme'); }} className="text-xs text-emerald-600 font-medium flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Ekle</button></div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">{localGorusmeler.map(g => <div key={g.id} className="p-2.5 bg-slate-50 rounded-lg"><div className="flex justify-between"><p className="text-xs font-semibold">{fd(g.gorusmeTarihi)} — {g.gorusmeTuru}</p><span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', g.sonuc === 'olumlu' ? 'bg-emerald-100 text-emerald-700' : g.sonuc === 'olumsuz' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}>{g.sonuc}</span></div><p className="text-xs text-slate-600 mt-1">{g.aciklama}</p></div>)}</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border p-5">
                  <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-semibold">Ziyaretler ({localZiyaretler.length})</h4><button onClick={() => { setMForm({ tarih: new Date().toISOString().split('T')[0], adres: borclu?.adres || '', aciklama: '', sonuc: 'gorusulemedi' }); setShowModal('ziyaret'); }} className="text-xs text-amber-600 font-medium flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Ekle</button></div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">{localZiyaretler.map(z => <div key={z.id} className="p-2.5 bg-slate-50 rounded-lg"><div className="flex justify-between"><p className="text-xs font-semibold">{fd(z.ziyaretTarihi)}</p><span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', z.sonuc === 'gorusuldu' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{z.sonuc === 'gorusuldu' ? 'Görüşüldü' : 'Görüşülemedi'}</span></div><p className="text-xs text-slate-500">{z.ziyaretAdresi}</p><p className="text-xs text-slate-600 mt-1">{z.aciklama}</p></div>)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between"><h3 className="font-semibold text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Takip Silme</h3><button onClick={() => setShowDeleteModal(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button></div>
            <div className="p-5"><p className="text-sm">Bu takibi silmek istediğinize emin misiniz?</p><p className="text-sm text-slate-500 mt-1">Dosya: <strong>{dosya.dosyaNo}</strong></p><p className="text-xs text-red-500 mt-2">Bu işlem geri alınamaz!</p></div>
            <div className="p-5 border-t flex gap-3 justify-end"><button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200">İptal</button><button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">{deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Sil</button></div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className={clsx('font-semibold flex items-center gap-2', showModal === 'gorusme' ? 'text-emerald-700' : showModal === 'ziyaret' ? 'text-amber-700' : showModal === 'tahsilat' ? 'text-emerald-700' : showModal === 'belge' ? 'text-blue-700' : 'text-blue-700')}>
                {showModal === 'gorusme' ? <><MessageSquare className="w-5 h-5" /> Görüşme Ekle</> : showModal === 'ziyaret' ? <><Navigation className="w-5 h-5" /> Ziyaret Ekle</> : showModal === 'tahsilat' ? <><CircleDollarSign className="w-5 h-5" /> Tahsilat Ekle</> : showModal === 'belge' ? <><Upload className="w-5 h-5" /> Belge Ekle</> : <><Activity className="w-5 h-5" /> İşlem Ekle</>}
              </h3>
              <button onClick={() => setShowModal(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Tarih</label><input type="date" value={mForm.tarih || ''} onChange={e => setMForm(p => ({ ...p, tarih: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              {showModal === 'tahsilat' && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Tutar (₺)</label><input type="number" value={mForm.tutar || ''} onChange={e => setMForm(p => ({ ...p, tutar: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>}
              {showModal === 'tahsilat' && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Ödeme Yöntemi</label><select value={mForm.yontem || 'banka_havalesi'} onChange={e => setMForm(p => ({ ...p, yontem: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">{ODEME_YONTEMI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>}
              {showModal === 'gorusme' && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Görüşme Türü</label><select value={mForm.tur || 'telefon'} onChange={e => setMForm(p => ({ ...p, tur: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"><option value="telefon">Telefon</option><option value="yuzeyuze">Yüz Yüze</option><option value="online">Online</option></select></div>}
              {(showModal === 'gorusme' || showModal === 'ziyaret') && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Sonuç</label><select value={mForm.sonuc || ''} onChange={e => setMForm(p => ({ ...p, sonuc: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">{showModal === 'gorusme' ? [['olumlu','Olumlu'],['olumsuz','Olumsuz'],['belirsiz','Belirsiz']].map(([v,l]) => <option key={v} value={v}>{l}</option>) : [['gorusuldu','Görüşüldü'],['gorusulemedi','Görüşülemedi']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>}
              {showModal === 'ziyaret' && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Adres</label><input type="text" value={mForm.adres || ''} onChange={e => setMForm(p => ({ ...p, adres: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>}
              {showModal === 'islem' && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">İşlem Tipi</label><select value={mForm.tip || 'not_eklendi'} onChange={e => setMForm(p => ({ ...p, tip: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">{[['not_eklendi','Not'],['borclu_gorusmesi','Görüşme'],['haciz_talebi_verildi','Haciz Talebi'],['tebligat_cikti','Tebligat'],['masraf_yapildi','Masraf'],['harc_yatirildi','Harç'],['diger','Diğer']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></div>}
              {showModal === 'belge' && <>
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Belge Adı *</label><input type="text" value={mForm.belgeAdi || ''} onChange={e => setMForm(p => ({ ...p, belgeAdi: e.target.value }))} placeholder="ör. Ödeme Emri, Vekaletname..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Dosya Adı</label><input type="text" value={mForm.dosyaAdi || ''} onChange={e => setMForm(p => ({ ...p, dosyaAdi: e.target.value }))} placeholder="ör. odeme_emri.pdf" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Kategori</label><select value={mForm.kategori || 'diger'} onChange={e => setMForm(p => ({ ...p, kategori: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">{BELGE_KATEGORISI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                  <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Kaynak</label><select value={mForm.kaynak || 'manuel'} onChange={e => setMForm(p => ({ ...p, kaynak: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">{BELGE_KAYNAGI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                </div>
                <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Etiketler (virgülle ayırın)</label><input type="text" value={mForm.etiketler || ''} onChange={e => setMForm(p => ({ ...p, etiketler: e.target.value }))} placeholder="ör. haciz, banka, ödeme emri" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div className="flex items-center gap-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={mForm.onemli === 'true'} onChange={e => setMForm(p => ({ ...p, onemli: e.target.checked ? 'true' : 'false' }))} className="w-4 h-4 rounded border-slate-300 text-amber-600" /><span className="text-sm text-slate-700 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> Önemli belge olarak işaretle</span></label></div>
              </>}
              {showModal !== 'belge' && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Açıklama</label><textarea rows={3} value={mForm.aciklama || ''} onChange={e => setMForm(p => ({ ...p, aciklama: e.target.value }))} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>}
              {showModal === 'belge' && <div><label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Açıklama (opsiyonel)</label><textarea rows={2} value={mForm.aciklama || ''} onChange={e => setMForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="Belge hakkında kısa not..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>}
            </div>
            <div className="p-5 border-t flex gap-3 justify-end">
              <button onClick={() => setShowModal(null)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200">İptal</button>
              <button onClick={handleModalSubmit} disabled={modalSaving} className={clsx('px-4 py-2 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2', showModal === 'gorusme' || showModal === 'tahsilat' ? 'bg-emerald-600 hover:bg-emerald-700' : showModal === 'ziyaret' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700')}>
                {modalSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
