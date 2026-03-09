'use client';

import Header from '@/components/Header';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart,
  Calendar,
  FileText,
  ArrowRight,
  Percent,
  HandCoins,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Plus,
  X,
  Download
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface CommitmentItem {
  id: number;
  caseId: string;
  debtor: string;
  totalAmount: number;
  installmentCount: number;
  paidCount: number;
  status: string;
  nextPaymentDate: string | null;
  nextPaymentAmount: number | null;
}

interface TransactionItem {
  id: number;
  caseId: number;
  type: string;
  amount: number;
  description: string;
  date: string;
}

interface FinanceStats {
  totalIncome: number;
  totalExpense: number;
  totalPortfolio: number;
  collectionRate: number;
  totalCases: number;
}

interface CommitmentStats {
  total: number;
  active: number;
  completed: number;
  violated: number;
}

interface CaseLookup {
  id: number;
  caseNumber: string;
  debtor: { firstName: string; lastName: string };
  totalAmount: number;
}

const interestRates = [
  { period: '2025 Ocak', legal: 24, default: 36 },
  { period: '2024 Aralık', legal: 24, default: 36 },
  { period: '2024 Kasım', legal: 24, default: 36 },
  { period: '2024 Ekim', legal: 19, default: 28.5 },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'calculator' | 'transactions' | 'commitments'>('overview');
  const [calcPrincipal, setCalcPrincipal] = useState('100000');
  const [calcRate, setCalcRate] = useState('24');
  const [calcDays, setCalcDays] = useState('365');
  const [calcResult, setCalcResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [financeStats, setFinanceStats] = useState<FinanceStats | null>(null);
  const [commitmentStats, setCommitmentStats] = useState<CommitmentStats | null>(null);
  const [commitmentList, setCommitmentList] = useState<CommitmentItem[]>([]);
  const [transactionList, setTransactionList] = useState<TransactionItem[]>([]);
  const [showNewCommitment, setShowNewCommitment] = useState(false);
  const [cases, setCases] = useState<CaseLookup[]>([]);
  const [newForm, setNewForm] = useState({ caseId: '', totalAmount: '', installmentCount: '', startDate: '', source: 'manual' as 'manual' | 'uyap', document: null as File | null });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showViolationReport, setShowViolationReport] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftTarget, setDraftTarget] = useState<CommitmentItem | null>(null);
  const [draftType, setDraftType] = useState<string>('');
  const [draftGenerating, setDraftGenerating] = useState(false);
  const [draftContent, setDraftContent] = useState<string>('');
  const [draftReady, setDraftReady] = useState(false);

  const reportTypes = [
    { id: 'ihtarname', label: 'İhtarname', desc: 'Borçluya ödeme yapması için resmi uyarı', icon: '📄', color: 'bg-amber-50 border-amber-200 text-amber-800' },
    { id: 'dava_dilekce', label: 'Taahhüdü İhlal Dava Dilekçesi', desc: 'İİK m.340 kapsamında ceza davası dilekçesi', icon: '⚖️', color: 'bg-red-50 border-red-200 text-red-800' },
    { id: 'haciz_talebi', label: 'Haciz Talebi', desc: 'Borçlunun mal varlığına haciz konulması talebi', icon: '🏛️', color: 'bg-icra-light/10 border-icra-light/30 text-icra-dark' },
    { id: 'maas_haczi', label: 'Maaş Haczi Müzekkeresi', desc: 'Borçlunun maaşından kesinti yapılması', icon: '💰', color: 'bg-purple-50 border-purple-200 text-purple-800' },
    { id: 'mal_beyan', label: 'Mal Beyanında Bulunma Talebi', desc: 'Borçlunun mal varlığını beyan etmesi talebi', icon: '📋', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
    { id: 'ozet_rapor', label: 'İhlal Özet Raporu', desc: 'Tüm ihlallerin detaylı özet raporu', icon: '📊', color: 'bg-slate-50 border-slate-200 text-slate-800' },
  ];

  const generateDraft = (type: string, commitment: CommitmentItem) => {
    const kalanBorc = commitment.totalAmount - (commitment.totalAmount / commitment.installmentCount) * commitment.paidCount;
    const today = new Date().toLocaleDateString('tr-TR');
    const taksitTutar = commitment.totalAmount / commitment.installmentCount;

    const drafts: Record<string, string> = {
      ihtarname: `İHTARNAME

Tarih: ${today}
İhtar Eden: Lawara Hukuk Bürosu
Muhatap: ${commitment.debtor}
Konu: Taahhüt İhlali Nedeniyle İhtar

Sayın ${commitment.debtor},

${commitment.caseId} sayılı icra dosyası kapsamında, ${formatCurrency(commitment.totalAmount)} tutarındaki borcunuz için ${commitment.installmentCount} taksit halinde ödeme taahhüdünde bulunmuş olmanıza rağmen, bugüne kadar yalnızca ${commitment.paidCount} taksit (${formatCurrency(taksitTutar * commitment.paidCount)}) ödenmiş olup, kalan ${formatCurrency(kalanBorc)} tutarındaki borcunuz ödenmemiştir.

İşbu ihtarname ile;

1. Kalan ${formatCurrency(kalanBorc)} tutarındaki borcunuzun 7 (yedi) gün içinde tarafımıza ödenmesi,
2. Aksi takdirde İİK m.340 kapsamında taahhüdü ihlal davası açılacağı,
3. Ayrıca haciz işlemlerinin başlatılacağı,

hususlarını ihtar ederiz.

Saygılarımızla,
Lawara Hukuk Bürosu
Av. Talip Furkan Doğan`,

      dava_dilekce: `CEZA MAHKEMESİ SAYIN HAKİMLİĞİ'NE

DAVACI (ŞİKAYETÇİ): Lawara Hukuk Bürosu
VEKİLİ: Av. Talip Furkan Doğan
SANIK: ${commitment.debtor}
SUÇ: Taahhüdü İhlal (İİK m.340)
TARİH: ${today}

AÇIKLAMALAR:

1. Sanık ${commitment.debtor}, ${commitment.caseId} sayılı icra dosyasında ${formatCurrency(commitment.totalAmount)} tutarındaki borcu için ${commitment.installmentCount} taksit halinde ödeme taahhüdünde bulunmuştur.

2. Taahhüt gereği ${commitment.paidCount} taksit ödenmiş, ancak sonraki taksitler ödenmeyerek taahhüt ihlal edilmiştir.

3. Kalan borç tutarı: ${formatCurrency(kalanBorc)}

4. İİK m.340 uyarınca: "111 inci madde mucibince veya alacaklının muvafakati ile icra dairesinde kararlaştırılan borcu ödeme şartını, makbul bir sebep olmaksızın ihlal eden borçlunun, alacaklının şikâyeti üzerine, üç aya kadar tazyik hapsine karar verilir."

HUKUKİ SEBEPLER: İİK m.340, İİK m.111

SONUÇ VE TALEP:
Yukarıda açıklanan nedenlerle, sanık ${commitment.debtor}'ın İİK m.340 gereğince 3 aya kadar tazyik hapsi ile cezalandırılmasına karar verilmesini saygıyla talep ederiz. ${today}

Av. Talip Furkan Doğan`,

      haciz_talebi: `İCRA MÜDÜRLÜĞÜ'NE

Dosya No: ${commitment.caseId}
Tarih: ${today}

TALEP EDEN (ALACAKLI) VEKİLİ: Av. Talip Furkan Doğan
BORÇLU: ${commitment.debtor}

KONU: Haciz Talebi

AÇIKLAMALAR:

Yukarıda esas numarası yazılı dosyamızda borçlu ${commitment.debtor} aleyhine başlatılan icra takibinde;

- Toplam borç: ${formatCurrency(commitment.totalAmount)}
- Ödenen tutar: ${formatCurrency(taksitTutar * commitment.paidCount)}
- Kalan borç: ${formatCurrency(kalanBorc)}
- Taahhüt durumu: İHLAL EDİLMİŞ (${commitment.paidCount}/${commitment.installmentCount} taksit)

Borçlunun taahhüdünü ihlal etmesi nedeniyle;

1. Borçlunun menkul ve gayrimenkul malları üzerine HACİZ konulmasını,
2. Borçlunun banka hesaplarına bloke konulmasını,
3. Borçlunun araçlarına yakalama şerhi konulmasını,

talep ederiz.

Av. Talip Furkan Doğan`,

      maas_haczi: `İCRA MÜDÜRLÜĞÜ'NE

Dosya No: ${commitment.caseId}
Tarih: ${today}

KONU: Maaş Haczi Müzekkeresi Talebi

Borçlu ${commitment.debtor}'ın ${commitment.caseId} sayılı dosyamızdaki ${formatCurrency(kalanBorc)} tutarındaki borcunun tahsili amacıyla;

Borçlunun çalıştığı işyerinden almakta olduğu maaş ve ücretinin 1/4'ünün (İİK m.83 gereği) her ay düzenli olarak kesilmek suretiyle dosyamıza gönderilmesi için MAAŞ HACZİ MÜZEKKERESİ yazılmasını talep ederiz.

BORÇ DETAYI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Toplam Taahhüt : ${formatCurrency(commitment.totalAmount)}
Ödenen         : ${formatCurrency(taksitTutar * commitment.paidCount)} (${commitment.paidCount} taksit)
Kalan Borç     : ${formatCurrency(kalanBorc)}
Taahhüt Durumu : İHLAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Av. Talip Furkan Doğan`,

      mal_beyan: `İCRA MÜDÜRLÜĞÜ'NE

Dosya No: ${commitment.caseId}
Tarih: ${today}

KONU: Borçluya Mal Beyanında Bulunması İçin Davetiye Gönderilmesi Talebi

Borçlu ${commitment.debtor}'ın ${commitment.caseId} sayılı dosyamızda ${formatCurrency(kalanBorc)} tutarındaki borcunu ödememesi ve taahhüdünü ihlal etmesi nedeniyle;

İİK m.74 gereğince borçluya MAL BEYANINDA BULUNMASI için davetiye gönderilmesini,

Mal beyanında bulunmaması halinde İİK m.76 gereğince hapisle tazyik edilmesini talep ederiz.

NOT: Borçlu ${commitment.installmentCount} taksitlik taahhüdün yalnızca ${commitment.paidCount} taksitini ödemiştir.

Av. Talip Furkan Doğan`,

      ozet_rapor: `İHLAL ÖZET RAPORU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rapor Tarihi: ${today}
Hazırlayan: Lawara Hukuk Bürosu

DOSYA BİLGİLERİ:
• Dosya No      : ${commitment.caseId}
• Borçlu        : ${commitment.debtor}
• Toplam Tutar  : ${formatCurrency(commitment.totalAmount)}
• Taksit Sayısı : ${commitment.installmentCount}
• Taksit Tutarı : ${formatCurrency(taksitTutar)}

ÖDEME DURUMU:
• Ödenen Taksit  : ${commitment.paidCount} adet
• Ödenen Tutar   : ${formatCurrency(taksitTutar * commitment.paidCount)}
• Kalan Taksit   : ${commitment.installmentCount - commitment.paidCount} adet
• Kalan Borç     : ${formatCurrency(kalanBorc)}
• Ödeme Oranı    : %${Math.round((commitment.paidCount / commitment.installmentCount) * 100)}

İHLAL DETAYI:
• Durum          : TAAHHÜT İHLAL EDİLMİŞ
• İhlal Tarihi   : Son ödeme tarihi geçmiş
• Gecikme Süresi : Belirsiz

ÖNERİLEN HUKUKİ İŞLEMLER:
1. ✉️  İhtarname gönderilmesi (7 gün süre)
2. ⚖️  Taahhüdü ihlal davası (İİK m.340)
3. 🏛️  Haciz işlemlerinin başlatılması
4. 💰  Maaş haczi müzekkeresi
5. 📋  Mal beyanı talebi

RİSK DEĞERLENDİRMESİ:
${'█'.repeat(Math.round((1 - commitment.paidCount / commitment.installmentCount) * 10))}${'░'.repeat(Math.round((commitment.paidCount / commitment.installmentCount) * 10))} ${Math.round((1 - commitment.paidCount / commitment.installmentCount) * 100)}% Risk

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bu rapor Lawara sistemi tarafından otomatik oluşturulmuştur.`,
    };
    return drafts[type] || 'Rapor türü bulunamadı.';
  };

  const handleGenerateDraft = async (type: string) => {
    if (!draftTarget) return;
    setDraftType(type);
    setDraftGenerating(true);
    setDraftReady(false);
    setDraftContent('');
    // Simulate generation delay
    await new Promise(r => setTimeout(r, 1500));
    const content = generateDraft(type, draftTarget);
    setDraftContent(content);
    setDraftGenerating(false);
    setDraftReady(true);
  };

  const handleDownloadDraft = (format: 'pdf' | 'word' | 'udf') => {
    if (!draftContent || !draftTarget) return;
    const fileName = `${draftTarget.caseId.replace('/', '-')}_${draftType}_${new Date().toISOString().slice(0, 10)}`;
    const mimeTypes = { pdf: 'application/pdf', word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', udf: 'application/octet-stream' };
    const extensions = { pdf: '.pdf', word: '.docx', udf: '.udf' };
    const blob = new Blob([draftContent], { type: mimeTypes[format] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}${extensions[format]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDraft = () => {
    if (!draftContent) return;
    navigator.clipboard.writeText(draftContent);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [finRes, comRes] = await Promise.all([
          fetch('/api/finance'),
          fetch('/api/commitments'),
        ]);
        const finJson = await finRes.json();
        const comJson = await comRes.json();
        setFinanceStats(finJson.stats || null);
        setCommitmentStats(finJson.commitmentStats || comJson.stats || null);
        setTransactionList(finJson.transactions || []);
        setCommitmentList(comJson.data || []);
      } catch (err) {
        console.error('Finance fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openNewCommitment = async () => {
    setShowNewCommitment(true);
    setCreateError('');
    if (cases.length === 0) {
      try {
        const res = await fetch('/api/cases?pageSize=100');
        const json = await res.json();
        setCases((json.data || []).map((c: { id: number; caseNumber: string; debtor: { firstName: string; lastName: string }; totalAmount: number }) => ({
          id: c.id, caseNumber: c.caseNumber, debtor: c.debtor, totalAmount: c.totalAmount,
        })));
      } catch (err) {
        console.error('Cases fetch error:', err);
      }
    }
  };

  const handleCreateCommitment = async () => {
    if (!newForm.caseId || !newForm.totalAmount || !newForm.installmentCount) {
      setCreateError('Dosya, tutar ve taksit sayısı zorunludur');
      return;
    }
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/commitments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      const json = await res.json();
      if (json.success) {
        setCommitmentList(prev => [json.data, ...prev]);
        if (commitmentStats) {
          setCommitmentStats({ ...commitmentStats, total: commitmentStats.total + 1, active: commitmentStats.active + 1 });
        }
        setNewForm({ caseId: '', totalAmount: '', installmentCount: '', startDate: '', source: 'manual', document: null });
        setShowNewCommitment(false);
      } else {
        setCreateError(json.error || 'Taahhüt oluşturulamadı');
      }
    } catch (err) {
      console.error('Create commitment error:', err);
      setCreateError('Bağlantı hatası');
    } finally {
      setCreating(false);
    }
  };

  const calculateInterest = () => {
    const principal = parseFloat(calcPrincipal) || 0;
    const rate = parseFloat(calcRate) || 0;
    const days = parseFloat(calcDays) || 0;
    const interest = (principal * rate * days) / (365 * 100);
    setCalcResult(interest);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('tr-TR');

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1_000_000) return `₺${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₺${(amount / 1_000).toFixed(0)}K`;
    return formatCurrency(amount);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Finans" subtitle="Muhasebe ve faiz hesaplamaları" />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'overview' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Genel Bakış
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'calculator' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Faiz Hesaplama
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'transactions' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            İşlem Geçmişi
          </button>
          <button
            onClick={() => setActiveTab('commitments')}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'commitments' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Taahhüt Takibi
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-icra-mid" />
          </div>
        ) : (<>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Toplam Tahsilat</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrencyShort(financeStats?.totalIncome || 0)}</p>
                    <p className="text-sm text-emerald-600 mt-1">Gelir</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Toplam Portföy</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrencyShort(financeStats?.totalPortfolio || 0)}</p>
                    <p className="text-sm text-slate-500 mt-1">{financeStats?.totalCases || 0} dosya</p>
                  </div>
                  <div className="p-3 bg-icra-light/15 rounded-xl">
                    <DollarSign className="w-6 h-6 text-icra-mid" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Masraflar</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrencyShort(financeStats?.totalExpense || 0)}</p>
                    <p className="text-sm text-red-600 mt-1">Gider</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Tahsilat Oranı</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">%{financeStats?.collectionRate || 0}</p>
                    <p className="text-sm text-emerald-600 mt-1">{commitmentStats?.completed || 0} tamamlanan</p>
                  </div>
                  <div className="p-3 bg-violet-100 rounded-xl">
                    <PieChart className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts placeholder and Interest Rates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Aylık Tahsilat Grafiği</h3>
                <div className="h-64 flex items-end justify-between gap-2 px-4">
                  {[65, 45, 78, 52, 90, 68, 85, 72, 95, 80, 88, 92].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-gradient-to-t from-icra-dark to-icra-mid rounded-t-lg transition-all hover:from-icra-mid hover:to-icra-light"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-slate-500">{['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Güncel Faiz Oranları</h3>
                <div className="space-y-3">
                  {interestRates.map((rate, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm font-medium text-slate-700">{rate.period}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Yasal</p>
                          <p className="text-sm font-semibold text-icra-mid">%{rate.legal}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Temerrüt</p>
                          <p className="text-sm font-semibold text-amber-600">%{rate.default}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-icra-light/15 rounded-lg">
                  <Calculator className="w-5 h-5 text-icra-mid" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Faiz Hesaplama</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ana Para (₺)</label>
                  <input
                    type="number"
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid focus:border-transparent"
                    placeholder="100,000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Faiz Oranı (%)</label>
                  <input
                    type="number"
                    value={calcRate}
                    onChange={(e) => setCalcRate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid focus:border-transparent"
                    placeholder="24"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gün Sayısı</label>
                  <input
                    type="number"
                    value={calcDays}
                    onChange={(e) => setCalcDays(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid focus:border-transparent"
                    placeholder="365"
                  />
                </div>
                
                <button
                  onClick={calculateInterest}
                  className="w-full py-3 bg-gradient-to-r from-icra-dark to-icra-mid text-white font-medium rounded-xl hover:from-icra-darkest hover:to-icra-dark transition-all shadow-lg shadow-icra-mid/25"
                >
                  Hesapla
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Hesaplama Sonucu</h3>
              
              {calcResult !== null ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Ana Para</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(parseFloat(calcPrincipal) || 0)}</p>
                  </div>
                  
                  <div className="p-4 bg-icra-light/10 rounded-xl">
                    <p className="text-sm text-icra-mid">Hesaplanan Faiz</p>
                    <p className="text-xl font-bold text-icra-dark">{formatCurrency(calcResult)}</p>
                  </div>
                  
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <p className="text-sm text-emerald-600">Toplam Tutar</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatCurrency((parseFloat(calcPrincipal) || 0) + calcResult)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl">
                    <Percent className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-700">
                      {calcDays} gün için %{calcRate} faiz oranı uygulandı
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Hesaplama yapmak için değerleri girin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Son İşlemler</h3>
                <button className="text-sm text-icra-mid hover:text-icra-dark font-medium flex items-center gap-1">
                  Tümünü Gör <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {transactionList.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      'p-2 rounded-xl',
                      tx.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                    )}>
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{formatDate(tx.date)}</span>
                        {tx.caseId && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-icra-mid font-medium">{tx.caseId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className={clsx(
                    'text-sm font-semibold',
                    tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commitments Tab - Taahhüt Takibi */}
        {activeTab === 'commitments' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-icra-light/15 rounded-lg">
                    <HandCoins className="w-5 h-5 text-icra-mid" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Toplam Taahhüt</p>
                    <p className="text-lg font-bold text-slate-900">{commitmentStats?.total || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tamamlanan</p>
                    <p className="text-lg font-bold text-emerald-600">{commitmentStats?.completed || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Devam Eden</p>
                    <p className="text-lg font-bold text-amber-600">{commitmentStats?.active || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">İhlal Edilen</p>
                    <p className="text-lg font-bold text-red-600">{commitmentStats?.violated || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Commitments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HandCoins className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">Taahhüt Listesi</h3>
                  </div>
                  <button
                    onClick={openNewCommitment}
                    className="px-4 py-2 bg-gradient-to-r from-icra-dark to-icra-mid text-white text-sm font-medium rounded-lg hover:from-icra-darkest hover:to-icra-dark transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Yeni Taahhüt
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dosya No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Borçlu</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Taahhüt Tutarı</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Taksit</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sonraki Ödeme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commitmentList.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-icra-mid">{c.caseId}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{c.debtor}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">{formatCurrency(c.totalAmount)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={clsx(
                                  'h-full rounded-full',
                                  c.status === 'completed' ? 'bg-emerald-500' : 
                                  c.status === 'violated' ? 'bg-red-500' : 'bg-icra-mid'
                                )}
                                style={{ width: `${(c.paidCount / c.installmentCount) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500">{c.paidCount}/{c.installmentCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'px-2.5 py-1 rounded-full text-xs font-medium',
                            c.status === 'active' && 'bg-blue-100 text-blue-700',
                            c.status === 'completed' && 'bg-emerald-100 text-emerald-700',
                            c.status === 'violated' && 'bg-red-100 text-red-700'
                          )}>
                            {c.status === 'active' && 'Devam Ediyor'}
                            {c.status === 'completed' && 'Tamamlandı'}
                            {c.status === 'violated' && 'İhlal Edildi'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {c.nextPaymentDate ? (
                            <div>
                              <p className="text-sm text-slate-900">{formatDate(c.nextPaymentDate)}</p>
                              {c.nextPaymentAmount && <p className="text-xs text-slate-500">{formatCurrency(c.nextPaymentAmount)}</p>}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Violated Commitments Warning */}
            {(commitmentStats?.violated || 0) > 0 && (
              <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">İhlal Edilen Taahhütler</p>
                  <p className="text-sm text-red-700 mt-1">{commitmentStats?.violated} adet taahhüt ihlal edilmiş durumda. Taahhüdü ihlal davası açmak için raporlama yapabilirsiniz.</p>
                  <button
                    onClick={() => setShowViolationReport(true)}
                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-800 underline"
                  >
                    İhlal Raporunu Görüntüle
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        </>)}
      </div>

      {/* Violation Report Modal */}
      {showViolationReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-red-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900">İhlal Edilen Taahhütler Raporu</h3>
                    <p className="text-sm text-red-600">{commitmentList.filter(c => c.status === 'violated').length} adet ihlal tespit edildi</p>
                  </div>
                </div>
                <button onClick={() => setShowViolationReport(false)} className="p-1 hover:bg-red-100 rounded-lg">
                  <X className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {commitmentList.filter(c => c.status === 'violated').length > 0 ? (
                commitmentList.filter(c => c.status === 'violated').map((c) => (
                  <div key={c.id} className="border border-red-200 rounded-xl p-4 bg-red-50/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-red-800">{c.caseId}</span>
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">İhlal</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">Borçlu: <strong>{c.debtor}</strong></p>
                        <p className="text-sm text-slate-600 mt-0.5">Taahhüt Tutarı: <strong>{formatCurrency(c.totalAmount)}</strong></p>
                        <p className="text-sm text-slate-600">Taksit: {c.paidCount}/{c.installmentCount} ödendi</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-red-600 font-medium">Kalan Borç</p>
                        <p className="text-lg font-bold text-red-700">{formatCurrency(c.totalAmount - (c.totalAmount / c.installmentCount) * c.paidCount)}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-red-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(c.paidCount / c.installmentCount) * 100}%` }} />
                        </div>
                        <span className="text-xs text-red-600 font-medium">{Math.round((c.paidCount / c.installmentCount) * 100)}%</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-red-500">⚠ Son ödeme tarihi geçmiş. Taahhüdü ihlal davası açılabilir.</p>
                        <button
                          onClick={() => { setDraftTarget(c); setShowDraftModal(true); setDraftType(''); setDraftContent(''); setDraftReady(false); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Rapor Taslağı Oluştur
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
                  <p>İhlal edilen taahhüt bulunmuyor.</p>
                </div>
              )}

              {commitmentList.filter(c => c.status === 'violated').length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-amber-800 mb-2">Önerilen İşlemler</h4>
                  <ul className="space-y-1.5 text-sm text-amber-700">
                    <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />Borçluya ihtarname gönderilmesi</li>
                    <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />Taahhüdü ihlal davası açılması (IIK m.340)</li>
                    <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />Haciz işlemlerinin başlatılması</li>
                    <li className="flex items-start gap-2"><span className="mt-1 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />Maaş haczi müzekkeresi gönderilmesi</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowViolationReport(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Report Modal */}
      {showDraftModal && draftTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Rapor Taslağı Oluştur</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {draftTarget.caseId} - {draftTarget.debtor} | Kalan: {formatCurrency(draftTarget.totalAmount - (draftTarget.totalAmount / draftTarget.installmentCount) * draftTarget.paidCount)}
                  </p>
                </div>
                <button onClick={() => { setShowDraftModal(false); setDraftTarget(null); }} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Step 1: Report Type Selection */}
              {!draftReady && !draftGenerating && (
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Rapor türünü seçin:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportTypes.map((rt) => (
                      <button
                        key={rt.id}
                        onClick={() => handleGenerateDraft(rt.id)}
                        className={clsx(
                          'flex items-start gap-3 p-4 border rounded-xl text-left transition-all hover:shadow-md hover:scale-[1.01]',
                          rt.color
                        )}
                      >
                        <span className="text-2xl mt-0.5">{rt.icon}</span>
                        <div>
                          <p className="text-sm font-semibold">{rt.label}</p>
                          <p className="text-xs mt-0.5 opacity-75">{rt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Generating */}
              {draftGenerating && (
                <div className="p-12 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
                    <FileText className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-4">Rapor taslağı oluşturuluyor...</p>
                  <p className="text-xs text-slate-400 mt-1">{reportTypes.find(r => r.id === draftType)?.label}</p>
                </div>
              )}

              {/* Step 3: Draft Ready */}
              {draftReady && draftContent && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-700">Taslak hazır!</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {reportTypes.find(r => r.id === draftType)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyDraft}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Kopyala
                      </button>
                      <button
                        onClick={() => handleDownloadDraft('pdf')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                      <button
                        onClick={() => handleDownloadDraft('word')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Word
                      </button>
                      <button
                        onClick={() => handleDownloadDraft('udf')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        UDF
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-sm text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[45vh] overflow-y-auto">
                    {draftContent}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => { setDraftType(''); setDraftContent(''); setDraftReady(false); }}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      Farklı Tür Seç
                    </button>
                    <button
                      onClick={() => handleGenerateDraft(draftType)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                      <Loader2 className="w-4 h-4" />
                      Yeniden Oluştur
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setShowDraftModal(false); setDraftTarget(null); }}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Commitment Modal */}
      {showNewCommitment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Yeni Taahhüt Ekle</h3>
                <button onClick={() => setShowNewCommitment(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{createError}</div>
              )}
              {/* Kaynak Seçimi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Kaynak</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewForm(prev => ({ ...prev, source: 'manual' }))}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all',
                      newForm.source === 'manual'
                        ? 'bg-icra-mid text-white border-icra-mid'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    Manuel Giriş
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewForm(prev => ({ ...prev, source: 'uyap' }))}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-xl text-sm font-medium border transition-all',
                      newForm.source === 'uyap'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    UYAP Belgesi Yükle
                  </button>
                </div>
              </div>
              {/* Belge Yükleme (UYAP seçiliyse) */}
              {newForm.source === 'uyap' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UYAP Belgesi / Dosya Yükle</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.udf,.xml,.jpg,.jpeg,.png"
                      onChange={(e) => setNewForm(prev => ({ ...prev, document: e.target.files?.[0] || null }))}
                      className="hidden"
                      id="commitment-file"
                    />
                    <label htmlFor="commitment-file" className="cursor-pointer">
                      {newForm.document ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-orange-600 font-medium">
                          <FileText className="w-5 h-5" />
                          {newForm.document.name}
                          <button type="button" onClick={(e) => { e.preventDefault(); setNewForm(prev => ({ ...prev, document: null })); }} className="ml-2 p-1 hover:bg-red-50 rounded">
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Download className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                          <p className="text-sm text-slate-500">Belge yüklemek için tıklayın</p>
                          <p className="text-xs text-slate-400 mt-0.5">PDF, Word, UDF, XML, Resim</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosya *</label>
                <select
                  value={newForm.caseId}
                  onChange={(e) => {
                    const selected = cases.find(c => c.id.toString() === e.target.value);
                    setNewForm(prev => ({
                      ...prev,
                      caseId: e.target.value,
                      totalAmount: selected ? selected.totalAmount.toString() : prev.totalAmount,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                >
                  <option value="">Dosya seçin...</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.debtor.firstName} {c.debtor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Taahhüt Tutarı (₺) *</label>
                <input
                  type="number"
                  value={newForm.totalAmount}
                  onChange={(e) => setNewForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Taksit Sayısı *</label>
                <input
                  type="number"
                  value={newForm.installmentCount}
                  onChange={(e) => setNewForm(prev => ({ ...prev, installmentCount: e.target.value }))}
                  placeholder="6"
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={newForm.startDate}
                  onChange={(e) => setNewForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                />
              </div>
              {newForm.totalAmount && newForm.installmentCount && (
                <div className="p-3 bg-icra-light/10 rounded-xl">
                  <p className="text-sm text-icra-dark">
                    Taksit tutarı: <strong>{formatCurrency(parseFloat(newForm.totalAmount) / parseInt(newForm.installmentCount))}</strong> x {newForm.installmentCount} taksit
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowNewCommitment(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreateCommitment}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Taahhüt Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
