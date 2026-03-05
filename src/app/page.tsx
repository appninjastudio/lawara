'use client';

import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import { 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  StickyNote,
  X,
  MessageCircle,
  Send,
  Loader2,
  Plus
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface DashboardData {
  stats: {
    totalCases: number;
    activeCases: number;
    pendingCases: number;
    completedCases: number;
    warningCases: number;
    totalDebtors: number;
    totalCreditors: number;
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    totalPortfolio: number;
    collectionRate: number;
  };
  recentCases: {
    id: number;
    caseNumber: string;
    totalAmount: number;
    status: string;
    openDate: string;
    debtor: { firstName: string; lastName: string };
    creditor: { name: string };
    court: { name: string };
  }[];
  recentNotes: {
    id: number;
    content: string;
    type: string;
    createdAt: string;
    user: { name: string };
    case: { caseNumber: string };
  }[];
}

interface PostItNote {
  id: number;
  title: string;
  content: string;
  color: string;
  caseId: string | null;
  pinned: boolean;
}

const colorConfig: Record<string, { bg: string; text: string }> = {
  yellow: { bg: 'bg-yellow-200', text: 'text-yellow-900' },
  blue: { bg: 'bg-sky-200', text: 'text-sky-900' },
  pink: { bg: 'bg-pink-200', text: 'text-pink-900' },
  green: { bg: 'bg-emerald-200', text: 'text-emerald-900' },
  purple: { bg: 'bg-purple-200', text: 'text-purple-900' },
};

const colorOptions = [
  { value: 'yellow', label: 'Sarı' },
  { value: 'blue', label: 'Mavi' },
  { value: 'pink', label: 'Pembe' },
  { value: 'green', label: 'Yeşil' },
  { value: 'purple', label: 'Mor' },
];

const statusColors: Record<string, string> = {
  active: 'bg-icra-light/15 text-icra-dark',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  active: 'Aktif',
  pending: 'Beklemede',
  completed: 'Tamamlandı',
  warning: 'Dikkat',
};

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Yüksel MARTI', message: 'Genel Klasördeki 1141 numaralı takibin son durumu nedir?', time: '11:40', isOwn: false },
    { id: 2, sender: 'You', message: 'Borçlu ile görüştüm. Bu hafta ödemeyi yapacağını söyledi.', time: '11:41', isOwn: true },
    { id: 3, sender: 'Yüksel MARTI', message: 'Föye uyarı eklendi.', time: '11:42', isOwn: false },
  ]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [postItNotes, setPostItNotes] = useState<PostItNote[]>([]);
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteForm, setNewNoteForm] = useState({ title: '', content: '', color: 'yellow', caseId: '' });
  const [creatingNote, setCreatingNote] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [dashRes, notesRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/notes'),
        ]);
        const dashJson = await dashRes.json();
        const notesJson = await notesRes.json();
        setData(dashJson);
        setPostItNotes(notesJson.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const handleCreateNote = async () => {
    if (!newNoteForm.title.trim()) return;
    setCreatingNote(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNoteForm),
      });
      const json = await res.json();
      if (json.success) {
        setPostItNotes(prev => [json.data, ...prev]);
        setNewNoteForm({ title: '', content: '', color: 'yellow', caseId: '' });
        setShowNewNote(false);
      }
    } catch (err) {
      console.error('Create note error:', err);
    } finally {
      setCreatingNote(false);
    }
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newMsg = { id: Date.now(), sender: 'You', message: chatMessage, time: timeStr, isOwn: true };
    setChatMessages(prev => [...prev, newMsg]);
    setChatMessage('');
    // Mock auto-reply after 1.5s
    const replies = [
      'Anlaşıldı, dosyayı kontrol ediyorum.',
      'Teşekkürler, bilgiyi not aldım.',
      'Borçluya SMS hatırlatması gönderelim mi?',
      'Tamam, UYAP sorgusu başlattım.',
      'Dosya güncellendi, föye işledim.',
      'Haciz talebi için evrakları hazırlıyorum.',
    ];
    setTimeout(() => {
      const replyTime = new Date();
      const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`;
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'Yüksel MARTI',
        message: replies[Math.floor(Math.random() * replies.length)],
        time: replyTimeStr,
        isOwn: false,
      }]);
    }, 1500);
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setPostItNotes(prev => prev.filter(n => n.id !== noteId));
      }
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);

  const formatCurrencyShort = (amount: number) => {
    if (amount >= 1_000_000) return `₺${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₺${(amount / 1_000).toFixed(0)}K`;
    return formatCurrency(amount);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('tr-TR');

  const s = data?.stats;

  return (
    <div className="flex flex-col h-full relative">
      <Header title="Dashboard" subtitle="Hoş geldiniz, günlük özet" />
      
      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-icra-mid animate-spin" />
            <span className="ml-3 text-slate-500">Yükleniyor...</span>
          </div>
        ) : (
        <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Dosya"
            value={s?.totalCases?.toLocaleString() || '0'}
            change={`${s?.pendingCases || 0} beklemede`}
            changeType="neutral"
            icon={FolderKanban}
            iconColor="text-icra-mid"
            iconBg="bg-icra-light/15"
          />
          <StatCard
            title="Aktif Takipler"
            value={s?.activeCases?.toLocaleString() || '0'}
            change={`${s?.totalDebtors || 0} borçlu`}
            changeType="neutral"
            icon={Clock}
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
          <StatCard
            title="Tamamlanan"
            value={s?.completedCases?.toLocaleString() || '0'}
            change={s && s.totalCases > 0 ? `%${Math.round((s.completedCases / s.totalCases) * 100)} başarı` : ''}
            changeType="positive"
            icon={CheckCircle2}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100"
          />
          <StatCard
            title="Dikkat Gereken"
            value={s?.warningCases?.toLocaleString() || '0'}
            change="acil işlem"
            changeType="negative"
            icon={AlertTriangle}
            iconColor="text-red-600"
            iconBg="bg-red-100"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Son Dosyalar</h2>
                </div>
                <a href="/cases" className="text-sm text-icra-mid hover:text-icra-dark font-medium">
                  Tümünü Gör
                </a>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">Dosya No</th>
                    <th className="px-6 py-3 font-medium">Borçlu</th>
                    <th className="px-6 py-3 font-medium">Tutar</th>
                    <th className="px-6 py-3 font-medium">Durum</th>
                    <th className="px-6 py-3 font-medium">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentCases || []).map((caseItem) => (
                    <tr key={caseItem.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/cases/${caseItem.id}`}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{caseItem.caseNumber}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{caseItem.debtor.firstName} {caseItem.debtor.lastName}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(caseItem.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[caseItem.status] || 'bg-slate-100 text-slate-700'}`}>
                          {statusLabels[caseItem.status] || caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDate(caseItem.openDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Son Notlar</h2>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {(data?.recentNotes || []).map((note) => (
                <div 
                  key={note.id} 
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    note.type === 'warning' ? 'bg-red-500' : 
                    note.type === 'reminder' ? 'bg-amber-500' : 'bg-icra-mid'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{note.content}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{note.case.caseNumber} - {note.user.name}</p>
                  </div>
                </div>
              ))}
              {(!data?.recentNotes || data.recentNotes.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Henüz not yok</p>
              )}
            </div>
          </div>
        </div>

        {/* Post-it Notes and Bottom Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Post-it Notes */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Post-it Notlar</h2>
            </div>
            <div className="space-y-3">
              {postItNotes.map((note) => {
                const cc = colorConfig[note.color] || colorConfig.yellow;
                return (
                  <div 
                    key={note.id} 
                    className={`${cc.bg} rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer relative group`}
                  >
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/10 rounded"
                    >
                      <X className={`w-3 h-3 ${cc.text}`} />
                    </button>
                    {note.caseId && (
                      <p className={`text-xs font-medium ${cc.text} opacity-70 mb-1`}>{note.caseId}</p>
                    )}
                    <p className={`text-sm font-semibold ${cc.text}`}>{note.title}</p>
                    <p className={`text-xs ${cc.text} opacity-80 mt-1 whitespace-pre-line`}>{note.content}</p>
                  </div>
                );
              })}
              <button
                onClick={() => setShowNewNote(true)}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
              >
                + Yeni Not Ekle
              </button>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-icra-dark to-icra-darkest rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-icra-light/70 text-sm">Toplam Tahsilat</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrencyShort(s?.totalIncome || 0)}</p>
                  <p className="text-icra-light/50 text-sm mt-1">Gider: {formatCurrencyShort(s?.totalExpense || 0)}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-icra-light/40" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-icra-light/50">Haciz Tahsilatı</span>
                  <span className="font-semibold">₺312.450</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-icra-light/50">Taahhüt Tahsilatı</span>
                  <span className="font-semibold">₺185.200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-icra-light/50">Maaş Haczi Kesintisi</span>
                  <span className="font-semibold">₺98.750</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-icra-light/50">Banka Blokesi</span>
                  <span className="font-semibold">₺124.390</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-xs text-icra-light/50">
                  <Calendar className="w-3 h-3" />
                  <span>Son güncelleme: Bugün 09:45</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Tahsilat Oranı</p>
                  <p className="text-3xl font-bold mt-2">%{s?.collectionRate || 0}</p>
                  <p className="text-emerald-200 text-sm mt-1">{s?.completedCases || 0} / {s?.totalCases || 0} dosya</p>
                </div>
                <CheckCircle2 className="w-12 h-12 text-emerald-300" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-200">Ödeme Emri Tebliğ</span>
                  <span className="font-semibold">18 dosya</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-200">Haciz Aşamasında</span>
                  <span className="font-semibold">7 dosya</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-200">Taahhüt Devam Eden</span>
                  <span className="font-semibold">5 dosya</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-200">İtiraz Edilen</span>
                  <span className="font-semibold">3 dosya</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: `${s?.collectionRate || 0}%` }} />
                </div>
                <p className="text-xs text-emerald-200 mt-1">Hedef: %45 — Kalan: %{Math.max(0, 45 - (s?.collectionRate || 0))}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm">Toplam Portföy</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrencyShort(s?.totalPortfolio || 0)}</p>
                  <p className="text-violet-200 text-sm mt-1">{s?.totalCreditors || 0} alacaklı</p>
                </div>
                <Users className="w-12 h-12 text-violet-300" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-violet-200">Türkiye İş Bankası</span>
                  <span className="font-semibold">₺890.000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-violet-200">Garanti BBVA</span>
                  <span className="font-semibold">₺645.200</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-violet-200">Yapı Kredi</span>
                  <span className="font-semibold">₺412.800</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-violet-200">Diğer Alacaklılar</span>
                  <span className="font-semibold">₺339.600</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-xs text-violet-200">
                  <FileText className="w-3 h-3" />
                  <span>{s?.totalDebtors || 0} borçlu • {s?.totalCases || 0} aktif dosya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-icra-dark to-icra-mid text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50">
          <div className="bg-gradient-to-r from-icra-darkest to-icra-dark p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Kullanıcılar Arası Mesaj</h3>
                  <p className="text-xs text-icra-light/70">Yüksel MARTI</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-1 hover:bg-white/20 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50" ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.isOwn 
                    ? 'bg-gradient-to-r from-icra-dark to-icra-mid text-white rounded-br-md' 
                    : 'bg-white text-slate-900 shadow-sm rounded-bl-md'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.isOwn ? 'text-icra-light/70' : 'text-slate-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
              />
              <button
                onClick={handleSendChat}
                className="p-2 bg-gradient-to-r from-icra-dark to-icra-mid text-white rounded-full hover:shadow-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Post-it Note Modal */}
      {showNewNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Yeni Post-it Not</h3>
                <button onClick={() => setShowNewNote(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
                <input
                  type="text"
                  value={newNoteForm.title}
                  onChange={(e) => setNewNoteForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Not başlığı"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">İçerik</label>
                <textarea
                  value={newNoteForm.content}
                  onChange={(e) => setNewNoteForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Not içeriği..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dosya Referansı (opsiyonel)</label>
                <input
                  type="text"
                  value={newNoteForm.caseId}
                  onChange={(e) => setNewNoteForm(prev => ({ ...prev, caseId: e.target.value }))}
                  placeholder="Örn: GENEL - 1141"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Renk</label>
                <div className="flex gap-2">
                  {colorOptions.map((opt) => {
                    const cc = colorConfig[opt.value];
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setNewNoteForm(prev => ({ ...prev, color: opt.value }))}
                        className={`w-10 h-10 rounded-lg ${cc.bg} border-2 transition-all ${
                          newNoteForm.color === opt.value ? 'border-slate-900 scale-110' : 'border-transparent'
                        }`}
                        title={opt.label}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowNewNote(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreateNote}
                disabled={creatingNote || !newNoteForm.title.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creatingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
