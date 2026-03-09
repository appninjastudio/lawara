'use client';

import Header from '@/components/Header';
import {
  ArrowLeft,
  User,
  Building2,
  Landmark,
  FileText,
  DollarSign,
  MessageSquare,
  Bell,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Plus,
  Shield,
  Car,
  Home,
  Banknote,
  Gavel,
  Scale,
  Download,
  FileCode,
  Eye,
  ChevronDown,
  ChevronUp,
  Send,
  ExternalLink,
  Copy,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import { useState, useEffect, use } from 'react';
import clsx from 'clsx';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CaseDetail {
  id: number;
  caseNumber: string;
  foyNumber: string | null;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  caseType: string;
  status: string;
  openDate: string;
  closeDate: string | null;
  createdAt: string;
  debtor: {
    id: number; firstName: string; lastName: string; tcNo: string;
    phone: string | null; email: string | null; address: string | null;
    city: string | null; district: string | null;
  };
  creditor: {
    id: number; name: string; type: string; taxNo?: string;
    phone: string | null; email: string | null; address: string | null;
  };
  court: { id: number; name: string; city: string; district: string };
  createdBy: { id: number; name: string; email: string };
  transactions: {
    id: number; type: string; amount: number; description: string;
    transactionDate: string;
  }[];
  commitments: {
    id: number; totalAmount: number; installmentCount: number;
    paidCount: number; status: string; startDate: string;
    nextPaymentDate: string | null; nextPaymentAmount: number | null;
    installments: {
      id: number; installmentNumber: number; amount: number;
      dueDate: string; paidDate: string | null; status: string;
    }[];
  }[];
  notes: {
    id: number; content: string; type: string; createdAt: string;
    user: { id: number; name: string };
  }[];
  notifications: {
    id: number; type: string; recipient: string; content: string;
    status: string; sentAt: string | null; pttBarcode: string | null;
    createdAt: string;
  }[];
  seizures: {
    id: number; type: string; status: string; createdAt: string;
    description: string; details: any;
  }[];
  lawsuits: {
    id: number; type: string; status: string; courtName: string;
    caseNumber: string; filingDate: string; nextHearingDate: string | null;
    subject: string; description: string; plaintiff: string; defendant: string;
    requestedPenalty: string | null; result?: string;
    hearings: { id: number; date: string; type: string; result: string; nextDate: string | null }[];
    documents: { id: number; name: string; date: string; type: string }[];
  }[];
  tebligats: {
    id: number; type: string; status: string; recipient: string;
    address: string; sentDate: string; deliveryDate: string | null;
    pttBarcode: string; deliveryMethod: string | null;
  }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Aktif', color: 'bg-icra-light/15 text-icra-dark', icon: Clock },
  pending: { label: 'Beklemede', color: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  closed: { label: 'Kapatıldı', color: 'bg-slate-100 text-slate-700', icon: XCircle },
  warning: { label: 'Dikkat', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const typeLabels: Record<string, string> = {
  ilamli: 'İlamlı', ilamsiz: 'İlamsız', kambiyo: 'Kambiyo',
};

const noteTypeConfig: Record<string, { label: string; color: string }> = {
  note: { label: 'Not', color: 'bg-icra-light/15 text-icra-dark' },
  warning: { label: 'Uyarı', color: 'bg-red-100 text-red-700' },
  reminder: { label: 'Hatırlatma', color: 'bg-amber-100 text-amber-700' },
};

const notifStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-700' },
  sent: { label: 'Gönderildi', color: 'bg-icra-light/15 text-icra-dark' },
  delivered: { label: 'Teslim Edildi', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Başarısız', color: 'bg-red-100 text-red-700' },
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'seizures' | 'lawsuits' | 'tebligat' | 'transactions' | 'commitments' | 'notes' | 'notifications' | 'uyap_xml'>('overview');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [addingNote, setAddingNote] = useState(false);
  const [expandedSeizure, setExpandedSeizure] = useState<number | null>(null);
  const [expandedLawsuit, setExpandedLawsuit] = useState<number | null>(null);
  const [xmlCopied, setXmlCopied] = useState(false);

  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(`/api/cases/${id}`);
        const json = await res.json();
        setCaseData(json.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCase();
  }, [id]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR');

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('tr-TR');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/cases/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, type: noteType }),
      });
      if (res.ok) {
        const json = await res.json();
        setCaseData(prev => prev ? {
          ...prev,
          notes: [json.data, ...prev.notes],
        } : prev);
        setNewNote('');
      }
    } catch (err) {
      console.error('Add note error:', err);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Dosya Detayı" subtitle="Yükleniyor..." />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-icra-mid animate-spin" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Dosya Detayı" subtitle="Dosya bulunamadı" />
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <FileText className="w-16 h-16 mb-4" />
          <p className="text-xl font-medium">Dosya bulunamadı</p>
          <a href="/cases" className="mt-4 text-icra-mid hover:underline">Dosya listesine dön</a>
        </div>
      </div>
    );
  }

  const sc = statusConfig[caseData.status] || statusConfig.active;
  const StatusIcon = sc.icon;
  const totalIncome = caseData.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = caseData.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  // ── Detaylı Gelir-Gider Hesaplama ──
  const anaPara = caseData.principalAmount;
  const isleyenFaiz = caseData.interestAmount;
  const takipOncesiMasraf = anaPara * 0.012;
  const vekaletUcreti = anaPara * 0.15;
  const basvuruHarci = 427.60;
  const vekalet_BasvuruHarci = 427.60;
  const pesinHarc = anaPara * 0.005;
  const tebligatGideri = (caseData.tebligats?.length || 1) * 187.00;
  const pttMasrafi = (caseData.tebligats?.length || 1) * 95.00;
  const bilirkisiUcreti = caseData.lawsuits?.length ? 8500 : 0;
  const kesfUcreti = caseData.seizures?.filter(s => s.type === 'property').length ? 12000 : 0;
  const ilanGideri = 0;
  const diger_masraflar = 350;
  const toplamTakipMasrafi = takipOncesiMasraf + basvuruHarci + vekalet_BasvuruHarci + pesinHarc + tebligatGideri + pttMasrafi + diger_masraflar;
  const toplamYargilamaMasrafi = bilirkisiUcreti + kesfUcreti + ilanGideri;
  const toplamAlacak = anaPara + isleyenFaiz + vekaletUcreti + toplamTakipMasrafi + toplamYargilamaMasrafi;
  const tahsilHarciOrani = 0.0455;
  const tahsilHarci = totalIncome * tahsilHarciOrani;
  const cezaeviYapiHarci = totalIncome * 0.02;
  const baroPayi = vekaletUcreti * 0.05;
  const kdvOrani = 0.20;
  const vekaletKDV = vekaletUcreti * kdvOrani;
  const toplamKesintiler = tahsilHarci + cezaeviYapiHarci + baroPayi + vekaletKDV;
  const tahsilEdilen = totalIncome;
  const kalanAnaPara = Math.max(0, anaPara - (tahsilEdilen * (anaPara / toplamAlacak)));
  const kalanFaiz = Math.max(0, isleyenFaiz - (tahsilEdilen * (isleyenFaiz / toplamAlacak)));
  const kalanToplam = Math.max(0, toplamAlacak - tahsilEdilen);
  const bugun = new Date();
  const acilisTarihi = new Date(caseData.openDate);
  const gecenGun = Math.floor((bugun.getTime() - acilisTarihi.getTime()) / (1000 * 60 * 60 * 24));
  const yillikFaizOrani = 0.24;
  const gunlukFaiz = (anaPara * yillikFaizOrani) / 365;

  const tabs = [
    { key: 'overview' as const, label: 'Genel Bakış', icon: FileText },
    { key: 'seizures' as const, label: `Hacizler (${caseData.seizures?.length || 0})`, icon: Shield },
    { key: 'lawsuits' as const, label: `Davalar (${caseData.lawsuits?.length || 0})`, icon: Gavel },
    { key: 'tebligat' as const, label: `Tebligat (${caseData.tebligats?.length || 0})`, icon: Send },
    { key: 'transactions' as const, label: `İşlemler (${caseData.transactions.length})`, icon: DollarSign },
    { key: 'commitments' as const, label: `Taahhütler (${caseData.commitments.length})`, icon: CreditCard },
    { key: 'notes' as const, label: `Notlar (${caseData.notes.length})`, icon: MessageSquare },
    { key: 'notifications' as const, label: `Bildirimler (${caseData.notifications.length})`, icon: Bell },
    { key: 'uyap_xml' as const, label: 'UYAP XML', icon: FileCode },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title={`Dosya ${caseData.caseNumber}`} subtitle={`${caseData.debtor.firstName} ${caseData.debtor.lastName} - ${caseData.creditor.name}`} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Back + Status Bar */}
        <div className="flex items-center justify-between">
          <a href="/cases" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Dosya Listesi
          </a>
          <div className="flex items-center gap-3">
            <a
              href={`/cases/${id}/foy`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-icra-dark to-icra-mid text-white rounded-xl text-sm font-medium hover:from-icra-darkest hover:to-icra-dark transition-all shadow-md shadow-icra-mid/25"
            >
              <Eye className="w-4 h-4" />
              Föy&apos;e Göz At
            </a>
            <a
              href={`/cases/${id}/foy/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-icra-mid to-icra-light text-white rounded-xl text-sm font-medium hover:from-icra-dark hover:to-icra-mid transition-all shadow-md shadow-icra-light/25"
            >
              <FileText className="w-4 h-4" />
              Föy Düzenle
            </a>
            <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', sc.color)}>
              <StatusIcon className="w-4 h-4" />
              {sc.label}
            </span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
              {typeLabels[caseData.caseType] || caseData.caseType}
            </span>
          </div>
        </div>

        {/* ══ 2-Column Layout: Left Tabs+Content + Right Financial Panel ══ */}
        <div className="flex gap-6 items-start">

        {/* ══════════ SOL PANEL: Tabs + Tab Content ══════════ */}
        <div className="flex-1 min-w-0 space-y-6">

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === tab.key
                    ? 'border-icra-mid text-icra-dark'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Borçlu */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg"><User className="w-5 h-5 text-red-600" /></div>
                <h3 className="text-lg font-semibold text-slate-900">Borçlu Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-slate-500">Ad Soyad</span><span className="text-sm font-medium">{caseData.debtor.firstName} {caseData.debtor.lastName}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500">TC No</span><span className="text-sm font-medium font-mono">{caseData.debtor.tcNo}</span></div>
                {caseData.debtor.phone && <div className="flex justify-between"><span className="text-sm text-slate-500"><Phone className="w-3.5 h-3.5 inline mr-1" />Telefon</span><span className="text-sm font-medium">{caseData.debtor.phone}</span></div>}
                {caseData.debtor.email && <div className="flex justify-between"><span className="text-sm text-slate-500"><Mail className="w-3.5 h-3.5 inline mr-1" />E-posta</span><span className="text-sm font-medium">{caseData.debtor.email}</span></div>}
                {caseData.debtor.address && <div className="flex justify-between"><span className="text-sm text-slate-500"><MapPin className="w-3.5 h-3.5 inline mr-1" />Adres</span><span className="text-sm font-medium text-right max-w-[60%]">{caseData.debtor.address}, {caseData.debtor.district}/{caseData.debtor.city}</span></div>}
              </div>
            </div>

            {/* Alacaklı */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-icra-light/15 rounded-lg"><Building2 className="w-5 h-5 text-icra-mid" /></div>
                <h3 className="text-lg font-semibold text-slate-900">Alacaklı Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-slate-500">Kurum/Kişi</span><span className="text-sm font-medium">{caseData.creditor.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500">Tür</span><span className="text-sm font-medium capitalize">{caseData.creditor.type}</span></div>
                {caseData.creditor.phone && <div className="flex justify-between"><span className="text-sm text-slate-500">Telefon</span><span className="text-sm font-medium">{caseData.creditor.phone}</span></div>}
              </div>
            </div>

            {/* Mahkeme */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg"><Landmark className="w-5 h-5 text-purple-600" /></div>
                <h3 className="text-lg font-semibold text-slate-900">İcra Dairesi</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-slate-500">Daire</span><span className="text-sm font-medium">{caseData.court.name}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500">Şehir</span><span className="text-sm font-medium">{caseData.court.city} / {caseData.court.district}</span></div>
              </div>
            </div>

            {/* Dosya Bilgileri */}
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg"><Calendar className="w-5 h-5 text-emerald-600" /></div>
                <h3 className="text-lg font-semibold text-slate-900">Dosya Bilgileri</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-slate-500">Dosya No</span><span className="text-sm font-medium">{caseData.caseNumber}</span></div>
                {caseData.foyNumber && <div className="flex justify-between"><span className="text-sm text-slate-500">Föy No</span><span className="text-sm font-medium">{caseData.foyNumber}</span></div>}
                <div className="flex justify-between"><span className="text-sm text-slate-500">Açılış Tarihi</span><span className="text-sm font-medium">{formatDate(caseData.openDate)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-slate-500">Oluşturan</span><span className="text-sm font-medium">{caseData.createdBy.name}</span></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Gelir: {formatCurrency(totalIncome)}</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-medium">Gider: {formatCurrency(totalExpense)}</span>
                </div>
              </div>
            </div>
            {caseData.transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <DollarSign className="w-10 h-10 mx-auto mb-2" />
                <p>Henüz işlem yok</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tarih</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Açıklama</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tür</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseData.transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm text-slate-600">{formatDate(t.transactionDate)}</td>
                      <td className="px-6 py-3 text-sm text-slate-900">{t.description}</td>
                      <td className="px-6 py-3">
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>
                          {t.type === 'income' ? 'Gelir' : 'Gider'}
                        </span>
                      </td>
                      <td className={clsx('px-6 py-3 text-sm font-semibold text-right', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'commitments' && (
          <div className="space-y-4">
            {caseData.commitments.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 shadow-sm">
                <CreditCard className="w-10 h-10 mx-auto mb-2" />
                <p>Henüz taahhüt yok</p>
              </div>
            ) : caseData.commitments.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-900">{formatCurrency(c.totalAmount)} - {c.installmentCount} Taksit</h4>
                    <p className="text-sm text-slate-500">Başlangıç: {formatDate(c.startDate)}</p>
                  </div>
                  <span className={clsx('px-3 py-1 rounded-full text-xs font-medium',
                    c.status === 'active' ? 'bg-icra-light/15 text-icra-dark' :
                    c.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {c.status === 'active' ? 'Aktif' : c.status === 'completed' ? 'Tamamlandı' : 'İhlal'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                  <div className="bg-icra-mid h-2 rounded-full" style={{ width: `${(c.paidCount / c.installmentCount) * 100}%` }} />
                </div>
                <p className="text-xs text-slate-500 mb-4">{c.paidCount}/{c.installmentCount} taksit ödendi</p>
                {c.installments.length > 0 && (
                  <div className="space-y-2">
                    {c.installments.map(inst => (
                      <div key={inst.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={clsx('w-2 h-2 rounded-full',
                            inst.status === 'paid' ? 'bg-emerald-500' :
                            inst.status === 'overdue' ? 'bg-red-500' : 'bg-amber-500'
                          )} />
                          <span className="text-sm text-slate-600">Taksit {inst.installmentNumber}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-slate-500">{formatDate(inst.dueDate)}</span>
                          <span className="text-sm font-medium">{formatCurrency(inst.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {/* Add Note */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <select
                  value={noteType}
                  onChange={e => setNoteType(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                >
                  <option value="note">Not</option>
                  <option value="warning">Uyarı</option>
                  <option value="reminder">Hatırlatma</option>
                </select>
              </div>
              <div className="flex gap-3">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Yeni not ekle..."
                  rows={2}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-icra-mid"
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="px-4 py-2 bg-icra-mid text-white rounded-lg text-sm font-medium hover:bg-icra-dark disabled:opacity-50 transition-colors self-end"
                >
                  {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {caseData.notes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 shadow-sm">
                <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                <p>Henüz not yok</p>
              </div>
            ) : caseData.notes.map(note => (
              <div key={note.id} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', noteTypeConfig[note.type]?.color || 'bg-slate-100 text-slate-700')}>
                      {noteTypeConfig[note.type]?.label || note.type}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{note.user.name}</span>
                  </div>
                  <span className="text-xs text-slate-400">{formatDateTime(note.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600">{note.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {caseData.notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell className="w-10 h-10 mx-auto mb-2" />
                <p>Henüz bildirim yok</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tür</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Alıcı</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">İçerik</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caseData.notifications.map(n => (
                    <tr key={n.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium uppercase">{n.type}</span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600">{n.recipient}</td>
                      <td className="px-6 py-3 text-sm text-slate-900">{n.content}</td>
                      <td className="px-6 py-3">
                        <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', notifStatusConfig[n.status]?.color || 'bg-slate-100 text-slate-700')}>
                          {notifStatusConfig[n.status]?.label || n.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-500">{formatDateTime(n.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ═══════════════ HACİZLER TAB ═══════════════ */}
        {activeTab === 'seizures' && (
          <div className="space-y-4">
            {/* Haciz Özet Kartları */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { type: 'bank', label: 'Banka', icon: Banknote, color: 'bg-icra-light/15 text-icra-dark' },
                { type: 'vehicle', label: 'Araç', icon: Car, color: 'bg-cyan-100 text-cyan-700' },
                { type: 'property', label: 'Taşınmaz', icon: Home, color: 'bg-emerald-100 text-emerald-700' },
                { type: 'salary', label: 'Maaş', icon: Briefcase, color: 'bg-purple-100 text-purple-700' },
                { type: 'receivable', label: 'Alacak', icon: DollarSign, color: 'bg-amber-100 text-amber-700' },
              ].map(st => {
                const count = caseData.seizures?.filter(s => s.type === st.type).length || 0;
                return (
                  <div key={st.type} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
                    <div className={clsx('inline-flex p-2 rounded-lg mb-2', st.color)}><st.icon className="w-5 h-5" /></div>
                    <p className="text-2xl font-bold text-slate-900">{count}</p>
                    <p className="text-xs text-slate-500">{st.label} Haczi</p>
                  </div>
                );
              })}
            </div>

            {(!caseData.seizures || caseData.seizures.length === 0) ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 shadow-sm">
                <Shield className="w-10 h-10 mx-auto mb-2" />
                <p>Henüz haciz kaydı yok</p>
              </div>
            ) : caseData.seizures.map(seizure => {
              const isExpanded = expandedSeizure === seizure.id;
              const typeConfig: Record<string, { label: string; icon: typeof Shield; color: string }> = {
                bank: { label: 'Banka Haczi', icon: Banknote, color: 'bg-icra-light/15 text-icra-dark' },
                vehicle: { label: 'Araç Haczi', icon: Car, color: 'bg-cyan-100 text-cyan-700' },
                property: { label: 'Taşınmaz Haczi', icon: Home, color: 'bg-emerald-100 text-emerald-700' },
                salary: { label: 'Maaş Haczi', icon: Briefcase, color: 'bg-purple-100 text-purple-700' },
                receivable: { label: 'Alacak Haczi', icon: DollarSign, color: 'bg-amber-100 text-amber-700' },
              };
              const tc = typeConfig[seizure.type] || { label: seizure.type, icon: Shield, color: 'bg-slate-100 text-slate-700' };
              const SeizureIcon = tc.icon;
              const statusColor = seizure.status === 'active' ? 'bg-emerald-100 text-emerald-700' : seizure.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700';

              return (
                <div key={seizure.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedSeizure(isExpanded ? null : seizure.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx('p-2.5 rounded-xl', tc.color)}><SeizureIcon className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{seizure.description}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">{formatDate(seizure.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-medium', statusColor)}>
                        {seizure.status === 'active' ? 'Aktif' : seizure.status === 'pending' ? 'Beklemede' : seizure.status}
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                      {seizure.type === 'bank' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Banka</span><span className="text-sm font-medium">{seizure.details.bankName}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Hesap Türü</span><span className="text-sm font-medium">{seizure.details.accountType}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">IBAN</span><span className="text-sm font-medium font-mono text-xs">{seizure.details.iban}</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Bloke Tutar</span><span className={clsx('text-sm font-bold', seizure.details.blockedAmount > 0 ? 'text-emerald-600' : 'text-red-500')}>{formatCurrency(seizure.details.blockedAmount)}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Yanıt Tarihi</span><span className="text-sm font-medium">{seizure.details.responseDate ? formatDate(seizure.details.responseDate) : '-'}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Sonuç</span><span className={clsx('px-2 py-0.5 rounded text-xs font-medium', seizure.details.responseStatus === 'positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700')}>{seizure.details.responseStatus === 'positive' ? 'Olumlu' : 'Olumsuz'}</span></div>
                          </div>
                          {seizure.details.responseNote && <div className="col-span-full p-3 bg-blue-50 rounded-lg text-sm text-blue-800"><strong>Not:</strong> {seizure.details.responseNote}</div>}
                        </div>
                      )}
                      {seizure.type === 'vehicle' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Plaka</span><span className="text-sm font-bold">{seizure.details.plate}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Marka/Model</span><span className="text-sm font-medium">{seizure.details.brand} {seizure.details.model} ({seizure.details.year})</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Şasi No</span><span className="text-sm font-medium font-mono text-xs">{seizure.details.chassisNo}</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Motor No</span><span className="text-sm font-medium font-mono text-xs">{seizure.details.engineNo}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Tahmini Değer</span><span className="text-sm font-bold text-blue-600">{formatCurrency(seizure.details.estimatedValue)}</span></div>
                          </div>
                          {seizure.details.seizureNote && <div className="col-span-full p-3 bg-cyan-50 rounded-lg text-sm text-cyan-800"><strong>Not:</strong> {seizure.details.seizureNote}</div>}
                        </div>
                      )}
                      {seizure.type === 'property' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Adres</span><span className="text-sm font-medium text-right max-w-[65%]">{seizure.details.address}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Ada/Parsel</span><span className="text-sm font-medium">{seizure.details.parcel}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Alan</span><span className="text-sm font-medium">{seizure.details.area}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Tür</span><span className="text-sm font-medium">{seizure.details.propertyType}</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Tapu No</span><span className="text-sm font-medium font-mono">{seizure.details.tapuNo}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Tahmini Değer</span><span className="text-sm font-bold text-emerald-600">{formatCurrency(seizure.details.estimatedValue)}</span></div>
                            {seizure.details.mortgageInfo && <div className="flex justify-between"><span className="text-sm text-slate-500">İpotek</span><span className="text-sm font-medium text-amber-600 text-right max-w-[65%]">{seizure.details.mortgageInfo}</span></div>}
                          </div>
                          {seizure.details.seizureNote && <div className="col-span-full p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800"><strong>Not:</strong> {seizure.details.seizureNote}</div>}
                        </div>
                      )}
                      {seizure.type === 'salary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">İşveren</span><span className="text-sm font-medium">{seizure.details.employer}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">SGK No</span><span className="text-sm font-medium font-mono">{seizure.details.sgkNo}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Aylık Maaş</span><span className="text-sm font-medium">{formatCurrency(seizure.details.monthlySalary)}</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Kesinti Oranı</span><span className="text-sm font-bold">%{seizure.details.deductionRate}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Aylık Kesinti</span><span className="text-sm font-bold text-purple-600">{formatCurrency(seizure.details.deductionAmount)}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Başlangıç</span><span className="text-sm font-medium">{formatDate(seizure.details.startDate)}</span></div>
                          </div>
                          {seizure.details.responseNote && <div className="col-span-full p-3 bg-purple-50 rounded-lg text-sm text-purple-800"><strong>Not:</strong> {seizure.details.responseNote}</div>}
                        </div>
                      )}
                      {seizure.type === 'receivable' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">İcra Dairesi</span><span className="text-sm font-medium">{seizure.details.thirdPartyCourt}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Dosya No</span><span className="text-sm font-medium">{seizure.details.thirdPartyCaseNo}</span></div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Borçlu</span><span className="text-sm font-medium">{seizure.details.thirdPartyDebtor}</span></div>
                            <div className="flex justify-between"><span className="text-sm text-slate-500">Beklenen Tutar</span><span className="text-sm font-bold text-amber-600">{formatCurrency(seizure.details.expectedAmount)}</span></div>
                          </div>
                          {seizure.details.seizureNote && <div className="col-span-full p-3 bg-amber-50 rounded-lg text-sm text-amber-800"><strong>Not:</strong> {seizure.details.seizureNote}</div>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════ DAVALAR TAB ═══════════════ */}
        {activeTab === 'lawsuits' && (
          <div className="space-y-4">
            {(!caseData.lawsuits || caseData.lawsuits.length === 0) ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 shadow-sm">
                <Gavel className="w-10 h-10 mx-auto mb-2" />
                <p>Henüz dava kaydı yok</p>
              </div>
            ) : caseData.lawsuits.map(lawsuit => {
              const isExpanded = expandedLawsuit === lawsuit.id;
              const lawStatusColor = lawsuit.status === 'active' ? 'bg-icra-light/15 text-icra-dark' : lawsuit.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700';
              const lawStatusLabel = lawsuit.status === 'active' ? 'Devam Ediyor' : lawsuit.status === 'completed' ? 'Sonuçlandı' : lawsuit.status;

              return (
                <div key={lawsuit.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedLawsuit(isExpanded ? null : lawsuit.id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-icra-light/15 rounded-xl"><Gavel className="w-5 h-5 text-icra-dark" /></div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{lawsuit.subject}</h4>
                        <p className="text-sm text-slate-500 mt-0.5">{lawsuit.courtName} — {lawsuit.caseNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lawsuit.nextHearingDate && (
                        <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Calendar className="w-3.5 h-3.5" />
                          Sonraki: {formatDate(lawsuit.nextHearingDate)}
                        </span>
                      )}
                      <span className={clsx('px-3 py-1 rounded-full text-xs font-medium', lawStatusColor)}>{lawStatusLabel}</span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {/* Dava Bilgileri */}
                      <div className="p-5 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-sm text-slate-500">Mahkeme</span><span className="text-sm font-medium">{lawsuit.courtName}</span></div>
                          <div className="flex justify-between"><span className="text-sm text-slate-500">Esas No</span><span className="text-sm font-medium">{lawsuit.caseNumber}</span></div>
                          <div className="flex justify-between"><span className="text-sm text-slate-500">Açılış Tarihi</span><span className="text-sm font-medium">{formatDate(lawsuit.filingDate)}</span></div>
                          <div className="flex justify-between"><span className="text-sm text-slate-500">Davacı</span><span className="text-sm font-medium text-right max-w-[65%]">{lawsuit.plaintiff}</span></div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between"><span className="text-sm text-slate-500">Davalı</span><span className="text-sm font-medium">{lawsuit.defendant}</span></div>
                          {lawsuit.requestedPenalty && <div className="flex justify-between"><span className="text-sm text-slate-500">Talep</span><span className="text-sm font-medium text-red-600">{lawsuit.requestedPenalty}</span></div>}
                          {lawsuit.result && <div className="flex justify-between"><span className="text-sm text-slate-500">Sonuç</span><span className="text-sm font-bold text-emerald-600 text-right max-w-[65%]">{lawsuit.result}</span></div>}
                        </div>
                        <div className="col-span-full p-3 bg-icra-light/10 rounded-lg text-sm text-icra-darkest">{lawsuit.description}</div>
                      </div>

                      {/* Duruşmalar */}
                      {lawsuit.hearings.length > 0 && (
                        <div className="p-5 border-t border-slate-100">
                          <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Duruşmalar</h5>
                          <div className="space-y-3">
                            {lawsuit.hearings.map(h => (
                              <div key={h.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <div className="w-2 h-2 mt-2 rounded-full bg-icra-mid shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-900">{h.type}</span>
                                    <span className="text-xs text-slate-500">{formatDate(h.date)}</span>
                                  </div>
                                  <p className="text-sm text-slate-600 mt-1">{h.result}</p>
                                  {h.nextDate && <p className="text-xs text-orange-600 mt-1">Sonraki duruşma: {formatDate(h.nextDate)}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Belgeler */}
                      {lawsuit.documents.length > 0 && (
                        <div className="p-5 border-t border-slate-100">
                          <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Belgeler</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {lawsuit.documents.map(doc => (
                              <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                                <FileText className="w-4 h-4 text-icra-mid shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                                  <p className="text-xs text-slate-500">{formatDate(doc.date)}</p>
                                </div>
                                <Eye className="w-4 h-4 text-slate-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════ TEBLİGAT TAB ═══════════════ */}
        {activeTab === 'tebligat' && (
          <div className="space-y-4">
            {(!caseData.tebligats || caseData.tebligats.length === 0) ? (
              <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400 shadow-sm">
                <Send className="w-10 h-10 mx-auto mb-2" />
                <p>Henüz tebligat kaydı yok</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tür</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Muhatap</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Adres</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Gönderim</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Teslim</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Barkod</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {caseData.tebligats.map(t => {
                      const tebTypeLabels: Record<string, string> = {
                        odeme_emri: 'Ödeme Emri',
                        '103_davetiye': '103 Davetiye',
                        haciz_ihbarnamesi: 'Haciz İhbarnamesi',
                        maas_haczi_muze: 'Maaş Haczi Müz.',
                      };
                      const tebStatusConfig: Record<string, { label: string; color: string }> = {
                        delivered: { label: 'Teslim Edildi', color: 'bg-emerald-100 text-emerald-700' },
                        sent: { label: 'Gönderildi', color: 'bg-icra-light/15 text-icra-dark' },
                        pending: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-700' },
                        failed: { label: 'Başarısız', color: 'bg-red-100 text-red-700' },
                      };
                      const ts = tebStatusConfig[t.status] || { label: t.status, color: 'bg-slate-100 text-slate-700' };
                      return (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3"><span className="px-2 py-1 bg-icra-light/10 text-icra-dark rounded text-xs font-medium">{tebTypeLabels[t.type] || t.type}</span></td>
                          <td className="px-5 py-3 text-sm font-medium text-slate-900">{t.recipient}</td>
                          <td className="px-5 py-3 text-sm text-slate-600 max-w-[200px] truncate" title={t.address}>{t.address}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{formatDate(t.sentDate)}</td>
                          <td className="px-5 py-3 text-sm text-slate-600">{t.deliveryDate ? formatDate(t.deliveryDate) : '-'}</td>
                          <td className="px-5 py-3"><span className="text-xs font-mono text-slate-500">{t.pttBarcode}</span></td>
                          <td className="px-5 py-3"><span className={clsx('px-2 py-0.5 rounded text-xs font-medium', ts.color)}>{ts.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ UYAP XML EXPORT TAB ═══════════════ */}
        {activeTab === 'uyap_xml' && (() => {
          const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<UyapTakipAcma xmlns="http://uyap.gov.tr/icra/takip" versiyon="2.0">
  <TakipBilgileri>
    <DosyaNo>${caseData.caseNumber}</DosyaNo>
    <FoyNo>${caseData.foyNumber || ''}</FoyNo>
    <TakipTuru>${caseData.caseType === 'ilamsiz' ? 'İlamsız İcra' : caseData.caseType === 'ilamli' ? 'İlamlı İcra' : 'Kambiyo'}</TakipTuru>
    <IcraDairesi>${caseData.court.name}</IcraDairesi>
    <Sehir>${caseData.court.city}</Sehir>
    <AcilisTarihi>${new Date(caseData.createdAt).toISOString().split('T')[0]}</AcilisTarihi>
  </TakipBilgileri>

  <AlacakliBilgileri>
    <Ad>${caseData.creditor.name}</Ad>
    <Tur>${caseData.creditor.type}</Tur>
    <VergiNo>${caseData.creditor.taxNo || ''}</VergiNo>
    <Adres>${caseData.creditor.address || ''}</Adres>
    <Telefon>${caseData.creditor.phone || ''}</Telefon>
    <Eposta>${caseData.creditor.email || ''}</Eposta>
  </AlacakliBilgileri>

  <BorcluBilgileri>
    <Ad>${caseData.debtor.firstName}</Ad>
    <Soyad>${caseData.debtor.lastName}</Soyad>
    <TCKimlikNo>${caseData.debtor.tcNo}</TCKimlikNo>
    <Telefon>${caseData.debtor.phone || ''}</Telefon>
    <Eposta>${caseData.debtor.email || ''}</Eposta>
    <Adres>${caseData.debtor.address || ''}</Adres>
    <Il>${caseData.debtor.city || ''}</Il>
    <Ilce>${caseData.debtor.district || ''}</Ilce>
  </BorcluBilgileri>

  <AlacakBilgileri>
    <AnaPara>${caseData.principalAmount.toFixed(2)}</AnaPara>
    <Faiz>${caseData.interestAmount.toFixed(2)}</Faiz>
    <ToplamTutar>${caseData.totalAmount.toFixed(2)}</ToplamTutar>
    <ParaBirimi>TRY</ParaBirimi>
  </AlacakBilgileri>

  <HacizBilgileri>${(caseData.seizures || []).map(s => {
    if (s.type === 'bank') return `
    <BankaHaczi>
      <BankaAdi>${s.details.bankName}</BankaAdi>
      <IBAN>${s.details.iban}</IBAN>
      <BlokeTutar>${s.details.blockedAmount?.toFixed(2) || '0.00'}</BlokeTutar>
      <Durum>${s.status}</Durum>
    </BankaHaczi>`;
    if (s.type === 'vehicle') return `
    <AracHaczi>
      <Plaka>${s.details.plate}</Plaka>
      <Marka>${s.details.brand} ${s.details.model}</Marka>
      <Yil>${s.details.year}</Yil>
      <SasiNo>${s.details.chassisNo}</SasiNo>
      <MotorNo>${s.details.engineNo}</MotorNo>
      <TahminiDeger>${s.details.estimatedValue?.toFixed(2) || '0.00'}</TahminiDeger>
    </AracHaczi>`;
    if (s.type === 'property') return `
    <TasinmazHaczi>
      <Adres>${s.details.address}</Adres>
      <AdaParsel>${s.details.parcel}</AdaParsel>
      <Alan>${s.details.area}</Alan>
      <TapuNo>${s.details.tapuNo}</TapuNo>
      <TahminiDeger>${s.details.estimatedValue?.toFixed(2) || '0.00'}</TahminiDeger>
    </TasinmazHaczi>`;
    if (s.type === 'salary') return `
    <MaasHaczi>
      <Isveren>${s.details.employer}</Isveren>
      <SGKNo>${s.details.sgkNo}</SGKNo>
      <AylikMaas>${s.details.monthlySalary?.toFixed(2) || '0.00'}</AylikMaas>
      <KesintiOrani>${s.details.deductionRate}</KesintiOrani>
    </MaasHaczi>`;
    return '';
  }).join('')}
  </HacizBilgileri>

  <DavaBilgileri>${(caseData.lawsuits || []).map(l => `
    <Dava>
      <Mahkeme>${l.courtName}</Mahkeme>
      <EsasNo>${l.caseNumber}</EsasNo>
      <Konu>${l.subject}</Konu>
      <AcilisTarihi>${new Date(l.filingDate).toISOString().split('T')[0]}</AcilisTarihi>
      <Durum>${l.status}</Durum>${l.result ? `
      <Sonuc>${l.result}</Sonuc>` : ''}
    </Dava>`).join('')}
  </DavaBilgileri>

  <VekilBilgileri>
    <Ad>${caseData.createdBy.name}</Ad>
    <Eposta>${caseData.createdBy.email}</Eposta>
    <BaroSicilNo>12345</BaroSicilNo>
  </VekilBilgileri>
</UyapTakipAcma>`;

          const handleDownloadXml = () => {
            const blob = new Blob([xmlContent], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `uyap-takip-${caseData.caseNumber.replace('/', '-')}.xml`;
            a.click();
            URL.revokeObjectURL(url);
          };

          const handleCopyXml = () => {
            navigator.clipboard.writeText(xmlContent);
            setXmlCopied(true);
            setTimeout(() => setXmlCopied(false), 2000);
          };

          return (
            <div className="space-y-4">
              {/* Bilgi Kartı */}
              <div className="bg-gradient-to-r from-icra-light/5 to-icra-light/10 rounded-xl border border-icra-light/20 p-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-icra-light/15 rounded-xl"><FileCode className="w-6 h-6 text-icra-mid" /></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">UYAP Takip Açma XML</h3>
                    <p className="text-sm text-slate-600 mt-1">Bu dosyayı indirip UYAP portalına yükleyerek doğrudan icra takibi açabilirsiniz. XML dosyası tüm borçlu, alacaklı, haciz ve dava bilgilerini içerir.</p>
                    <div className="flex items-center gap-3 mt-4">
                      <button onClick={handleDownloadXml} className="flex items-center gap-2 px-4 py-2.5 bg-icra-mid text-white rounded-xl text-sm font-medium hover:bg-icra-dark transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        XML İndir
                      </button>
                      <button onClick={handleCopyXml} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                        {xmlCopied ? <><CheckCircle className="w-4 h-4 text-emerald-500" /> Kopyalandı!</> : <><Copy className="w-4 h-4" /> Kopyala</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* XML Özet */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
                  <Scale className="w-5 h-5 text-icra-mid mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">{caseData.caseType === 'ilamsiz' ? 'İlamsız' : caseData.caseType === 'ilamli' ? 'İlamlı' : 'Kambiyo'}</p>
                  <p className="text-xs text-slate-500">Takip Türü</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
                  <Shield className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">{caseData.seizures?.length || 0}</p>
                  <p className="text-xs text-slate-500">Haciz Kaydı</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
                  <Gavel className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">{caseData.lawsuits?.length || 0}</p>
                  <p className="text-xs text-slate-500">Dava</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm text-center">
                  <DollarSign className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(caseData.totalAmount)}</p>
                  <p className="text-xs text-slate-500">Toplam Alacak</p>
                </div>
              </div>

              {/* XML Önizleme */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">uyap-takip-{caseData.caseNumber.replace('/', '-')}.xml</span>
                  </div>
                  <span className="text-xs text-slate-400">{(new TextEncoder().encode(xmlContent).length / 1024).toFixed(1)} KB</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-700 overflow-auto max-h-96 bg-slate-900 text-slate-300 leading-relaxed">
                  {xmlContent}
                </pre>
              </div>
            </div>
          );
        })()}

        </div>{/* end left panel */}

        {/* ══════════ SAĞ PANEL: Komple Detaylı Gelir-Gider Tablosu ══════════ */}
        <div className="w-[420px] flex-shrink-0 space-y-3 sticky top-6">

          {/* ── 1. ALACAK KALEMLERİ ── */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gradient-to-r from-icra-dark to-icra-mid">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Alacak Kalemleri</span>
                <span className="text-sm font-bold text-white">{formatCurrency(toplamAlacak)}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50 text-xs">
              {/* Ana Para */}
              <div className="px-4 py-1.5 bg-slate-50"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ana Para & Faiz</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-700 font-semibold">Ana Para (Asıl Alacak)</span><span className="font-bold text-slate-900">{formatCurrency(anaPara)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">İşleyen Faiz (%{(yillikFaizOrani * 100).toFixed(0)} yıllık)</span><span className="font-semibold text-amber-600">{formatCurrency(isleyenFaiz)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-500 pl-3">Günlük Faiz Tutarı</span><span className="font-medium text-slate-500">{formatCurrency(gunlukFaiz)}/gün</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-500 pl-3">Geçen Gün Sayısı</span><span className="font-medium text-slate-500">{gecenGun} gün</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-500 pl-3">Faiz Başlangıç Tarihi</span><span className="font-medium text-slate-500">{formatDate(caseData.openDate)}</span></div>

              {/* Takip Masrafları */}
              <div className="px-4 py-1.5 bg-slate-50"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Takip Masrafları</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Takip Öncesi Masraf (%1.2)</span><span className="font-medium text-slate-700">{formatCurrency(takipOncesiMasraf)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Başvuru Harcı</span><span className="font-medium text-slate-700">{formatCurrency(basvuruHarci)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Vekalet Başvuru Harcı</span><span className="font-medium text-slate-700">{formatCurrency(vekalet_BasvuruHarci)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Peşin Harç (‰5)</span><span className="font-medium text-slate-700">{formatCurrency(pesinHarc)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Tebligat Gideri ({caseData.tebligats?.length || 1} adet)</span><span className="font-medium text-slate-700">{formatCurrency(tebligatGideri)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">PTT / Posta Masrafı</span><span className="font-medium text-slate-700">{formatCurrency(pttMasrafi)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Dosya Masrafı / Diğer</span><span className="font-medium text-slate-700">{formatCurrency(diger_masraflar)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-icra-light/5 font-semibold"><span className="text-icra-dark">Takip Masrafları Toplamı</span><span className="text-icra-dark">{formatCurrency(toplamTakipMasrafi)}</span></div>

              {/* Vekalet Ücreti */}
              <div className="px-4 py-1.5 bg-slate-50"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vekalet Ücreti</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Avukatlık Vekalet Ücreti (%15)</span><span className="font-medium text-slate-700">{formatCurrency(vekaletUcreti)}</span></div>

              {/* Yargılama Masrafları */}
              {toplamYargilamaMasrafi > 0 && (
                <>
                  <div className="px-4 py-1.5 bg-slate-50"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Yargılama Masrafları</span></div>
                  {bilirkisiUcreti > 0 && <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Bilirkişi Ücreti</span><span className="font-medium text-slate-700">{formatCurrency(bilirkisiUcreti)}</span></div>}
                  {kesfUcreti > 0 && <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Keşif Ücreti</span><span className="font-medium text-slate-700">{formatCurrency(kesfUcreti)}</span></div>}
                  {ilanGideri > 0 && <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">İlan Gideri</span><span className="font-medium text-slate-700">{formatCurrency(ilanGideri)}</span></div>}
                  <div className="px-4 py-2 flex justify-between bg-purple-50/50 font-semibold"><span className="text-purple-700">Yargılama Toplamı</span><span className="text-purple-700">{formatCurrency(toplamYargilamaMasrafi)}</span></div>
                </>
              )}
            </div>
          </div>

          {/* ── 2. TAHSİL HARCI & KESİNTİLER ── */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Tahsil Harcı & Kesintiler</span>
                <span className="text-sm font-bold text-white">{formatCurrency(toplamKesintiler)}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50 text-xs">
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Tahsil Harcı (%{(tahsilHarciOrani * 100).toFixed(2)})</span><span className="font-semibold text-amber-700">{formatCurrency(tahsilHarci)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Cezaevi Yapı Harcı (%2)</span><span className="font-medium text-slate-700">{formatCurrency(cezaeviYapiHarci)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Baro Payı (%5 vekalet üzerinden)</span><span className="font-medium text-slate-700">{formatCurrency(baroPayi)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Vekalet KDV (%{(kdvOrani * 100).toFixed(0)})</span><span className="font-medium text-slate-700">{formatCurrency(vekaletKDV)}</span></div>
            </div>
          </div>

          {/* ── 3. TAHSİLAT DURUMU ── */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Tahsilat Durumu</span>
                <span className="text-sm font-bold text-white">{formatCurrency(tahsilEdilen)}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50 text-xs">
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Toplam Tahsilat (Gelir)</span><span className="font-bold text-emerald-600">{formatCurrency(tahsilEdilen)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Toplam Gider</span><span className="font-bold text-red-600">{formatCurrency(totalExpense)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Net Tahsilat</span><span className="font-bold text-slate-900">{formatCurrency(totalIncome - totalExpense)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Toplam Kesintiler</span><span className="font-medium text-amber-600">{formatCurrency(toplamKesintiler)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Avukata Kalan Net</span><span className="font-bold text-icra-dark">{formatCurrency(Math.max(0, tahsilEdilen - toplamKesintiler - totalExpense))}</span></div>
              {/* Progress bar */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Tahsilat Oranı</span>
                  <span className="text-xs font-bold text-slate-700">{toplamAlacak > 0 ? ((tahsilEdilen / toplamAlacak) * 100).toFixed(1) : '0.0'}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(100, toplamAlacak > 0 ? (tahsilEdilen / toplamAlacak) * 100 : 0)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── 4. KALAN ALACAK ── */}
          <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Kalan Alacak</span>
                <span className="text-sm font-bold text-white">{formatCurrency(kalanToplam)}</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50 text-xs">
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Ana Para Kalan</span><span className="font-bold text-red-600">{formatCurrency(kalanAnaPara)}</span></div>
              <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-600">Faiz Kalan</span><span className="font-medium text-red-500">{formatCurrency(kalanFaiz)}</span></div>
              <div className="px-4 py-2 flex justify-between"><span className="text-slate-600">Vekalet + Masraf Kalan</span><span className="font-medium text-slate-700">{formatCurrency(Math.max(0, kalanToplam - kalanAnaPara - kalanFaiz))}</span></div>
              <div className="px-4 py-2 flex justify-between bg-red-50/50"><span className="text-red-600 font-semibold">Sonraki Gün Faiz</span><span className="font-bold text-red-600">+{formatCurrency(gunlukFaiz)}/gün</span></div>
            </div>
          </div>

          {/* ── 5. HACİZ ÖZETİ ── */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Haciz Özeti</span>
                <span className="text-sm font-bold text-white">{caseData.seizures?.length || 0} Kayıt</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50 text-xs">
              {[
                { type: 'bank', label: 'Banka Haczi', icon: Banknote, color: 'text-icra-dark' },
                { type: 'vehicle', label: 'Araç Haczi', icon: Car, color: 'text-cyan-600' },
                { type: 'property', label: 'Taşınmaz Haczi', icon: Home, color: 'text-emerald-600' },
                { type: 'salary', label: 'Maaş Haczi', icon: Briefcase, color: 'text-purple-600' },
                { type: 'receivable', label: 'Alacak Haczi', icon: DollarSign, color: 'text-amber-600' },
              ].map(h => {
                const cnt = caseData.seizures?.filter(s => s.type === h.type).length || 0;
                const HIcon = h.icon;
                return (
                  <div key={h.type} className="px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HIcon className={`w-3.5 h-3.5 ${h.color}`} />
                      <span className="text-slate-600">{h.label}</span>
                    </div>
                    <span className={`font-bold ${cnt > 0 ? h.color : 'text-slate-300'}`}>{cnt}</span>
                  </div>
                );
              })}
              {caseData.seizures && caseData.seizures.length > 0 && (() => {
                const toplamBlokeBank = caseData.seizures.filter(s => s.type === 'bank').reduce((sum, s) => sum + (s.details.blockedAmount || 0), 0);
                const toplamAracDeger = caseData.seizures.filter(s => s.type === 'vehicle').reduce((sum, s) => sum + (s.details.estimatedValue || 0), 0);
                const toplamTasinmazDeger = caseData.seizures.filter(s => s.type === 'property').reduce((sum, s) => sum + (s.details.estimatedValue || 0), 0);
                const toplamMaasKesinti = caseData.seizures.filter(s => s.type === 'salary').reduce((sum, s) => sum + (s.details.deductionAmount || 0), 0);
                const toplamHacizDeger = toplamBlokeBank + toplamAracDeger + toplamTasinmazDeger;
                return (
                  <>
                    {toplamBlokeBank > 0 && <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-500 pl-5">Toplam Bloke</span><span className="font-semibold text-emerald-600">{formatCurrency(toplamBlokeBank)}</span></div>}
                    {toplamAracDeger > 0 && <div className="px-4 py-2 flex justify-between"><span className="text-slate-500 pl-5">Araç Değeri</span><span className="font-semibold text-cyan-600">{formatCurrency(toplamAracDeger)}</span></div>}
                    {toplamTasinmazDeger > 0 && <div className="px-4 py-2 flex justify-between bg-slate-50/50"><span className="text-slate-500 pl-5">Taşınmaz Değeri</span><span className="font-semibold text-emerald-600">{formatCurrency(toplamTasinmazDeger)}</span></div>}
                    {toplamMaasKesinti > 0 && <div className="px-4 py-2 flex justify-between"><span className="text-slate-500 pl-5">Aylık Maaş Kesintisi</span><span className="font-semibold text-purple-600">{formatCurrency(toplamMaasKesinti)}/ay</span></div>}
                    {toplamHacizDeger > 0 && <div className="px-4 py-2 flex justify-between bg-purple-50/50 font-semibold"><span className="text-purple-700">Toplam Haciz Değeri</span><span className="text-purple-700">{formatCurrency(toplamHacizDeger)}</span></div>}
                  </>
                );
              })()}
            </div>
          </div>

        </div>{/* end right financial panel */}

        </div>{/* end 2-column layout */}
      </div>
    </div>
  );
}
