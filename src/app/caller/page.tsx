'use client';

import Header from '@/components/Header';
import { useState } from 'react';
import clsx from 'clsx';
import { PhoneCall, PhoneOutgoing, Users, Volume2, RefreshCw, AlertTriangle, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type CallTab = 'single' | 'bulk' | 'status';

export default function CallerPage() {
  const [activeTab, setActiveTab] = useState<CallTab>('single');

  const [singlePhone, setSinglePhone] = useState('');
  const [singleTts, setSingleTts] = useState('');
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<{ success: boolean; callId?: string; message?: string; error?: string } | null>(null);

  const [bulkPhones, setBulkPhones] = useState('');
  const [bulkTts, setBulkTts] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ success: boolean; campaignId?: string; message?: string; error?: string } | null>(null);

  const [callId, setCallId] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{ success: boolean; status?: string; duration?: number; answeredAt?: string; endedAt?: string; error?: string } | null>(null);
  const [callHistory, setCallHistory] = useState<{ id: string; phone: string; status: string; time: string; duration: number }[]>([
    { id: 'CALL-1001', phone: '0532****78', status: 'answered', time: '14:32', duration: 45 },
    { id: 'CALL-1002', phone: '0545****23', status: 'no_answer', time: '14:15', duration: 0 },
    { id: 'CALL-1003', phone: '0555****90', status: 'answered', time: '13:45', duration: 62 },
    { id: 'CALL-1004', phone: '0542****45', status: 'busy', time: '13:20', duration: 0 },
    { id: 'CALL-1005', phone: '0533****67', status: 'answered', time: '12:50', duration: 38 },
  ]);

  const doSingleCall = async () => {
    if (!singlePhone.trim() || !singleTts.trim()) {
      setSingleResult({ success: false, error: 'Telefon ve TTS mesajı zorunludur' });
      return;
    }
    setSingleLoading(true);
    setSingleResult(null);
    // Mock API call
    await new Promise(r => setTimeout(r, 1500));
    const mockCallId = `CALL-${1006 + Math.floor(Math.random() * 9000)}`;
    setSingleResult({ success: true, callId: mockCallId, message: `Arama başlatıldı: ${singlePhone}` });
    setCallHistory(prev => [{ id: mockCallId, phone: singlePhone.replace(/(.{4}).*(.{2})/, '$1****$2'), status: 'answered', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), duration: Math.floor(Math.random() * 60) + 15 }, ...prev]);
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
    // Mock API call
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
    // Mock API call
    await new Promise(r => setTimeout(r, 1000));
    const historyItem = callHistory.find(c => c.id === callId);
    if (historyItem) {
      const statusMap: Record<string, string> = { answered: 'Cevaplanmış', no_answer: 'Cevaplanmamış', busy: 'Meşgul' };
      setStatusResult({
        success: true,
        status: statusMap[historyItem.status] || historyItem.status,
        duration: historyItem.duration,
        answeredAt: historyItem.duration > 0 ? `Bugün ${historyItem.time}` : undefined,
        endedAt: historyItem.duration > 0 ? `Bugün ${historyItem.time}` : undefined,
      });
    } else {
      // Generate random mock status
      const statuses = ['Cevaplanmış', 'Cevaplanmamış', 'Meşgul', 'Devam Ediyor'];
      const s = statuses[Math.floor(Math.random() * statuses.length)];
      const dur = s === 'Cevaplanmış' ? Math.floor(Math.random() * 120) + 10 : 0;
      setStatusResult({
        success: true,
        status: s,
        duration: dur,
        answeredAt: dur > 0 ? 'Bugün 14:32' : undefined,
        endedAt: dur > 0 ? 'Bugün 14:33' : undefined,
      });
    }
    setStatusLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="İcra Caller" subtitle="Borçlu arama (PBX) ve kampanya yönetimi" />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('single')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <PhoneOutgoing className="w-4 h-4" />
            Tek Arama
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'bulk' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Users className="w-4 h-4" />
            Toplu Arama
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'status' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Durum Sorgu
          </button>
        </div>

        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-icra-light/15 rounded-lg">
                  <PhoneCall className="w-5 h-5 text-icra-mid" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Tek Arama Başlat</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                  <input
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">TTS Mesajı</label>
                  <textarea
                    value={singleTts}
                    onChange={(e) => setSingleTts(e.target.value)}
                    placeholder="Sayın ... icra dosyanızda ..."
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                  />
                </div>

                <button
                  onClick={doSingleCall}
                  disabled={singleLoading}
                  className={clsx(
                    'w-full py-3 bg-gradient-to-r from-icra-dark to-icra-mid text-white font-medium rounded-xl transition-all',
                    singleLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-icra-darkest hover:to-icra-dark'
                  )}
                >
                  {singleLoading ? 'Aranıyor...' : 'Aramayı Başlat'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Sonuç</h3>
              </div>

              {singleResult ? (
                <div className="space-y-4">
                  <div className={clsx(
                    'p-4 rounded-xl border',
                    singleResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                  )}>
                    <p className={clsx(
                      'text-sm font-medium',
                      singleResult.success ? 'text-emerald-800' : 'text-red-800'
                    )}>
                      {singleResult.success ? 'Arama başlatıldı' : 'Arama başarısız'}
                    </p>
                    {singleResult.callId && (
                      <p className="text-sm text-slate-700 mt-2">Call ID: <span className="font-mono">{singleResult.callId}</span></p>
                    )}
                    {(singleResult.message || singleResult.error) && (
                      <p className="text-sm text-slate-600 mt-2">{singleResult.message || singleResult.error}</p>
                    )}
                  </div>

                  {!singleResult.success && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Konfigürasyon kontrolü</p>
                        <p className="text-sm text-amber-700 mt-1">`VERIMOR_API_ID`, `VERIMOR_API_KEY` ve opsiyonel `VERIMOR_CALLER_ID` değerlerini `.env.local` içinde tanımlayın.</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <p>Arama başlatınca burada sonuç görünecek</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Toplu Arama Başlat</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Telefon Listesi</label>
                  <textarea
                    value={bulkPhones}
                    onChange={(e) => setBulkPhones(e.target.value)}
                    placeholder="05xx...\n05xx...\nveya virgülle"
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                  />
                  <p className="text-xs text-slate-500 mt-1">Yeni satır / virgül / noktalı virgül ile ayırabilirsiniz.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">TTS Mesajı</label>
                  <textarea
                    value={bulkTts}
                    onChange={(e) => setBulkTts(e.target.value)}
                    placeholder="Sayın ... icra dosyanızda ..."
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                  />
                </div>

                <button
                  onClick={doBulkCall}
                  disabled={bulkLoading}
                  className={clsx(
                    'w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl transition-all',
                    bulkLoading ? 'opacity-70 cursor-not-allowed' : 'hover:from-violet-700 hover:to-purple-700'
                  )}
                >
                  {bulkLoading ? 'Kampanya başlatılıyor...' : 'Toplu Aramayı Başlat'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Sonuç</h3>

              {bulkResult ? (
                <div className={clsx(
                  'p-4 rounded-xl border',
                  bulkResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                )}>
                  <p className={clsx(
                    'text-sm font-medium',
                    bulkResult.success ? 'text-emerald-800' : 'text-red-800'
                  )}>
                    {bulkResult.success ? 'Kampanya başlatıldı' : 'Kampanya başarısız'}
                  </p>
                  {bulkResult.campaignId && (
                    <p className="text-sm text-slate-700 mt-2">Campaign ID: <span className="font-mono">{bulkResult.campaignId}</span></p>
                  )}
                  {(bulkResult.message || bulkResult.error) && (
                    <p className="text-sm text-slate-600 mt-2">{bulkResult.message || bulkResult.error}</p>
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <p>Toplu arama başlatınca burada sonuç görünecek</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Arama Durumu</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Call ID</label>
                  <input
                    value={callId}
                    onChange={(e) => setCallId(e.target.value)}
                    placeholder="call_id"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-icra-mid"
                  />
                </div>

                <button
                  onClick={doStatusCheck}
                  disabled={statusLoading}
                  className={clsx(
                    'w-full py-3 bg-slate-900 text-white font-medium rounded-xl transition-all',
                    statusLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-800'
                  )}
                >
                  {statusLoading ? 'Sorgulanıyor...' : 'Durumu Sorgula'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Sonuç</h3>

              {statusResult ? (
                <div className={clsx(
                  'p-4 rounded-xl border',
                  statusResult.success ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'
                )}>
                  <p className="text-sm font-medium text-slate-900">
                    {statusResult.success ? `Durum: ${statusResult.status}` : 'Sorgu başarısız'}
                  </p>
                  {statusResult.duration !== undefined && (
                    <p className="text-sm text-slate-600 mt-2">Süre: {statusResult.duration}s</p>
                  )}
                  {statusResult.answeredAt && (
                    <p className="text-sm text-slate-600 mt-1">Cevaplandı: {statusResult.answeredAt}</p>
                  )}
                  {statusResult.endedAt && (
                    <p className="text-sm text-slate-600 mt-1">Bitti: {statusResult.endedAt}</p>
                  )}
                  {statusResult.error && (
                    <p className="text-sm text-red-700 mt-2">{statusResult.error}</p>
                  )}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <p>Call ID girip sorgulayın</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Arama Geçmişi</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Call ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Telefon</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Saat</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Süre</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {callHistory.map(call => (
                <tr key={call.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-mono text-icra-mid cursor-pointer" onClick={() => { setCallId(call.id); setActiveTab('status'); }}>
                    {call.id}
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">{call.phone}</td>
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
