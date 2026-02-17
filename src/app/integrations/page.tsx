'use client';

import Header from '@/components/Header';
import { 
  Link2, 
  MessageSquare, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Send,
  Download,
  Filter,
  Search,
  ExternalLink,
  AlertTriangle,
  Zap,
  Banknote,
  Building2,
  Car,
  Mail,
  FileText,
  CreditCard,
  FileCheck,
  Inbox,
  ChevronRight,
  X,
  Loader2,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const uyapLogs = [
  { id: 1, caseId: '2024/1234', action: 'Dosya Sorgusu', status: 'success', timestamp: '15.01.2024 14:32', details: 'Borçlu bilgileri güncellendi' },
  { id: 2, caseId: '2024/1235', action: 'Haciz Talebi', status: 'success', timestamp: '15.01.2024 13:45', details: 'Talep başarıyla iletildi' },
  { id: 3, caseId: '2024/1236', action: 'Dosya Sorgusu', status: 'error', timestamp: '15.01.2024 12:20', details: 'UYAP bağlantı hatası' },
  { id: 4, caseId: '2024/1237', action: 'Taraf Bilgisi', status: 'success', timestamp: '15.01.2024 11:15', details: 'TC kimlik doğrulandı' },
  { id: 5, caseId: '2024/1238', action: 'Ödeme Emri', status: 'pending', timestamp: '15.01.2024 10:30', details: 'İşlem beklemede' },
  { id: 6, caseId: '2024/1239', action: 'Dosya Sorgusu', status: 'success', timestamp: '14.01.2024 16:45', details: 'Dosya durumu güncellendi' },
];

const smsLogs = [
  { id: 1, caseId: '2024/1234', recipient: '0532****78', message: 'Ödeme hatırlatması', status: 'delivered', timestamp: '15.01.2024 14:00' },
  { id: 2, caseId: '2024/1235', recipient: '0545****23', message: 'Haciz ihbarı', status: 'delivered', timestamp: '15.01.2024 13:30' },
  { id: 3, caseId: '2024/1236', recipient: '0555****90', message: 'Ödeme hatırlatması', status: 'failed', timestamp: '15.01.2024 12:00' },
  { id: 4, caseId: '2024/1237', recipient: '0542****45', message: 'Borç bildirimi', status: 'delivered', timestamp: '15.01.2024 11:00' },
  { id: 5, caseId: '2024/1238', recipient: '0533****67', message: 'Ödeme hatırlatması', status: 'pending', timestamp: '15.01.2024 10:00' },
];

const statusConfig = {
  success: { label: 'Başarılı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  delivered: { label: 'İletildi', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  error: { label: 'Hata', color: 'bg-red-100 text-red-700', icon: XCircle },
  failed: { label: 'Başarısız', color: 'bg-red-100 text-red-700', icon: XCircle },
  pending: { label: 'Beklemede', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

const buyaparActions = [
  { id: 1, name: 'Tüm Hızlı İşlemler', count: 8508, color: 'bg-orange-500', icon: Zap },
  { id: 2, name: 'Maaş Haczi', count: 482, color: 'bg-blue-500', icon: Banknote },
  { id: 3, name: 'Taşınmaz Haczi', count: 4051, color: 'bg-emerald-500', icon: Building2 },
  { id: 4, name: 'Araç Haczi', count: null, color: 'bg-cyan-500', icon: Car },
  { id: 5, name: 'Posta Çeki Haczi', count: null, color: 'bg-violet-500', icon: Mail },
  { id: 6, name: 'İcra Dosya Alacağı Haczi', count: null, color: 'bg-pink-500', icon: FileText },
  { id: 7, name: 'Banka 89/1', count: null, color: 'bg-amber-500', icon: CreditCard },
  { id: 8, name: 'SGK Mesajı', count: 4004, color: 'bg-teal-500', icon: FileCheck },
  { id: 9, name: "21'e Göre Tebliğ", count: 1, color: 'bg-rose-500', icon: Mail },
  { id: 10, name: 'Reddiyat', count: null, color: 'bg-red-500', icon: XCircle },
  { id: 11, name: 'Evrak Kutusu', count: null, color: 'bg-indigo-500', icon: Inbox },
];

const buyaparMockResults: Record<number, { description: string; items: { caseId: string; debtor: string; detail: string; status: string }[] }> = {
  1: { description: 'Tüm hızlı işlem türlerinin özet listesi', items: [
    { caseId: '2024/1234', debtor: 'Ahmet Yılmaz', detail: 'Maaş haczi müzekkeresi gönderildi', status: 'success' },
    { caseId: '2024/1236', debtor: 'Ayşe Demir', detail: 'Taşınmaz haczi şerhi konuldu', status: 'success' },
    { caseId: '2024/1238', debtor: 'Ali Öztürk', detail: 'Araç haczi talebi UYAP\'a iletildi', status: 'pending' },
    { caseId: '2024/1241', debtor: 'Elif Yıldız', detail: 'Banka 89/1 ihbarnamesi gönderildi', status: 'success' },
  ]},
  2: { description: 'SGK üzerinden maaş haczi müzekkeresi gönderimi', items: [
    { caseId: '2024/1234', debtor: 'Ahmet Yılmaz', detail: 'ABC Tekstil A.Ş. - Aylık ₺4.250 kesinti', status: 'success' },
    { caseId: '2024/1237', debtor: 'Fatma Çelik', detail: 'XYZ Gıda Ltd. - Aylık ₺2.800 kesinti', status: 'success' },
    { caseId: '2024/1240', debtor: 'Hasan Kara', detail: 'İşveren bilgisi bekleniyor', status: 'pending' },
  ]},
  3: { description: 'Tapu müdürlüğüne taşınmaz haciz şerhi', items: [
    { caseId: '2024/1236', debtor: 'Ayşe Demir', detail: 'Kadıköy - 3 ada 15 parsel, 85m² daire', status: 'success' },
    { caseId: '2024/1235', debtor: 'Mehmet Kaya', detail: 'Karşıyaka - 12 ada 8 parsel, 120m² daire', status: 'success' },
    { caseId: '2024/1242', debtor: 'Zeynep Arslan', detail: 'Tapu sorgusu devam ediyor', status: 'pending' },
  ]},
  4: { description: 'EGM üzerinden araç haciz şerhi', items: [
    { caseId: '2024/1238', debtor: 'Ali Öztürk', detail: '34 ABC 123 - Toyota Corolla 2020', status: 'success' },
    { caseId: '2024/1234', debtor: 'Ahmet Yılmaz', detail: '06 XY 456 - Honda Civic 2019', status: 'pending' },
  ]},
  5: { description: 'PTT posta çeki hesabına haciz', items: [
    { caseId: '2024/1237', debtor: 'Fatma Çelik', detail: 'Posta çeki hesabı sorgulandı - Bakiye: ₺1.240', status: 'success' },
  ]},
  6: { description: 'Borçlunun 3. kişilerdeki alacaklarına haciz', items: [
    { caseId: '2024/1236', debtor: 'Ayşe Demir', detail: 'İstanbul 5. İcra - 2023/4567 dosyasından alacak', status: 'success' },
    { caseId: '2024/1241', debtor: 'Elif Yıldız', detail: 'Ankara 2. İcra - 2024/891 dosyasından alacak', status: 'pending' },
  ]},
  7: { description: 'Bankalara İİK 89/1 haciz ihbarnamesi', items: [
    { caseId: '2024/1234', debtor: 'Ahmet Yılmaz', detail: 'Ziraat Bankası - Bloke: ₺12.450', status: 'success' },
    { caseId: '2024/1235', debtor: 'Mehmet Kaya', detail: 'Garanti BBVA - Bloke: ₺8.900', status: 'success' },
    { caseId: '2024/1238', debtor: 'Ali Öztürk', detail: 'İş Bankası - Hesap sorgusu bekleniyor', status: 'pending' },
  ]},
  8: { description: 'SGK\'ya borçlu işyeri ve sigorta bilgisi sorgusu', items: [
    { caseId: '2024/1234', debtor: 'Ahmet Yılmaz', detail: 'SGK No: 1234567890 - ABC Tekstil A.Ş.', status: 'success' },
    { caseId: '2024/1237', debtor: 'Fatma Çelik', detail: 'SGK No: 9876543210 - XYZ Gıda Ltd.', status: 'success' },
    { caseId: '2024/1240', debtor: 'Hasan Kara', detail: 'SGK kaydı bulunamadı', status: 'error' },
  ]},
  9: { description: 'İİK 21. maddeye göre tebligat', items: [
    { caseId: '2024/1242', debtor: 'Zeynep Arslan', detail: 'Adrese tebligat yapılamadı - 21/2 uygulandı', status: 'success' },
  ]},
  10: { description: 'Fazla tahsil edilen tutarların iadesi', items: [
    { caseId: '2024/1241', debtor: 'Elif Yıldız', detail: '₺2.340 reddiyat talebi oluşturuldu', status: 'pending' },
  ]},
  11: { description: 'UYAP evrak kutusu - gelen/giden evraklar', items: [
    { caseId: '2024/1234', debtor: 'Ahmet Yılmaz', detail: 'Ödeme emri tebliğ şerhi geldi', status: 'success' },
    { caseId: '2024/1236', debtor: 'Ayşe Demir', detail: 'İtiraz dilekçesi geldi', status: 'error' },
    { caseId: '2024/1238', debtor: 'Ali Öztürk', detail: 'Haciz tutanağı geldi', status: 'success' },
  ]},
};

const postaLogs = [
  { id: 1, caseId: '2024/1234', foyNo: 'Y101', court: 'ADANA 11.', recipient: 'Ali BORÇLU', type: 'B1: Y184 - 103 Davetiyesi', status: 'Teslim', date: '21.04.2018' },
  { id: 2, caseId: '2024/1235', foyNo: 'ÖZLEM', court: '122773 İZMİR 6.', recipient: 'Ali BORÇLU', type: 'B1: Y184 - 103 Davetiyesi', status: 'Derdest', date: '21.04.2018' },
  { id: 3, caseId: '2024/1236', foyNo: 'ÖZLEM', court: '518', recipient: 'Ali BORÇLU', type: '7 Örnek Ödeme Emri', status: 'Derdest', date: '21.04.2018' },
  { id: 4, caseId: '2024/1237', foyNo: 'ÖZLEM', court: '565 KARŞIYAKA 3.', recipient: 'CENGİZ TERZIOĞLU', type: '7 Örnek Ödeme Emri', status: 'Derdest', date: '03.08.2018' },
  { id: 5, caseId: '2024/1238', foyNo: 'ÖZLEM', court: '546', recipient: 'Ali BORÇLU', type: '7 Örnek Ödeme Emri', status: 'Derdest', date: '24.01.2019' },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<'uyap' | 'sms' | 'posta'>('uyap');
  const [showAllBuyapar, setShowAllBuyapar] = useState(false);
  const [selectedAction, setSelectedAction] = useState<typeof buyaparActions[0] | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResults, setActionResults] = useState<typeof buyaparMockResults[1] | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncTime, setSyncTime] = useState('5 dk önce');
  const [smsLoading, setSmsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSync = async () => {
    setSyncLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncLoading(false);
    setSyncTime('Az önce');
    showToast('UYAP senkronizasyonu tamamlandı - 156 sorgu güncellendi');
  };

  const handleBulkSMS = async () => {
    setSmsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSmsLoading(false);
    showToast('12 borçluya toplu SMS gönderildi - Kalan kredi: 2,438');
  };

  const handleActionClick = (action: typeof buyaparActions[0]) => {
    setSelectedAction(action);
    setActionLoading(true);
    setActionResults(null);
    setTimeout(() => {
      setActionResults(buyaparMockResults[action.id] || { description: 'İşlem sonuçları', items: [] });
      setActionLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Entegrasyon Merkezi" subtitle="UYAP, Buyapar ve SMS entegrasyonları" />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Connection Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Link2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">UYAP Bağlantısı</h3>
                  <p className="text-sm text-slate-500">Ulusal Yargı Ağı Projesi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Bağlı
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Son senkronizasyon: {syncTime}</span>
              </div>
              <button
                onClick={handleSync}
                disabled={syncLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncLoading ? 'animate-spin' : ''}`} />
                {syncLoading ? 'Senkronize ediliyor...' : 'Senkronize Et'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-100 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">SMS Servisi</h3>
                  <p className="text-sm text-slate-500">Toplu mesaj gönderimi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Aktif
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>Kalan kredi: 2,450 SMS</span>
              </div>
              <button
                onClick={handleBulkSMS}
                disabled={smsLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {smsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {smsLoading ? 'Gönderiliyor...' : 'Toplu SMS Gönder'}
              </button>
            </div>
          </div>

          {/* Posta Merkezi Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Mail className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Posta Merkezi</h3>
                  <p className="text-sm text-slate-500">PTT Tebligat Takibi</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Aktif
                </span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span>36 bekleyen tebligat</span>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                <RefreshCw className="w-4 h-4" />
                Güncelle
              </button>
            </div>
          </div>
        </div>

        {/* Buyapar Hızlı İşlemler */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Buyapar Hızlı İşlemler</h3>
                <p className="text-orange-100 text-sm">UYAP entegrasyonu ile hızlı işlem yapın</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
              Buyapar ile Entegre
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(showAllBuyapar ? buyaparActions : buyaparActions.slice(0, 6)).map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group cursor-pointer"
              >
                <div className={`p-2 ${action.color} rounded-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center leading-tight">{action.name}</span>
                {action.count && (
                  <span className="text-orange-200 text-xs">({action.count.toLocaleString()})</span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-orange-100 text-sm">Toplam 11 hızlı işlem türü</span>
            <button
              onClick={() => setShowAllBuyapar(!showAllBuyapar)}
              className="flex items-center gap-1 text-white text-sm font-medium hover:underline"
            >
              {showAllBuyapar ? 'Daralt' : 'Tümünü Gör'} <ChevronRight className={`w-4 h-4 transition-transform ${showAllBuyapar ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Bugünkü UYAP Sorgusu</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">156</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Başarılı İşlem</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">148</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Gönderilen SMS</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">89</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500">Hatalı İşlem</p>
            <p className="text-2xl font-bold text-red-600 mt-1">8</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('uyap')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  activeTab === 'uyap' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Link2 className="w-4 h-4" />
                UYAP Logları
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  activeTab === 'sms' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <MessageSquare className="w-4 h-4" />
                SMS Logları
              </button>
              <button
                onClick={() => setActiveTab('posta')}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  activeTab === 'posta' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Mail className="w-4 h-4" />
                Posta Merkezi
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  className="w-48 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* UYAP Logs */}
          {activeTab === 'uyap' && (
            <div className="divide-y divide-slate-100">
              {uyapLogs.map((log) => {
                const StatusIcon = statusConfig[log.status as keyof typeof statusConfig].icon;
                return (
                  <div key={log.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        'p-2 rounded-lg',
                        log.status === 'success' ? 'bg-emerald-100' : 
                        log.status === 'error' ? 'bg-red-100' : 'bg-amber-100'
                      )}>
                        <StatusIcon className={clsx(
                          'w-4 h-4',
                          log.status === 'success' ? 'text-emerald-600' : 
                          log.status === 'error' ? 'text-red-600' : 'text-amber-600'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{log.action}</span>
                          <span className="text-xs text-blue-600 font-medium">{log.caseId}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">{log.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        statusConfig[log.status as keyof typeof statusConfig].color
                      )}>
                        {statusConfig[log.status as keyof typeof statusConfig].label}
                      </span>
                      <span className="text-sm text-slate-500">{log.timestamp}</span>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SMS Logs */}
          {activeTab === 'sms' && (
            <div className="divide-y divide-slate-100">
              {smsLogs.map((log) => {
                const StatusIcon = statusConfig[log.status as keyof typeof statusConfig].icon;
                return (
                  <div key={log.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        'p-2 rounded-lg',
                        log.status === 'delivered' ? 'bg-emerald-100' : 
                        log.status === 'failed' ? 'bg-red-100' : 'bg-amber-100'
                      )}>
                        <StatusIcon className={clsx(
                          'w-4 h-4',
                          log.status === 'delivered' ? 'text-emerald-600' : 
                          log.status === 'failed' ? 'text-red-600' : 'text-amber-600'
                        )} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{log.message}</span>
                          <span className="text-xs text-blue-600 font-medium">{log.caseId}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5">Alıcı: {log.recipient}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        statusConfig[log.status as keyof typeof statusConfig].color
                      )}>
                        {statusConfig[log.status as keyof typeof statusConfig].label}
                      </span>
                      <span className="text-sm text-slate-500">{log.timestamp}</span>
                      {log.status === 'failed' && (
                        <button className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Posta Merkezi Logs */}
          {activeTab === 'posta' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Klasör</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Föy No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">İcra Dairesi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Gönderim Tarihi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Muhatap</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kamusu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {postaLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium',
                          log.status === 'Teslim' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        )}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.foyNo}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{log.caseId}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.court}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{log.date}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{log.recipient}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{log.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Warning Banner */}
        <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">UYAP bakım bildirimi</p>
            <p className="text-sm text-amber-700">16 Ocak 2024 saat 02:00-06:00 arası planlı bakım çalışması yapılacaktır.</p>
          </div>
        </div>
      </div>

      {/* Buyapar Action Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${selectedAction.color} rounded-lg`}>
                    <selectedAction.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedAction.name}</h3>
                    {actionResults && <p className="text-sm text-slate-500">{actionResults.description}</p>}
                  </div>
                </div>
                <button onClick={() => { setSelectedAction(null); setActionResults(null); }} className="p-1 hover:bg-orange-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {actionLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
                  <p className="text-sm text-slate-500">UYAP'a bağlanılıyor...</p>
                  <p className="text-xs text-slate-400 mt-1">Buyapar üzerinden işlem yürütülüyor</p>
                </div>
              ) : actionResults ? (
                <div className="space-y-3">
                  {actionResults.items.length > 0 ? actionResults.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-2 h-2 rounded-full',
                          item.status === 'success' && 'bg-emerald-500',
                          item.status === 'pending' && 'bg-amber-500',
                          item.status === 'error' && 'bg-red-500'
                        )} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-600">{item.caseId}</span>
                            <span className="text-sm text-slate-700">{item.debtor}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                      <span className={clsx(
                        'px-2.5 py-1 rounded-full text-xs font-medium',
                        item.status === 'success' && 'bg-emerald-100 text-emerald-700',
                        item.status === 'pending' && 'bg-amber-100 text-amber-700',
                        item.status === 'error' && 'bg-red-100 text-red-700'
                      )}>
                        {item.status === 'success' ? 'Tamamlandı' : item.status === 'pending' ? 'Beklemede' : 'Hata'}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-slate-400">
                      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Bu işlem türünde kayıt bulunmuyor.</p>
                    </div>
                  )}

                  {actionResults.items.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Toplam: <strong>{actionResults.items.length}</strong> işlem</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3.5 h-3.5" /> {actionResults.items.filter(i => i.status === 'success').length} başarılı</span>
                          <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3.5 h-3.5" /> {actionResults.items.filter(i => i.status === 'pending').length} beklemede</span>
                          {actionResults.items.filter(i => i.status === 'error').length > 0 && (
                            <span className="flex items-center gap-1 text-red-600"><XCircle className="w-3.5 h-3.5" /> {actionResults.items.filter(i => i.status === 'error').length} hata</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => { if (selectedAction) handleActionClick(selectedAction); }}
                className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Yeniden Çalıştır
              </button>
              <button
                onClick={() => { setSelectedAction(null); setActionResults(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
