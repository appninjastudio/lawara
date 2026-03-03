'use client';

import Header from '@/components/Header';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Link,
  AlertTriangle,
  X,
  Copy,
  FileText,
  Loader2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';

interface CaseItem {
  id: number;
  caseNumber: string;
  foyNumber: string | null;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  caseType: string;
  status: string;
  openDate: string;
  createdAt: string;
  debtor: { id: number; firstName: string; lastName: string; phone?: string; tcNo: string };
  creditor: { id: number; name: string; type: string };
  court: { id: number; name: string; city: string };
  _count: { notes: number; transactions: number; commitments: number };
}

const statusConfig = {
  active: { label: 'Aktif', color: 'bg-blue-100 text-blue-700' },
  pending: { label: 'Beklemede', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Tamamlandı', color: 'bg-emerald-100 text-emerald-700' },
  warning: { label: 'Dikkat', color: 'bg-red-100 text-red-700' },
};

const typeConfig: Record<string, string> = {
  'ilamli': 'bg-purple-100 text-purple-700',
  'ilamsiz': 'bg-cyan-100 text-cyan-700',
  'kambiyo': 'bg-orange-100 text-orange-700',
};

const typeLabels: Record<string, string> = {
  'ilamli': 'İlamlı',
  'ilamsiz': 'İlamsız',
  'kambiyo': 'Kambiyo',
};

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCases, setSelectedCases] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [queryCriteria, setQueryCriteria] = useState('borclu_adi');
  const [queryValue, setQueryValue] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(true);
  const [activeFilters, setActiveFilters] = useState<{criteria: string; value: string; label: string}[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [lookups, setLookups] = useState<{
    debtors: { id: number; firstName: string; lastName: string; tcNo: string }[];
    creditors: { id: number; name: string; type: string }[];
    courts: { id: number; name: string; city: string }[];
  } | null>(null);
  const [newCaseForm, setNewCaseForm] = useState({
    caseNumber: '', debtorId: '', creditorId: '', courtId: '',
    principalAmount: '', interestAmount: '', caseType: 'ilamsiz', foyNumber: '',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editCase, setEditCase] = useState<CaseItem | null>(null);
  const [editForm, setEditForm] = useState({ status: '', principalAmount: '', interestAmount: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);
  const pageSize = 10;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/cases?${params}`);
      const json = await res.json();
      setCases(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleSelectAll = () => {
    if (selectedCases.length === cases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(cases.map(c => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedCases(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const openNewCaseModal = async () => {
    setShowNewCaseModal(true);
    setCreateError('');
    if (!lookups) {
      try {
        const res = await fetch('/api/lookup');
        const json = await res.json();
        setLookups(json.data);
      } catch (err) {
        console.error('Lookup error:', err);
      }
    }
  };

  const handleCreateCase = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCaseForm),
      });
      const json = await res.json();
      if (json.success) {
        setShowNewCaseModal(false);
        setNewCaseForm({ caseNumber: '', debtorId: '', creditorId: '', courtId: '', principalAmount: '', interestAmount: '', caseType: 'ilamsiz', foyNumber: '' });
        fetchCases();
      } else {
        setCreateError(json.error || 'Dosya oluşturulamadı');
      }
    } catch (err) {
      console.error('Create error:', err);
      setCreateError('Bir hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirm(null);
        fetchCases();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Dosya No', 'Borçlu', 'Alacaklı', 'Ana Para', 'Faiz', 'Toplam', 'Tür', 'Durum', 'İcra Dairesi', 'Tarih'];
    const rows = cases.map(c => [
      c.caseNumber,
      `${c.debtor.firstName} ${c.debtor.lastName}`,
      c.creditor.name,
      c.principalAmount,
      c.interestAmount,
      c.totalAmount,
      typeLabels[c.caseType] || c.caseType,
      statusConfig[c.status as keyof typeof statusConfig]?.label || c.status,
      c.court.name,
      new Date(c.openDate).toLocaleDateString('tr-TR'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icra-dosyalari-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${cases.length} dosya CSV olarak indirildi`);
  };

  const openEditModal = (c: CaseItem) => {
    setEditCase(c);
    setEditForm({
      status: c.status,
      principalAmount: c.principalAmount.toString(),
      interestAmount: c.interestAmount.toString(),
    });
  };

  const handleEditSave = async () => {
    if (!editCase) return;
    setEditSaving(true);
    // Mock save - simulate API delay
    await new Promise(r => setTimeout(r, 600));
    setCases(prev => prev.map(c => c.id === editCase.id ? {
      ...c,
      status: editForm.status,
      principalAmount: parseFloat(editForm.principalAmount) || c.principalAmount,
      interestAmount: parseFloat(editForm.interestAmount) || c.interestAmount,
      totalAmount: (parseFloat(editForm.principalAmount) || c.principalAmount) + (parseFloat(editForm.interestAmount) || c.interestAmount),
    } : c));
    setEditSaving(false);
    setEditCase(null);
    showToast(`${editCase.caseNumber} dosyası güncellendi`);
  };

  const handleBulkAction = async (action: string) => {
    setBulkLoading(action);
    await new Promise(r => setTimeout(r, 1200));
    const count = selectedCases.length;
    if (action === 'uyap') {
      showToast(`${count} dosya için UYAP sorgusu başlatıldı`);
    } else if (action === 'sms') {
      showToast(`${count} borçluya SMS hatırlatması gönderildi`);
    } else if (action === 'delete') {
      setCases(prev => prev.filter(c => !selectedCases.includes(c.id)));
      setTotal(prev => prev - count);
      showToast(`${count} dosya silindi`);
    }
    setSelectedCases([]);
    setBulkLoading(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Dosya Takibi" subtitle="Tüm icra dosyalarını yönetin" />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Sorgulama Paneli */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900">Sorgulama</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Dışa Aktar</span>
                </button>
                <button
                  onClick={openNewCaseModal}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Dosya</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              {/* Sorgu Kriteri Seç */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sorgu Kriteri Seç</label>
                <select
                  value={queryCriteria}
                  onChange={(e) => setQueryCriteria(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="borclu_adi">Borçlu Adı</option>
                  <option value="borclu_tc">TCKN</option>
                  <option value="dosya_no">Dosya Numarası</option>
                  <option value="foy_no">Föy Numarası</option>
                  <option value="alacakli">Alacaklı / Müvekkil Adı</option>
                  <option value="icra_dairesi">İcra Müdürlüğü</option>
                  <option value="dosya_durumu">Dosya Durumu</option>
                  <option value="takip_turu">Takip Türü</option>
                  <option value="klasor_no">Klasör Numarası</option>
                  <option value="sistem_no">Sistem No</option>
                  <option value="talimat_no">Talimat No</option>
                  <option value="talimat_mudurlugu">Talimat Müdürlüğü</option>
                  <option value="takip_acilis">Takip Açılış Tarihi</option>
                  <option value="hazirlayan">Takibi Hazırlayan Kullanıcı</option>
                </select>
              </div>

              {/* Sorgulanan Kelime */}
              <div className="flex-[2] min-w-[280px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sorgulanan Kelime</label>
                {queryCriteria === 'dosya_durumu' ? (
                  <select
                    value={queryValue}
                    onChange={(e) => setQueryValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="pending">Beklemede</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="warning">Dikkat</option>
                  </select>
                ) : queryCriteria === 'takip_turu' ? (
                  <select
                    value={queryValue}
                    onChange={(e) => setQueryValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Tüm Türler</option>
                    <option value="ilamsiz">İlamsız</option>
                    <option value="ilamli">İlamlı</option>
                    <option value="kambiyo">Kambiyo</option>
                  </select>
                ) : queryCriteria === 'takip_acilis' ? (
                  <input
                    type="date"
                    value={queryValue}
                    onChange={(e) => setQueryValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <input
                    type="text"
                    value={queryValue}
                    onChange={(e) => setQueryValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearchInput(queryValue);
                        if (queryCriteria === 'dosya_durumu') setStatusFilter(queryValue);
                        const criteriaLabels: Record<string, string> = {
                          borclu_adi: 'Borçlu Adı', borclu_tc: 'TCKN', dosya_no: 'Dosya No', foy_no: 'Föy No',
                          alacakli: 'Alacaklı', icra_dairesi: 'İcra Müdürlüğü', dosya_durumu: 'Durum',
                          takip_turu: 'Takip Türü', klasor_no: 'Klasör No', sistem_no: 'Sistem No',
                          talimat_no: 'Talimat No', talimat_mudurlugu: 'Talimat Müdürlüğü',
                          takip_acilis: 'Açılış Tarihi', hazirlayan: 'Hazırlayan',
                        };
                        if (queryValue.trim()) {
                          setActiveFilters(prev => [...prev.filter(f => f.criteria !== queryCriteria), { criteria: queryCriteria, value: queryValue, label: criteriaLabels[queryCriteria] || queryCriteria }]);
                        }
                        setPage(1);
                      }
                    }}
                    placeholder="Sorgulanacak içeriği giriniz..."
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                )}
              </div>

              {/* Sorgula Butonu */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSearchInput(queryValue);
                    if (queryCriteria === 'dosya_durumu') setStatusFilter(queryValue);
                    else if (queryCriteria === 'takip_turu') setStatusFilter('');
                    const criteriaLabels: Record<string, string> = {
                      borclu_adi: 'Borçlu Adı', borclu_tc: 'TCKN', dosya_no: 'Dosya No', foy_no: 'Föy No',
                      alacakli: 'Alacaklı', icra_dairesi: 'İcra Müdürlüğü', dosya_durumu: 'Durum',
                      takip_turu: 'Takip Türü', klasor_no: 'Klasör No', sistem_no: 'Sistem No',
                      talimat_no: 'Talimat No', talimat_mudurlugu: 'Talimat Müdürlüğü',
                      takip_acilis: 'Açılış Tarihi', hazirlayan: 'Hazırlayan',
                    };
                    if (queryValue.trim()) {
                      setActiveFilters(prev => [...prev.filter(f => f.criteria !== queryCriteria), { criteria: queryCriteria, value: queryValue, label: criteriaLabels[queryCriteria] || queryCriteria }]);
                    }
                    setPage(1);
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-blue-700 transition-all shadow-md shadow-indigo-500/25"
                >
                  <Search className="w-4 h-4" />
                  Sorgula
                </button>
                {(activeFilters.length > 0 || searchInput || statusFilter) && (
                  <button
                    onClick={() => {
                      setQueryValue('');
                      setSearchInput('');
                      setStatusFilter('');
                      setActiveFilters([]);
                      setPage(1);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Temizle
                  </button>
                )}
              </div>
            </div>

            {/* Aktif Filtreler */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Aktif Filtreler:</span>
                {activeFilters.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium">
                    <span className="text-indigo-500">{f.label}:</span> {f.value}
                    <button
                      onClick={() => {
                        setActiveFilters(prev => prev.filter((_, idx) => idx !== i));
                        if (activeFilters.length === 1) {
                          setSearchInput('');
                          setStatusFilter('');
                        }
                        setPage(1);
                      }}
                      className="ml-0.5 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Actions */}
        {selectedCases.length > 0 && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <span className="text-sm font-medium text-blue-700">
              {selectedCases.length} dosya seçildi
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('uyap')}
                disabled={bulkLoading !== null}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {bulkLoading === 'uyap' && <Loader2 className="w-3 h-3 animate-spin" />}
                Toplu UYAP Sorgusu
              </button>
              <button
                onClick={() => handleBulkAction('sms')}
                disabled={bulkLoading !== null}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {bulkLoading === 'sms' && <Loader2 className="w-3 h-3 animate-spin" />}
                SMS Gönder
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkLoading !== null}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {bulkLoading === 'delete' && <Loader2 className="w-3 h-3 animate-spin" />}
                Sil
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-slate-500">Yükleniyor...</span>
            </div>
          ) : cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText className="w-12 h-12 mb-3" />
              <p className="text-lg font-medium">Dosya bulunamadı</p>
              <p className="text-sm mt-1">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedCases.length === cases.length && cases.length > 0}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left">
                        <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 uppercase tracking-wider hover:text-slate-900">
                          Dosya No
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Borçlu</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Alacaklı</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Toplam Tutar</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tür</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">İcra Dairesi</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cases.map((c) => (
                      <tr 
                        key={c.id} 
                        className={clsx(
                          'hover:bg-slate-50 transition-colors',
                          selectedCases.includes(c.id) && 'bg-blue-50'
                        )}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedCases.includes(c.id)}
                            onChange={() => toggleSelect(c.id)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-900">{c.caseNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{c.debtor.firstName} {c.debtor.lastName}</p>
                            <p className="text-xs text-slate-500">{formatDate(c.openDate)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{c.creditor.name}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{formatCurrency(c.totalAmount)}</p>
                            <p className="text-xs text-slate-500">
                              Ana: {formatCurrency(c.principalAmount)} | Faiz: {formatCurrency(c.interestAmount)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                            typeConfig[c.caseType] || 'bg-slate-100 text-slate-700'
                          )}>
                            {typeLabels[c.caseType] || c.caseType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            'inline-flex px-2.5 py-1 rounded-full text-xs font-medium',
                            statusConfig[c.status as keyof typeof statusConfig]?.color || 'bg-slate-100 text-slate-700'
                          )}>
                            {statusConfig[c.status as keyof typeof statusConfig]?.label || c.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{c.court.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <a href={`/cases/${c.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => openEditModal(c)}
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(c.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}</span> / <span>{total.toLocaleString()}</span> dosya
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={clsx(
                          'px-3 py-1.5 text-sm font-medium rounded-lg',
                          page === pageNum ? 'text-white bg-blue-600' : 'text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-slate-400">...</span>}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Dosyayı Sil</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">Bu dosyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Yeni Dosya Oluştur</h3>
                <button onClick={() => setShowNewCaseModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{createError}</div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosya Numarası *</label>
                  <input
                    type="text"
                    placeholder="2024/1250"
                    value={newCaseForm.caseNumber}
                    onChange={e => setNewCaseForm(f => ({ ...f, caseNumber: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Föy Numarası</label>
                  <input
                    type="text"
                    placeholder="Y101"
                    value={newCaseForm.foyNumber}
                    onChange={e => setNewCaseForm(f => ({ ...f, foyNumber: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Borçlu *</label>
                <select
                  value={newCaseForm.debtorId}
                  onChange={e => setNewCaseForm(f => ({ ...f, debtorId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Borçlu seçin...</option>
                  {lookups?.debtors.map(d => (
                    <option key={d.id} value={d.id}>{d.firstName} {d.lastName} - {d.tcNo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alacaklı *</label>
                <select
                  value={newCaseForm.creditorId}
                  onChange={e => setNewCaseForm(f => ({ ...f, creditorId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Alacaklı seçin...</option>
                  {lookups?.creditors.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">İcra Dairesi *</label>
                <select
                  value={newCaseForm.courtId}
                  onChange={e => setNewCaseForm(f => ({ ...f, courtId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">İcra dairesi seçin...</option>
                  {lookups?.courts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.city}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ana Para (₺) *</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={newCaseForm.principalAmount}
                    onChange={e => setNewCaseForm(f => ({ ...f, principalAmount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Faiz (₺)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCaseForm.interestAmount}
                    onChange={e => setNewCaseForm(f => ({ ...f, interestAmount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dosya Türü</label>
                  <select
                    value={newCaseForm.caseType}
                    onChange={e => setNewCaseForm(f => ({ ...f, caseType: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ilamsiz">İlamsız</option>
                    <option value="ilamli">İlamlı</option>
                    <option value="kambiyo">Kambiyo</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleCreateCase}
                disabled={creating}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Dosya Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Case Modal */}
      {editCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Dosya Düzenle - {editCase.caseNumber}</h3>
                <button onClick={() => setEditCase(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Durum</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(statusConfig).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ana Para (₺)</label>
                <input
                  type="number"
                  value={editForm.principalAmount}
                  onChange={e => setEditForm(f => ({ ...f, principalAmount: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Faiz (₺)</label>
                <input
                  type="number"
                  value={editForm.interestAmount}
                  onChange={e => setEditForm(f => ({ ...f, interestAmount: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setEditCase(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                İptal
              </button>
              <button
                onClick={handleEditSave}
                disabled={editSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={clsx(
          'fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all',
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        )}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
