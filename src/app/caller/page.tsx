'use client';

import Header from '@/components/Header';
import { useState } from 'react';
import clsx from 'clsx';
import {
  PhoneCall, PhoneOutgoing, Users, Volume2, RefreshCw, AlertTriangle,
  Clock, CheckCircle2, XCircle, Loader2, Sparkles, FileText, Banknote,
  Building2, Car, CreditCard, Scale, MessageSquare, Zap, ChevronRight,
  Copy, Edit3
} from 'lucide-react';

type CallTab = 'single' | 'bulk' | 'status';

interface CallCategory {
  id: string;
  label: string;
  icon: typeof PhoneCall;
  color: string;
  bgColor: string;
  templates: { id: string; label: string; tts: string }[];
}

const callCategories: CallCategory[] = [
  {
    id: 'odeme_hatirlatma',
    label: 'Ödeme Hatırlatma',
    icon: Banknote,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200',
    templates: [
      { id: 'odeme_genel', label: 'Genel Ödeme Hatırlatma', tts: 'Sayın borçlu, icra dosyanız kapsamında ödenmemiş borcunuz bulunmaktadır. En kısa sürede ödeme yapmanızı rica ederiz. Bilgi için icra dairenizle iletişime geçiniz.' },
      { id: 'odeme_son', label: 'Son Ödeme Uyarısı', tts: 'Sayın borçlu, icra dosyanızdaki borcunuzun son ödeme tarihi yaklaşmaktadır. Ödeme yapılmaması halinde yasal işlem başlatılacaktır. Acilen ödeme yapmanızı önemle hatırlatırız.' },
      { id: 'odeme_taksit', label: 'Taksit Hatırlatma', tts: 'Sayın borçlu, taahhüt ettiğiniz taksit ödemesinin vadesi gelmiştir. Taahhüdünüzü ihlal etmemeniz için ödemenizi bugün yapmanızı rica ederiz.' },
    ],
  },
  {
    id: 'haciz_bildirim',
    label: 'Haciz Bildirimi',
    icon: Scale,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    templates: [
      { id: 'haciz_banka', label: 'Banka Haczi Bildirimi', tts: 'Sayın borçlu, icra dosyanız kapsamında banka hesaplarınıza haciz konulmuştur. Detaylı bilgi için icra dairenizle iletişime geçiniz.' },
      { id: 'haciz_maas', label: 'Maaş Haczi Bildirimi', tts: 'Sayın borçlu, icra dosyanız kapsamında maaşınıza haciz uygulanacaktır. Borcunuzu ödemek için ivedilikle icra dairesiyle irtibata geçiniz.' },
      { id: 'haciz_arac', label: 'Araç Haczi Bildirimi', tts: 'Sayın borçlu, aracınıza icra dosyanız kapsamında haciz şerhi konulmuştur. Hacizin kaldırılması için borcunuzu ödemeniz gerekmektedir.' },
    ],
  },
  {
    id: 'taahut',
    label: 'Taahhüt İşlemleri',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    templates: [
      { id: 'taahut_davet', label: 'Taahhüt Daveti', tts: 'Sayın borçlu, icra dosyanız kapsamında ödeme taahhüdü vermek üzere icra dairesine davet edilmektesiniz. Randevunuz için icra dairesiyle iletişime geçiniz.' },
      { id: 'taahut_ihlal', label: 'Taahhüt İhlal Uyarısı', tts: 'Sayın borçlu, vermiş olduğunuz ödeme taahhüdünü ihlal ettiğiniz tespit edilmiştir. İİK madde 340 kapsamında yasal işlem başlatılacaktır.' },
      { id: 'taahut_onay', label: 'Taahhüt Onayı', tts: 'Sayın borçlu, ödeme taahhüdünüz onaylanmıştır. Belirlenen takvime uygun şekilde ödemelerinizi yapmanızı hatırlatırız.' },
    ],
  },
  {
    id: 'tebligat',
    label: 'Tebligat Bildirimi',
    icon: MessageSquare,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    templates: [
      { id: 'tebligat_odeme', label: 'Ödeme Emri Tebligatı', tts: 'Sayın borçlu, adınıza düzenlenen ödeme emri tebligatı gönderilmiştir. 7 gün içerisinde itiraz etmez veya ödeme yapmazsanız icra işlemleri başlatılacaktır.' },
      { id: 'tebligat_icra', label: 'İcra Emri Tebligatı', tts: 'Sayın borçlu, icra emri tebligatınız düzenlenmiştir. Mahkeme kararı gereğince borcunuzu ödemeniz gerekmektedir.' },
    ],
  },
  {
    id: 'bilgilendirme',
    label: 'Genel Bilgilendirme',
    icon: Volume2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    templates: [
      { id: 'bilgi_dosya', label: 'Dosya Durumu Bildirimi', tts: 'Sayın ilgili, icra dosyanızla ilgili güncelleme bulunmaktadır. Detaylı bilgi almak için ofisimizi arayınız veya icra dairesiyle iletişime geçiniz.' },
      { id: 'bilgi_kapanis', label: 'Dosya Kapanış Bildirimi', tts: 'Sayın ilgili, icra dosyanızdaki borcunuz ödenmiş olup dosyanız kapatılmıştır. İyi günler dileriz.' },
      { id: 'bilgi_randevu', label: 'Randevu Hatırlatma', tts: 'Sayın ilgili, icra dairesindeki randevunuzu hatırlatmak isteriz. Belirlenen tarih ve saatte hazır bulunmanızı rica ederiz.' },
    ],
  },
];

export default function CallerPage() {
  const [activeTab, setActiveTab] = useState<CallTab>('single');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [singlePhone, setSinglePhone] = useState('');
  const [singleTts, setSingleTts] = useState('');
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<{ success: boolean; callId?: string; message?: string; error?: string } | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const [bulkPhones, setBulkPhones] = useState('');
  const [bulkTts, setBulkTts] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: boolean; campaignId?: string; message?: string; error?: string } | null>(null);

  const [callId, setCallId] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{ success: boolean; status?: string; duration?: number; answeredAt?: string; endedAt?: string; error?: string } | null>(null);
  const [callHistory, setCallHistory] = useState<{ id: string; phone: string; status: string; time: string; duration: number; category?: string }[]>([
    { id: 'CALL-1001', phone: '0532****78', status: 'answered', time: '14:32', duration: 45, category: 'Ödeme Hatırlatma' },
    { id: 'CALL-1002', phone: '0545****23', status: 'no_answer', time: '14:15', duration: 0, category: 'Haciz Bildirimi' },
    { id: 'CALL-1003', phone: '0555****90', status: 'answered', time: '13:45', duration: 62, category: 'Taahhüt İşlemleri' },
    { id: 'CALL-1004', phone: '0542****45', status: 'busy', time: '13:20', duration: 0, category: 'Tebligat' },
    { id: 'CALL-1005', phone: '0533****67', status: 'answered', time: '12:50', duration: 38, category: 'Ödeme Hatırlatma' },
  ]);

  const selectTemplate = (categoryId: string, templateId: string) => {
    const cat = callCategories.find(c => c.id === categoryId);
    const tmpl = cat?.templates.find(t => t.id === templateId);
    if (tmpl) {
      setSingleTts(tmpl.tts);
      setBulkTts(tmpl.tts);
      setSelectedCategory(categoryId);
      setSelectedTemplate(templateId);
    }
  };

  const handleAiGenerate = async () => {
    if (!singleTts.trim() && !selectedTemplate) return;
    setAiGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    const base = singleTts || 'Sayın borçlu, icra dosyanız kapsamında borcunuz bulunmaktadır.';
    const enhanced = base.replace(/\.$/, '') + '. Lawara Hukuk Bürosu olarak tarafınıza bildirmek isteriz ki, yasal süreçler devam etmekte olup, en kısa sürede ödeme yapmanız lehinize olacaktır. Detaylı bilgi için 0212 XXX XX XX numaralı telefondan bize ulaşabilirsiniz.';
    setSingleTts(enhanced);
    setBulkTts(enhanced);
    setAiGenerating(false);
  };

  const doSingleCall = async () => {
    if (!singlePhone.trim() || !singleTts.trim()) {
      setSingleResult({ success: false, error: 'Telefon ve TTS mesajı zorunludur' });
      return;
    }
    setSingleLoading(true);
    setSingleResult(null);
    await new Promise(r => setTimeout(r, 1500));
    const mockCallId = `CALL-${1006 + Math.floor(Math.random() * 9000)}`;
    const catLabel = callCategories.find(c => c.id === selectedCategory)?.label || 'Genel';
    setSingleResult({ success: true, callId: mockCallId, message: `Arama başlatıldı: ${singlePhone}` });
    setCallHistory(prev => [{ id: mockCallId, phone: singlePhone.replace(/(.{4}).*(.{2})/, '$1****$2'), status: 'answered', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), duration: Math.floor(Math.random() * 60) + 15, category: catLabel }, ...prev]);
    setSingleLoading(false);
  };

  const doBulkCall = async () => {
    const phones = bulkPhones.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
    if (phones.length === 0 || !bulkTts.trim()) {
      setBulkResult({ success: false, error: 'Telefon listesi ve TTS mesajı zorunludur' });
      return;
    }
    setBulkLoading(true);
    setBulkResult(null);
    await new Promise(r => setTimeout(r, 2000));
    const campaignId = `CAMP-${Math.floor(Math.random() * 9000) + 1000}`;
    setBulkResult({ success: true, campaignId, message: `${phones.length} numara için kampanya başlatıldı` });
    setBulkLoading(false);
  };

  const doStatusCheck = async () => {
    if (!callId.trim()) {
      setStatusResult({ success: false, error: 'Call ID zorunludur' });
      return;
    }
    setStatusLoading(true);
    setStatusResult(null);
    await new Promise(r => setTimeout(r, 1000));
    const historyItem = callHistory.find(c => c.id === callId);
    if (historyItem) {
      const statusMap: Record<string, string> = { answered: 'Cevaplanmış', no_answer: 'Cevaplanmamış', busy: 'Meşgul' };
      setStatusResult({ success: true, status: statusMap[historyItem.status] || historyItem.status, duration: historyItem.duration, answeredAt: historyItem.duration > 0 ? `Bugün ${historyItem.time}` : undefined, endedAt: historyItem.duration > 0 ? `Bugün ${historyItem.time}` : undefined });
    } else {
      const statuses = ['Cevaplanmış', 'Cevaplanmamış', 'Meşgul', 'Devam Ediyor'];
      const s = statuses[Math.floor(Math.random() * statuses.length)];
      const dur = s === 'Cevaplanmış' ? Math.floor(Math.random() * 120) + 10 : 0;
      setStatusResult({ success: true, status: s, duration: dur, answeredAt: dur > 0 ? 'Bugün 14:32' : undefined, endedAt: dur > 0 ? 'Bugün 14:33' : undefined });
    }
    setStatusLoading(false);
  };

  const activeCategory = callCategories.find(c => c.id === selectedCategory);

  return (
    <div className="flex flex-col h-full">
      <Header title="İcra Caller" subtitle="AI destekli borçlu arama ve kampanya yönetimi" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'single' as CallTab, label: 'Tek Arama', icon: PhoneOutgoing },
              { id: 'bulk' as CallTab, label: 'Toplu Arama', icon: Users },
              { id: 'status' as CallTab, label: 'Durum Sorgu', icon: RefreshCw },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                  activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full"><CheckCircle2 className="w-3 h-3" /> PBX Aktif</div>
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full"><Sparkles className="w-3 h-3" /> AI Hazır</div>
          </div>
        </div>

        {/* Kategoriler - Tek ve Toplu Arama için */}
        {(activeTab === 'single' || activeTab === 'bulk') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-800">Arama Kategorisi Seçin</h3>
              <span className="text-xs text-slate-400 ml-1">Hazır şablonlarla hızlı arama başlatın</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {callCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={clsx(
                    'flex flex-col items-center gap-2 p-3 border rounded-xl transition-all text-center',
                    selectedCategory === cat.id
                      ? `${cat.bgColor} ring-2 ring-offset-1 shadow-sm`
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <cat.icon className={clsx('w-5 h-5', selectedCategory === cat.id ? cat.color : 'text-slate-400')} />
                  <span className={clsx('text-xs font-medium', selectedCategory === cat.id ? cat.color : 'text-slate-600')}>{cat.label}</span>
                  <span className="text-[10px] text-slate-400">{cat.templates.length} şablon</span>
                </button>
              ))}
            </div>

            {/* Seçili Kategori Şablonları */}
            {activeCategory && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-3">Şablon seçin veya düzenleyin:</p>
                <div className="space-y-2">
                  {activeCategory.templates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => selectTemplate(activeCategory.id, tmpl.id)}
                      className={clsx(
                        'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                        selectedTemplate === tmpl.id
                          ? `${activeCategory.bgColor} shadow-sm`
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <div className={clsx('p-1 rounded-lg mt-0.5', selectedTemplate === tmpl.id ? 'bg-white/60' : 'bg-slate-100')}>
                        <MessageSquare className={clsx('w-3.5 h-3.5', selectedTemplate === tmpl.id ? activeCategory.color : 'text-slate-400')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={clsx('text-xs font-semibold', selectedTemplate === tmpl.id ? 'text-slate-900' : 'text-slate-700')}>{tmpl.label}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{tmpl.tts}</p>
                      </div>
                      {selectedTemplate === tmpl.id && <CheckCircle2 className={clsx('w-4 h-4 mt-0.5 flex-shrink-0', activeCategory.color)} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TEK ARAMA */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-icra-light/15 rounded-lg">
                  <PhoneCall className="w-5 h-5 text-icra-mid" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Tek Arama Başlat</h3>
                  {activeCategory && <p className="text-xs text-slate-500">Kategori: {activeCategory.label}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
                  <input value={singlePhone} onChange={(e) => setSinglePhone(e.target.value)} placeholder="05xx xxx xx xx" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-700">TTS Mesajı</label>
                    <button
                      onClick={handleAiGenerate}
                      disabled={aiGenerating}
                      className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50"
                    >
                      {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI ile Zenginleştir
                    </button>
                  </div>
                  <textarea value={singleTts} onChange={(e) => setSingleTts(e.target.value)} placeholder="Şablon seçin veya mesajınızı yazın..." rows={5} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid" />
                  {singleTts && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-slate-400">{singleTts.length} karakter</span>
                      <button onClick={() => navigator.clipboard.writeText(singleTts)} className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"><Copy className="w-3 h-3" /> Kopyala</button>
                    </div>
                  )}
                </div>

                <button
                  onClick={doSingleCall}
                  disabled={singleLoading}
                  className={clsx('w-full py-3 bg-gradient-to-r from-icra-dark to-icra-mid text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2', singleLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-icra-darkest hover:to-icra-dark')}
                >
                  {singleLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Aranıyor...</> : <><PhoneOutgoing className="w-4 h-4" /> Aramayı Başlat</>}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-emerald-100 rounded-lg"><Volume2 className="w-5 h-5 text-emerald-600" /></div>
                <h3 className="text-lg font-semibold text-slate-900">Sonuç</h3>
              </div>
              {singleResult ? (
                <div className="space-y-4">
                  <div className={clsx('p-4 rounded-xl border', singleResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
                    <div className="flex items-center gap-2">
                      {singleResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                      <p className={clsx('text-sm font-medium', singleResult.success ? 'text-emerald-800' : 'text-red-800')}>
                        {singleResult.success ? 'Arama başlatıldı' : 'Arama başarısız'}
                      </p>
                    </div>
                    {singleResult.callId && <p className="text-sm text-slate-700 mt-2">Call ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{singleResult.callId}</span></p>}
                    {(singleResult.message || singleResult.error) && <p className="text-sm text-slate-600 mt-2">{singleResult.message || singleResult.error}</p>}
                  </div>
                  {!singleResult.success && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Konfigürasyon kontrolü</p>
                        <p className="text-sm text-amber-700 mt-1">VERIMOR_API_ID, VERIMOR_API_KEY ve VERIMOR_CALLER_ID değerlerini .env.local içinde tanımlayın.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-52 flex flex-col items-center justify-center text-slate-400">
                  <PhoneCall className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Kategori seçip aramayı başlatın</p>
                  <p className="text-xs mt-1">Sonuç burada görünecek</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOPLU ARAMA */}
        {activeTab === 'bulk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-violet-100 rounded-lg"><Users className="w-5 h-5 text-violet-600" /></div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Toplu Arama Başlat</h3>
                  {activeCategory && <p className="text-xs text-slate-500">Kategori: {activeCategory.label}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon Listesi</label>
                  <textarea value={bulkPhones} onChange={(e) => setBulkPhones(e.target.value)} placeholder={"05xx xxx xx xx\n05xx xxx xx xx\nveya virgülle ayırın"} rows={5} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid" />
                  <p className="text-xs text-slate-400 mt-1">{bulkPhones.split(/\n|,|;/).map(s => s.trim()).filter(Boolean).length} numara girildi</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-700">TTS Mesajı</label>
                    <button onClick={handleAiGenerate} disabled={aiGenerating} className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50">
                      {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI ile Zenginleştir
                    </button>
                  </div>
                  <textarea value={bulkTts} onChange={(e) => setBulkTts(e.target.value)} placeholder="Şablon seçin veya mesajınızı yazın..." rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid" />
                </div>
                <button onClick={doBulkCall} disabled={bulkLoading} className={clsx('w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2', bulkLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-violet-700 hover:to-purple-700')}>
                  {bulkLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Kampanya başlatılıyor...</> : <><Users className="w-4 h-4" /> Toplu Aramayı Başlat</>}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-emerald-100 rounded-lg"><Volume2 className="w-5 h-5 text-emerald-600" /></div>
                <h3 className="text-lg font-semibold text-slate-900">Sonuç</h3>
              </div>
              {bulkResult ? (
                <div className={clsx('p-4 rounded-xl border', bulkResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200')}>
                  <div className="flex items-center gap-2">
                    {bulkResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                    <p className={clsx('text-sm font-medium', bulkResult.success ? 'text-emerald-800' : 'text-red-800')}>{bulkResult.success ? 'Kampanya başlatıldı' : 'Kampanya başarısız'}</p>
                  </div>
                  {bulkResult.campaignId && <p className="text-sm text-slate-700 mt-2">Campaign ID: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{bulkResult.campaignId}</span></p>}
                  {(bulkResult.message || bulkResult.error) && <p className="text-sm text-slate-600 mt-2">{bulkResult.message || bulkResult.error}</p>}
                </div>
              ) : (
                <div className="h-52 flex flex-col items-center justify-center text-slate-400">
                  <Users className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Toplu arama başlatınca sonuç görünecek</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DURUM SORGU */}
        {activeTab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">Arama Durumu Sorgula</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Call ID</label>
                  <input value={callId} onChange={(e) => setCallId(e.target.value)} placeholder="CALL-XXXX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid" />
                </div>
                <button onClick={doStatusCheck} disabled={statusLoading} className={clsx('w-full py-3 bg-slate-900 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2', statusLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800')}>
                  {statusLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sorgulanıyor...</> : <><RefreshCw className="w-4 h-4" /> Durumu Sorgula</>}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">Sonuç</h3>
              {statusResult ? (
                <div className={clsx('p-4 rounded-xl border', statusResult.success ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200')}>
                  <p className="text-sm font-medium text-slate-900">{statusResult.success ? `Durum: ${statusResult.status}` : 'Sorgu başarısız'}</p>
                  {statusResult.duration !== undefined && <p className="text-sm text-slate-600 mt-2">Süre: {statusResult.duration}s</p>}
                  {statusResult.answeredAt && <p className="text-sm text-slate-600 mt-1">Cevaplandı: {statusResult.answeredAt}</p>}
                  {statusResult.endedAt && <p className="text-sm text-slate-600 mt-1">Bitti: {statusResult.endedAt}</p>}
                  {statusResult.error && <p className="text-sm text-red-700 mt-2">{statusResult.error}</p>}
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                  <RefreshCw className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Call ID girip sorgulayın</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Arama Geçmişi */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Arama Geçmişi</h3>
            <span className="text-xs text-slate-400">{callHistory.length} arama</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Call ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Saat</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Süre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {callHistory.map(call => (
                <tr key={call.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-mono text-icra-mid cursor-pointer hover:underline" onClick={() => { setCallId(call.id); setActiveTab('status'); }}>{call.id}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{call.phone}</td>
                  <td className="px-6 py-3">
                    {call.category && <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{call.category}</span>}
                  </td>
                  <td className="px-6 py-3">
                    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                      call.status === 'answered' && 'bg-emerald-100 text-emerald-700',
                      call.status === 'no_answer' && 'bg-amber-100 text-amber-700',
                      call.status === 'busy' && 'bg-red-100 text-red-700',
                    )}>
                      {call.status === 'answered' && <><CheckCircle2 className="w-3 h-3" /> Cevaplanmış</>}
                      {call.status === 'no_answer' && <><Clock className="w-3 h-3" /> Cevaplanmamış</>}
                      {call.status === 'busy' && <><XCircle className="w-3 h-3" /> Meşgul</>}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{call.time}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{call.duration > 0 ? `${call.duration}s` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
