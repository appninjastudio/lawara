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
} from 'lucide-react';
import { useState, useEffect, use } from 'react';
import clsx from 'clsx';

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
    id: number; name: string; type: string;
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
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Aktif', color: 'bg-blue-100 text-blue-700', icon: Clock },
  pending: { label: 'Beklemede', color: 'bg-amber-100 text-amber-700', icon: Clock },
  completed: { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  closed: { label: 'Kapatıldı', color: 'bg-slate-100 text-slate-700', icon: XCircle },
  warning: { label: 'Dikkat', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const typeLabels: Record<string, string> = {
  ilamli: 'İlamlı', ilamsiz: 'İlamsız', kambiyo: 'Kambiyo',
};

const noteTypeConfig: Record<string, { label: string; color: string }> = {
  note: { label: 'Not', color: 'bg-blue-100 text-blue-700' },
  warning: { label: 'Uyarı', color: 'bg-red-100 text-red-700' },
  reminder: { label: 'Hatırlatma', color: 'bg-amber-100 text-amber-700' },
};

const notifStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Bekliyor', color: 'bg-amber-100 text-amber-700' },
  sent: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Teslim Edildi', color: 'bg-emerald-100 text-emerald-700' },
  failed: { label: 'Başarısız', color: 'bg-red-100 text-red-700' },
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'commitments' | 'notes' | 'notifications'>('overview');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [addingNote, setAddingNote] = useState(false);

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
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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
          <a href="/cases" className="mt-4 text-blue-600 hover:underline">Dosya listesine dön</a>
        </div>
      </div>
    );
  }

  const sc = statusConfig[caseData.status] || statusConfig.active;
  const StatusIcon = sc.icon;
  const totalIncome = caseData.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = caseData.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const tabs = [
    { key: 'overview' as const, label: 'Genel Bakış', icon: FileText },
    { key: 'transactions' as const, label: `İşlemler (${caseData.transactions.length})`, icon: DollarSign },
    { key: 'commitments' as const, label: `Taahhütler (${caseData.commitments.length})`, icon: CreditCard },
    { key: 'notes' as const, label: `Notlar (${caseData.notes.length})`, icon: MessageSquare },
    { key: 'notifications' as const, label: `Bildirimler (${caseData.notifications.length})`, icon: Bell },
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
            <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', sc.color)}>
              <StatusIcon className="w-4 h-4" />
              {sc.label}
            </span>
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
              {typeLabels[caseData.caseType] || caseData.caseType}
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ana Para</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(caseData.principalAmount)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Faiz</p>
            <p className="text-2xl font-bold text-amber-600">{formatCurrency(caseData.interestAmount)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Tutar</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(caseData.totalAmount)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Tahsilat</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-slate-500 mt-1">Kalan: {formatCurrency(caseData.totalAmount - totalIncome)}</p>
          </div>
        </div>

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
                    ? 'border-blue-600 text-blue-600'
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
                <div className="p-2 bg-blue-100 rounded-lg"><Building2 className="w-5 h-5 text-blue-600" /></div>
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
                    c.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    c.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {c.status === 'active' ? 'Aktif' : c.status === 'completed' ? 'Tamamlandı' : 'İhlal'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(c.paidCount / c.installmentCount) * 100}%` }} />
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
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors self-end"
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
      </div>
    </div>
  );
}
