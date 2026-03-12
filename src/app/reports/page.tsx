'use client';

import Header from '@/components/Header';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, PieChart,
  Calendar, FileText, Download, Filter, ArrowRight, Users,
  Building2, AlertTriangle, CheckCircle2, XCircle, Clock,
  Percent, HandCoins, Scale, Briefcase, X, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const formatCurrency = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 }).format(n);
const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

const monthlyData = [
  { month: 'Oca', gelir: 245000, gider: 18000, tahsilat: 12 },
  { month: 'Şub', gelir: 312000, gider: 22000, tahsilat: 18 },
  { month: 'Mar', gelir: 198000, gider: 15000, tahsilat: 9 },
  { month: 'Nis', gelir: 425000, gider: 28000, tahsilat: 24 },
  { month: 'May', gelir: 367000, gider: 21000, tahsilat: 20 },
  { month: 'Haz', gelir: 289000, gider: 19000, tahsilat: 15 },
  { month: 'Tem', gelir: 456000, gider: 31000, tahsilat: 28 },
  { month: 'Ağu', gelir: 334000, gider: 24000, tahsilat: 19 },
  { month: 'Eyl', gelir: 512000, gider: 35000, tahsilat: 32 },
  { month: 'Eki', gelir: 398000, gider: 27000, tahsilat: 22 },
  { month: 'Kas', gelir: 478000, gider: 33000, tahsilat: 27 },
  { month: 'Ara', gelir: 523000, gider: 38000, tahsilat: 35 },
];

const alacakliPerf = [
  { name: 'ABC Bankası', dosya: 45, tahsilat: 1250000, oran: 68, risk: 'düşük' },
  { name: 'XYZ Finans', dosya: 32, tahsilat: 890000, oran: 55, risk: 'orta' },
  { name: 'DEF Leasing', dosya: 28, tahsilat: 720000, oran: 42, risk: 'orta' },
  { name: 'GHI Bankası', dosya: 18, tahsilat: 1560000, oran: 78, risk: 'düşük' },
  { name: 'JKL Faktoring', dosya: 12, tahsilat: 340000, oran: 35, risk: 'yüksek' },
];

const dosyaDurum = [
  { durum: 'Aktif', sayi: 87, renk: 'bg-blue-500', oran: 45 },
  { durum: 'Beklemede', sayi: 34, renk: 'bg-amber-500', oran: 17 },
  { durum: 'Tamamlanan', sayi: 52, renk: 'bg-emerald-500', oran: 27 },
  { durum: 'İhlal', sayi: 21, renk: 'bg-red-500', oran: 11 },
];

const taahhutRapor = [
  { dosya: '2024/1234', borclu: 'Ahmet Yılmaz', tutar: 125000, taksit: '4/6', durum: 'active', gecikme: 0, risk: 32 },
  { dosya: '2024/1235', borclu: 'Mehmet Demir', tutar: 89000, taksit: '2/8', durum: 'violated', gecikme: 45, risk: 85 },
  { dosya: '2024/1236', borclu: 'Fatma Kaya', tutar: 45000, taksit: '6/6', durum: 'completed', gecikme: 0, risk: 0 },
  { dosya: '2024/1237', borclu: 'Ali Öztürk', tutar: 230000, taksit: '1/12', durum: 'active', gecikme: 12, risk: 58 },
  { dosya: '2024/1238', borclu: 'Ayşe Çelik', tutar: 67000, taksit: '3/4', durum: 'active', gecikme: 0, risk: 15 },
  { dosya: '2024/1239', borclu: 'Hasan Arslan', tutar: 72000, taksit: '0/6', durum: 'violated', gecikme: 90, risk: 95 },
  { dosya: '2024/1240', borclu: 'Zeynep Koç', tutar: 185000, taksit: '5/10', durum: 'active', gecikme: 5, risk: 28 },
];

const hacizOzet = [
  { tur: 'Banka Haczi (89/1)', basarili: 24, beklemede: 8, toplam: 32 },
  { tur: 'Araç Haczi', basarili: 15, beklemede: 5, toplam: 20 },
  { tur: 'Gayrimenkul Haczi', basarili: 7, beklemede: 3, toplam: 10 },
  { tur: 'Maaş Haczi', basarili: 18, beklemede: 12, toplam: 30 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'genel' | 'dosya' | 'taahut' | 'haciz'>('genel');
  const [dateRange, setDateRange] = useState('bu_ay');
  const [exporting, setExporting] = useState(false);

  const maxGelir = Math.max(...monthlyData.map(d => d.gelir));
  const toplamGelir = monthlyData.reduce((s, d) => s + d.gelir, 0);
  const toplamGider = monthlyData.reduce((s, d) => s + d.gider, 0);
  const toplamTahsilat = monthlyData.reduce((s, d) => s + d.tahsilat, 0);

  const handleExportAll = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1000));
    const content = `LAWARA RAPORLAMA - ${new Date().toLocaleDateString('tr-TR')}\n\nToplam Gelir: ${formatCurrency(toplamGelir)}\nToplam Gider: ${formatCurrency(toplamGider)}\nNet Kar: ${formatCurrency(toplamGelir - toplamGider)}\nToplam Tahsilat: ${toplamTahsilat} dosya`;
    const ext = format === 'pdf' ? '.pdf' : '.csv';
    const mime = format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;';
    const blob = new Blob(['\uFEFF' + content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lawara_Rapor_${new Date().toISOString().slice(0, 10)}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const tabs = [
    { id: 'genel' as const, label: 'Genel Analiz', icon: BarChart3 },
    { id: 'dosya' as const, label: 'Dosya Raporları', icon: Briefcase },
    { id: 'taahut' as const, label: 'Taahhüt & İhlal', icon: HandCoins },
    { id: 'haciz' as const, label: 'Haciz Raporları', icon: Scale },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Raporlama" subtitle="Detaylı analiz ve raporlar" />
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Raporlama</h1>
            <p className="text-sm text-slate-500 mt-1">Detaylı analiz ve raporlar</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
            >
              <option value="bu_hafta">Bu Hafta</option>
              <option value="bu_ay">Bu Ay</option>
              <option value="son_3_ay">Son 3 Ay</option>
              <option value="son_6_ay">Son 6 Ay</option>
              <option value="bu_yil">Bu Yıl</option>
              <option value="tum">Tüm Zamanlar</option>
            </select>
            <button
              onClick={() => handleExportAll('excel')}
              disabled={exporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Excel
            </button>
            <button
              onClick={() => handleExportAll('pdf')}
              disabled={exporting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-icra-dark to-icra-mid text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* GENEL ANALİZ */}
        {activeTab === 'genel' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Toplam Gelir</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(toplamGelir)}</p>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +12.4% geçen aya göre</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-xl"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Toplam Gider</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(toplamGider)}</p>
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> +5.2% geçen aya göre</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-xl"><TrendingDown className="w-5 h-5 text-red-600" /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Net Kâr</p>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(toplamGelir - toplamGider)}</p>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> %{((1 - toplamGider / toplamGelir) * 100).toFixed(1)} kâr marjı</p>
                  </div>
                  <div className="p-3 bg-icra-light/15 rounded-xl"><BarChart3 className="w-5 h-5 text-icra-mid" /></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Tahsilat Sayısı</p>
                    <p className="text-xl font-bold text-slate-900 mt-1">{toplamTahsilat}</p>
                    <p className="text-xs text-icra-mid mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 261 dosya toplam</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl"><FileText className="w-5 h-5 text-blue-600" /></div>
                </div>
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Aylık Gelir & Tahsilat Trendi</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-icra-mid rounded-sm" /> Gelir</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 rounded-sm" /> Gider</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-400 rounded-full" /> Tahsilat</span>
                </div>
              </div>
              <div className="flex items-end gap-2 h-64">
                {monthlyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-52 gap-0.5 relative">
                      <div className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-emerald-600">{d.tahsilat}</span>
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-icra-dark to-icra-mid rounded-t-md transition-all hover:opacity-80"
                        style={{ height: `${(d.gelir / maxGelir) * 100}%` }}
                        title={`Gelir: ${formatCurrency(d.gelir)}`}
                      />
                      <div
                        className="w-full bg-red-400 rounded-t-sm"
                        style={{ height: `${(d.gider / maxGelir) * 100}%` }}
                        title={`Gider: ${formatCurrency(d.gider)}`}
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alacaklı Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Alacaklı Bazlı Performans</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Alacaklı</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dosya</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tahsilat</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Oran</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alacakliPerf.map((a, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" />{a.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{a.dosya}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(a.tahsilat)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className={clsx('h-full rounded-full', a.oran >= 60 ? 'bg-emerald-500' : a.oran >= 40 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${a.oran}%` }} />
                            </div>
                            <span className="text-xs font-medium text-slate-600">%{a.oran}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
                            a.risk === 'düşük' ? 'bg-emerald-100 text-emerald-700' : a.risk === 'orta' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          )}>{a.risk}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DOSYA RAPORLARI */}
        {activeTab === 'dosya' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {dosyaDurum.map((d, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-700">{d.durum}</p>
                    <span className="text-2xl font-bold text-slate-900">{d.sayi}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full', d.renk)} style={{ width: `${d.oran}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">%{d.oran} toplam dosyaların</p>
                </div>
              ))}
            </div>

            {/* Dosya Dağılımı */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Takip Türüne Göre Dağılım</h3>
                <div className="space-y-3">
                  {[
                    { tur: 'İlamsız İcra', sayi: 98, oran: 51 },
                    { tur: 'Kambiyo', sayi: 52, oran: 27 },
                    { tur: 'İlamlı İcra', sayi: 28, oran: 14 },
                    { tur: 'Kira Alacağı', sayi: 12, oran: 6 },
                    { tur: 'Diğer', sayi: 4, oran: 2 },
                  ].map((t, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-700 font-medium">{t.tur}</span>
                        <span className="text-slate-500">{t.sayi} dosya (%{t.oran})</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-icra-dark to-icra-mid rounded-full" style={{ width: `${t.oran}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">İcra Dairesi Dağılımı</h3>
                <div className="space-y-3">
                  {[
                    { daire: 'İstanbul 5. İcra Dairesi', sayi: 42, oran: 22 },
                    { daire: 'Ankara 3. İcra Dairesi', sayi: 35, oran: 18 },
                    { daire: 'İzmir 2. İcra Dairesi', sayi: 28, oran: 14 },
                    { daire: 'Bursa 1. İcra Dairesi', sayi: 22, oran: 11 },
                    { daire: 'Diğer', sayi: 67, oran: 35 },
                  ].map((d, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-700 font-medium">{d.daire}</span>
                        <span className="text-slate-500">{d.sayi} dosya</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${d.oran}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Aylık Dosya Açılış */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Aylık Dosya Açılış & Kapanış</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ay</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Açılan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kapanan</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Net</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tahsilat Oranı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyData.map((d, i) => {
                      const acilan = Math.floor(Math.random() * 15) + 5;
                      const kapanan = d.tahsilat;
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{d.month} 2024</td>
                          <td className="px-4 py-3 text-sm text-blue-600 font-medium">+{acilan}</td>
                          <td className="px-4 py-3 text-sm text-emerald-600 font-medium">-{kapanan}</td>
                          <td className="px-4 py-3 text-sm font-semibold">{acilan - kapanan > 0 ? `+${acilan - kapanan}` : acilan - kapanan}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[120px]">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((kapanan / (acilan || 1)) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">%{Math.round((kapanan / (acilan || 1)) * 100)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAAHHÜT & İHLAL */}
        {activeTab === 'taahut' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><HandCoins className="w-5 h-5 text-blue-600" /></div>
                  <div><p className="text-xs text-slate-500">Toplam Taahhüt</p><p className="text-xl font-bold text-slate-900">7</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                  <div><p className="text-xs text-slate-500">Tamamlanan</p><p className="text-xl font-bold text-emerald-600">1</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3"><div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
                  <div><p className="text-xs text-slate-500">Devam Eden</p><p className="text-xl font-bold text-amber-600">4</p></div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3"><div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
                  <div><p className="text-xs text-slate-500">İhlal Edilen</p><p className="text-xl font-bold text-red-600">2</p></div>
                </div>
              </div>
            </div>

            {/* Risk Skorlama */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Taahhüt Detay & Risk Skorlama</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dosya</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Borçlu</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tutar</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Taksit</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Gecikme</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Risk Skoru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taahhutRapor.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-icra-mid">{t.dosya}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{t.borclu}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{formatCurrency(t.tutar)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{t.taksit}</td>
                        <td className="px-4 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
                            t.durum === 'active' ? 'bg-blue-100 text-blue-700' : t.durum === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          )}>
                            {t.durum === 'active' ? 'Devam' : t.durum === 'completed' ? 'Tamamlandı' : 'İhlal'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {t.gecikme > 0 ? <span className="text-red-600 font-medium">{t.gecikme} gün</span> : <span className="text-emerald-600">Yok</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                              <div className={clsx('h-full rounded-full', t.risk >= 70 ? 'bg-red-500' : t.risk >= 40 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${t.risk}%` }} />
                            </div>
                            <span className={clsx('text-xs font-bold', t.risk >= 70 ? 'text-red-600' : t.risk >= 40 ? 'text-amber-600' : 'text-emerald-600')}>{t.risk}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gecikme Analizi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Gecikme Dağılımı</h3>
                <div className="space-y-3">
                  {[
                    { aralik: '0 gün (zamanında)', sayi: 3, oran: 43, renk: 'bg-emerald-500' },
                    { aralik: '1-30 gün', sayi: 1, oran: 14, renk: 'bg-amber-500' },
                    { aralik: '31-60 gün', sayi: 1, oran: 14, renk: 'bg-orange-500' },
                    { aralik: '60+ gün', sayi: 2, oran: 29, renk: 'bg-red-500' },
                  ].map((g, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-32 text-xs text-slate-600">{g.aralik}</div>
                      <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div className={clsx('h-full rounded-full', g.renk)} style={{ width: `${g.oran}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-700 w-16 text-right">{g.sayi} dosya</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Özeti</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span className="text-sm font-medium text-emerald-800">Düşük Risk (0-39)</span></div>
                    <span className="text-lg font-bold text-emerald-700">3</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-600" /><span className="text-sm font-medium text-amber-800">Orta Risk (40-69)</span></div>
                    <span className="text-lg font-bold text-amber-700">1</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2"><XCircle className="w-5 h-5 text-red-600" /><span className="text-sm font-medium text-red-800">Yüksek Risk (70-100)</span></div>
                    <span className="text-lg font-bold text-red-700">2</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-center">
                    <p className="text-xs text-slate-500">Ortalama Risk Skoru</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{Math.round(taahhutRapor.reduce((s, t) => s + t.risk, 0) / taahhutRapor.length)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HACİZ RAPORLARI */}
        {activeTab === 'haciz' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {hacizOzet.map((h, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-3">{h.tur}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{h.toplam}</p>
                      <p className="text-xs text-slate-500 mt-1">toplam işlem</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">{h.basarili} başarılı</p>
                      <p className="text-sm font-semibold text-amber-600">{h.beklemede} beklemede</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(h.basarili / h.toplam) * 100}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">%{Math.round((h.basarili / h.toplam) * 100)} başarı oranı</p>
                </div>
              ))}
            </div>

            {/* Haciz Detay Tablosu */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Haciz İşlem Detayları</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Dosya</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Borçlu</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Haciz Türü</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tutar</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Kurum</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { dosya: '2024/1234', borclu: 'Ahmet Yılmaz', tur: 'Banka 89/1', tutar: 45000, kurum: 'Ziraat Bankası', durum: 'success', tarih: '2024-12-15' },
                      { dosya: '2024/1235', borclu: 'Mehmet Demir', tur: 'Araç Haczi', tutar: 0, kurum: 'Trafik Sicil', durum: 'success', tarih: '2024-12-14' },
                      { dosya: '2024/1236', borclu: 'Fatma Kaya', tur: 'Maaş Haczi', tutar: 3200, kurum: 'ABC Şirketi', durum: 'pending', tarih: '2024-12-13' },
                      { dosya: '2024/1237', borclu: 'Ali Öztürk', tur: 'Banka 89/1', tutar: 12500, kurum: 'İş Bankası', durum: 'success', tarih: '2024-12-12' },
                      { dosya: '2024/1238', borclu: 'Ayşe Çelik', tur: 'Gayrimenkul', tutar: 0, kurum: 'Tapu Müdürlüğü', durum: 'pending', tarih: '2024-12-11' },
                      { dosya: '2024/1239', borclu: 'Hasan Arslan', tur: 'Banka 89/1', tutar: 0, kurum: 'Garanti Bankası', durum: 'error', tarih: '2024-12-10' },
                    ].map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-icra-mid">{h.dosya}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{h.borclu}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{h.tur}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{h.tutar > 0 ? formatCurrency(h.tutar) : '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{h.kurum}</td>
                        <td className="px-4 py-3">
                          <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium',
                            h.durum === 'success' ? 'bg-emerald-100 text-emerald-700' : h.durum === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          )}>
                            {h.durum === 'success' ? 'Başarılı' : h.durum === 'pending' ? 'Beklemede' : 'Hata'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(h.tarih)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Haciz Başarı Oranları */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Haciz Türüne Göre Başarı Oranları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hacizOzet.map((h, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-slate-800">{h.tur}</p>
                      <span className="text-lg font-bold text-icra-mid">%{Math.round((h.basarili / h.toplam) * 100)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all" style={{ width: `${(h.basarili / h.toplam) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>{h.basarili} başarılı / {h.toplam} toplam</span>
                      <span>{h.beklemede} beklemede</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
