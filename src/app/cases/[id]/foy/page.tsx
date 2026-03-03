'use client';

import Header from '@/components/Header';
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  Edit2,
  User,
  Building2,
  Landmark,
  FileText,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Plus,
  Search,
  RefreshCw,
  UserPlus,
  Home as HomeIcon,
  Banknote,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useState, useEffect, use } from 'react';
import clsx from 'clsx';

interface FoyData {
  id: number;
  caseNumber: string;
  foyNumber: string | null;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  caseType: string;
  status: string;
  createdAt: string;
  debtor: {
    id: number; firstName: string; lastName: string; tcNo: string;
    phone: string | null; email: string | null; address: string | null;
  };
  creditor: {
    id: number; name: string; type: string; taxNo?: string; address: string | null;
  };
  court: { id: number; name: string; city: string };
  createdBy: { id: number; name: string; email: string };
}

const takipDurumuOptions = [
  'Takip Açıldı', 'Ödeme Emri Gönderildi', 'Ödeme Emri Tebliğ Edildi',
  'İtiraz Edildi', 'İtiraz Kaldırıldı', 'Haciz Aşamasında', 'Haciz Uygulandı',
  'Satış Aşamasında', 'Tahsilat Yapıldı', 'Dosya Kapatıldı', 'İnfaz Edildi',
];

const dosyaDurumuOptions = [
  'Derdest', 'İtiraz', 'İtiraz Kaldırıldı', 'Haciz', 'Hızam',
  'İdari Takip', 'Kapatıldı', 'Tamamlandı', 'Arşiv',
];

const faizTuruOptions = [
  { value: 'faiz', label: 'Faiz' },
  { value: 'kar_payi', label: 'Kar Payı' },
];

export default function FoyUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [icraMudurlugu, setIcraMudurlugu] = useState('');
  const [icraBankaIban, setIcraBankaIban] = useState('');
  const [esasNo, setEsasNo] = useState('');
  const [takipAcilisTarihi, setTakipAcilisTarihi] = useState('');
  const [takipDurumu, setTakipDurumu] = useState('Takip Açıldı');
  const [dosyaDurumu, setDosyaDurumu] = useState('Derdest');
  const [infazTarihi, setInfazTarihi] = useState('');
  const [faizTuru, setFaizTuru] = useState('faiz');
  const [mtsTakibi, setMtsTakibi] = useState(false);
  const [aboneNo, setAboneNo] = useState('');
  const [foyNumber, setFoyNumber] = useState('');

  // Case data
  const [caseData, setCaseData] = useState<FoyData | null>(null);

  // Borçlu listesi
  const [borclular, setBorclular] = useState<{
    foyBorcludan: string; telefon: string; tckn: string; konum: string;
  }[]>([]);

  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`/api/cases/${id}`);
        const json = await res.json();
        const d = json.data;
        setCaseData(d);

        // Form alanlarını doldur
        setIcraMudurlugu(d.court?.name || '');
        setEsasNo(d.caseNumber || '');
        setFoyNumber(d.foyNumber || '');
        setTakipAcilisTarihi(d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '');

        // Borçlu bilgisi
        if (d.debtor) {
          setBorclular([{
            foyBorcludan: `${d.debtor.firstName} ${d.debtor.lastName}`,
            telefon: d.debtor.phone || '',
            tckn: d.debtor.tcNo || '',
            konum: d.debtor.address || 'BORÇLU/MÜFLİS',
          }]);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [id]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFoyGuncelle = async () => {
    setSaving(true);
    try {
      // Mock save
      await new Promise(r => setTimeout(r, 1000));
      showToast('Föy başarıyla güncellendi');
    } catch {
      showToast('Güncelleme sırasında hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTakipSil = async () => {
    if (!confirm('Bu takibi silmek istediğinize emin misiniz?')) return;
    showToast('Takip silindi', 'error');
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Föy Güncelleme" subtitle="Yükleniyor..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Föy Güncelleme" subtitle="Dosya bulunamadı" />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <FileText className="w-16 h-16 mb-4" />
          <p className="text-xl font-medium">Dosya bulunamadı</p>
          <a href="/cases" className="mt-4 text-blue-600 hover:underline">Dosya listesine dön</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={`Föy Güncelleme — ${caseData.caseNumber}`} subtitle={`${caseData.debtor.firstName} ${caseData.debtor.lastName} - ${caseData.creditor.name}`} />

      <div className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Toast */}
        {toast && (
          <div className={clsx(
            'fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all',
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          )}>
            {toast.message}
          </div>
        )}

        {/* Geri Dön */}
        <a href={`/cases/${id}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Dosya Detayına Dön
        </a>

        {/* İşlemler Kutusu */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-600" />
              İşlemler Kutusu
            </h2>
          </div>

          {/* Aksiyon Butonları */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-slate-100">
            <a href={`/cases/${id}`} className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors border-r border-orange-400">
              <ArrowLeft className="w-4 h-4" />
              Vazgeç
            </a>
            <button onClick={handleTakipSil} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors border-r border-red-400">
              <Trash2 className="w-4 h-4" />
              Takip Sil
            </button>
            <a href={`/cases/${id}`} className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-colors border-r border-sky-400">
              <Edit2 className="w-4 h-4" />
              Takip Düzelt
            </a>
            <a href={`/cases/${id}`} className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium transition-colors">
              <Eye className="w-4 h-4" />
              Takip Görüntüle
            </a>
          </div>

          {/* Form İçeriği */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Sol Panel: Dosya Ön Bilgileri */}
            <div className="p-5 space-y-5">
              <h3 className="text-base font-semibold text-blue-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Dosya Ön Bilgileri
              </h3>

              <div className="space-y-4">
                {/* İcra Müdürlüğü */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">İcra Müdürlüğü</label>
                  <input
                    type="text"
                    value={icraMudurlugu}
                    onChange={(e) => setIcraMudurlugu(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* İcra md. banka adı / İban no */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">İcra Md. Banka Adı / İban No</label>
                  <input
                    type="text"
                    value={icraBankaIban}
                    onChange={(e) => setIcraBankaIban(e.target.value)}
                    placeholder="Banka adı ve IBAN numarası..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Takip Durumu + Dosyanın Durumu */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Takip Durumu</label>
                    <select
                      value={takipDurumu}
                      onChange={(e) => setTakipDurumu(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {takipDurumuOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Dosyanın Durumu</label>
                    <select
                      value={dosyaDurumu}
                      onChange={(e) => setDosyaDurumu(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {dosyaDurumuOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Faiz / Kar Payı */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Faiz / Kar Payı</label>
                  <div className="flex items-center gap-4 mt-1">
                    {faizTuruOptions.map(opt => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="faizTuru"
                          value={opt.value}
                          checked={faizTuru === opt.value}
                          onChange={(e) => setFaizTuru(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* MTS Takibi */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="mtsTakibi"
                    checked={mtsTakibi}
                    onChange={(e) => setMtsTakibi(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="mtsTakibi" className="text-sm text-slate-700 cursor-pointer">MTS Takibi İse Kutucuğu İşaretleyiniz</label>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-slate-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-2 w-48 shadow-lg">
                      Menfi Tespit Davası takibi ise işaretleyiniz
                    </div>
                  </div>
                </div>

                {/* Föyü Güncelle Butonu */}
                <button
                  onClick={handleFoyGuncelle}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-sm font-semibold hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Föyü Güncelle
                </button>
              </div>
            </div>

            {/* Sağ Panel: Esas/Tal. No + Tarihler + Borçlu İşlemleri */}
            <div className="p-5 space-y-5">
              {/* Esas/Tal. No */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Esas/Tal. No</label>
                  <input
                    type="text"
                    value={esasNo}
                    onChange={(e) => setEsasNo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Föy No</label>
                  <input
                    type="text"
                    value={foyNumber}
                    onChange={(e) => setFoyNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Takip Açılış Tarihi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Takip Açılış Tarihi</label>
                  <input
                    type="date"
                    value={takipAcilisTarihi}
                    onChange={(e) => setTakipAcilisTarihi(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">İnfaz Tarihi</label>
                  <input
                    type="date"
                    value={infazTarihi}
                    onChange={(e) => setInfazTarihi(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Abone No */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Abone No</label>
                <input
                  type="text"
                  value={aboneNo}
                  onChange={(e) => setAboneNo(e.target.value)}
                  placeholder="Abone numarası..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Borçlu İşlemleri */}
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Borçlu İşlemleri
                </h3>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-700 text-white">
                        <th className="px-3 py-2 text-left text-xs font-medium">Föy Borçludan</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Telefon</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">TCKN</th>
                        <th className="px-3 py-2 text-left text-xs font-medium">Konum</th>
                        <th className="px-3 py-2 text-center text-xs font-medium w-8">
                          <Search className="w-3 h-3 mx-auto" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {borclular.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-sm text-slate-900 font-medium">{b.foyBorcludan}</td>
                          <td className="px-3 py-2 text-sm text-slate-600">{b.telefon}</td>
                          <td className="px-3 py-2 text-sm text-slate-600 font-mono">{b.tckn}</td>
                          <td className="px-3 py-2 text-sm text-slate-600">{b.konum}</td>
                          <td className="px-3 py-2 text-center">
                            <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                              <Search className="w-3 h-3 text-slate-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">
                    <UserPlus className="w-4 h-4" />
                    Borçlu Görüşmesi Ekle
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors">
                    <HomeIcon className="w-4 h-4" />
                    Yerinde Ziyaret Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Tablo: Föy Listesi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500 italic">Drag a column header here to group by that column</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Föy No</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Borçlu</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Müvekkil</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">İcra Dairesi</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Esas</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Takip Tarihi</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">İleri Takip Sevk</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Müşteri Kodu</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Takip Türü</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Takip Şekli</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Ekleyen</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Durumu</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Dosya No</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Klasör No</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium">Sistem No</th>
                </tr>
              </thead>
              {/* Filtre satırı */}
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <th key={i} className="px-2 py-1.5">
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="⇅"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Mock veri satırı */}
                <tr className="hover:bg-blue-50 cursor-pointer bg-blue-50/50">
                  <td className="px-3 py-2.5 text-sm font-medium text-slate-900">{caseData.foyNumber || 'F-001'}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-700">{caseData.debtor.firstName} {caseData.debtor.lastName}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{caseData.creditor.name}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{caseData.court.name}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{caseData.caseNumber}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{takipAcilisTarihi ? new Date(takipAcilisTarihi).toLocaleDateString('tr-TR') : '-'}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-500">-</td>
                  <td className="px-3 py-2.5 text-sm text-slate-500">-</td>
                  <td className="px-3 py-2.5 text-sm">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium',
                      caseData.caseType === 'ilamli' ? 'bg-purple-100 text-purple-700' :
                      caseData.caseType === 'ilamsiz' ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-orange-700'
                    )}>
                      {caseData.caseType === 'ilamli' ? 'İlamlı' : caseData.caseType === 'ilamsiz' ? 'İlamsız' : 'Kambiyo'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">
                    {caseData.caseType === 'ilamli' ? 'İlamlı' : 'İlamsız'} İcra
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{caseData.createdBy.name.split(' ').pop()?.toLowerCase()}</td>
                  <td className="px-3 py-2.5 text-sm">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{dosyaDurumu}</span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-slate-600">{caseData.caseNumber}</td>
                  <td className="px-3 py-2.5 text-sm text-slate-500">-</td>
                  <td className="px-3 py-2.5 text-sm text-slate-500 font-mono">~{caseData.id}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Alt sayfa bilgisi */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <span className="text-xs text-slate-500">Sayfa 1 / 1 (1 adet Föy)</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 mr-2">Page size:</span>
              <select className="px-2 py-1 text-xs border border-slate-300 rounded bg-white">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
