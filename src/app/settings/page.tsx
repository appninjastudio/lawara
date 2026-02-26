'use client';

import Header from '@/components/Header';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const settingsTabs = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'company', label: 'Şirket Bilgileri', icon: Building2 },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
  { id: 'security', label: 'Güvenlik', icon: Shield },
  { id: 'appearance', label: 'Görünüm', icon: Palette },
  { id: 'data', label: 'Veri Yönetimi', icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    uyapUpdates: true,
    paymentReminders: true,
    weeklyReport: true,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: 'Talip Furkan Doğan', email: 'talipfurkan@lawara.co', phone: '+90 532 123 45 67', location: 'İstanbul, Türkiye' });
  const [companyForm, setCompanyForm] = useState({ name: 'Lawara Hukuk Bürosu', taxNo: '1234567890', taxOffice: 'Beşiktaş', address: 'Levent Mah. Büyükdere Cad. No:123 Kat:5 Beşiktaş/İstanbul' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light');
  const [sessions, setSessions] = useState([
    { id: 1, device: 'MacBook Pro - Chrome', location: 'İstanbul, Türkiye • Şu an aktif', isCurrent: true },
    { id: 2, device: 'iPhone 14 - Safari', location: 'İstanbul, Türkiye • 2 saat önce', isCurrent: false },
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (section: string) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    showToast(`${section} başarıyla kaydedildi`);
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.current || !passwordForm.newPass) return;
    if (passwordForm.newPass !== passwordForm.confirm) {
      showToast('Şifreler eşleşmiyor', 'error');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      showToast('Şifre en az 6 karakter olmalı', 'error');
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setPasswordForm({ current: '', newPass: '', confirm: '' });
    showToast('Şifre başarıyla güncellendi');
  };

  const handleBackup = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setSaving(false);
    showToast('Yedekleme tamamlandı - lawara-backup-' + new Date().toISOString().slice(0, 10) + '.db');
  };

  const handleExport = () => {
    const data = { exportDate: new Date().toISOString(), cases: 25, transactions: 30, commitments: 5 };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lawara-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Veriler dışa aktarıldı');
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Ayarlar" subtitle="Sistem ve kullanıcı ayarları" />
      
      <div className="flex-1 p-6">
        <div className="flex gap-6 h-full">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
              {settingsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-auto">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Profil Bilgileri</h2>
                  <p className="text-sm text-slate-500 mt-1">Kişisel bilgilerinizi güncelleyin</p>
                </div>

                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white">
                      TF
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Talip Furkan Doğan</h3>
                    <p className="text-sm text-slate-500">Administrator</p>
                    <p className="text-sm text-blue-600 mt-1">talipfurkan@lawara.co</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Konum</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleSave('Profil bilgileri')}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Şirket Bilgileri</h2>
                  <p className="text-sm text-slate-500 mt-1">Hukuk bürosu bilgilerini yönetin</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Büro Adı</label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vergi No</label>
                    <input
                      type="text"
                      value={companyForm.taxNo}
                      onChange={e => setCompanyForm(f => ({ ...f, taxNo: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Vergi Dairesi</label>
                    <input
                      type="text"
                      value={companyForm.taxOffice}
                      onChange={e => setCompanyForm(f => ({ ...f, taxOffice: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Adres</label>
                    <textarea
                      rows={3}
                      value={companyForm.address}
                      onChange={e => setCompanyForm(f => ({ ...f, address: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => handleSave('Şirket bilgileri')}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Bildirim Ayarları</h2>
                  <p className="text-sm text-slate-500 mt-1">Bildirim tercihlerinizi yönetin</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Bildirim Kanalları</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'email', label: 'E-posta Bildirimleri', desc: 'Önemli güncellemeler e-posta ile gönderilsin' },
                        { key: 'sms', label: 'SMS Bildirimleri', desc: 'Acil durumlar için SMS gönderilsin' },
                        { key: 'push', label: 'Push Bildirimleri', desc: 'Tarayıcı bildirimleri aktif olsun' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                            className={clsx(
                              'w-12 h-6 rounded-full transition-colors relative',
                              notifications[item.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-300'
                            )}
                          >
                            <span className={clsx(
                              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                              notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Bildirim Türleri</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'uyapUpdates', label: 'UYAP Güncellemeleri', desc: 'Dosya durumu değişikliklerinde bildirim al' },
                        { key: 'paymentReminders', label: 'Ödeme Hatırlatmaları', desc: 'Yaklaşan ödemeler için hatırlatma' },
                        { key: 'weeklyReport', label: 'Haftalık Rapor', desc: 'Her hafta özet rapor gönderilsin' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                            className={clsx(
                              'w-12 h-6 rounded-full transition-colors relative',
                              notifications[item.key as keyof typeof notifications] ? 'bg-blue-600' : 'bg-slate-300'
                            )}
                          >
                            <span className={clsx(
                              'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                              notifications[item.key as keyof typeof notifications] ? 'left-7' : 'left-1'
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Güvenlik Ayarları</h2>
                  <p className="text-sm text-slate-500 mt-1">Hesap güvenliğinizi yönetin</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Şifre Değiştir</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mevcut Şifre</label>
                        <input
                          type="password"
                          value={passwordForm.current}
                          onChange={e => setPasswordForm(f => ({ ...f, current: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Yeni Şifre</label>
                        <input
                          type="password"
                          value={passwordForm.newPass}
                          onChange={e => setPasswordForm(f => ({ ...f, newPass: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Yeni Şifre (Tekrar)</label>
                        <input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Şifreyi Güncelle
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">İki Faktörlü Doğrulama</h3>
                        <p className="text-xs text-slate-500 mt-1">{twoFAEnabled ? 'Aktif - Hesabınız korunuyor' : 'Hesabınıza ekstra güvenlik katmanı ekleyin'}</p>
                      </div>
                      <button
                        onClick={() => { setTwoFAEnabled(!twoFAEnabled); showToast(twoFAEnabled ? '2FA devre dışı bırakıldı' : '2FA etkinleştirildi'); }}
                        className={clsx('px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors', twoFAEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700')}
                      >
                        {twoFAEnabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Aktif Oturumlar</h3>
                    <p className="text-xs text-slate-500 mb-4">Hesabınıza bağlı cihazları yönetin</p>
                    <div className="space-y-2">
                      {sessions.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{s.device}</p>
                            <p className="text-xs text-slate-500">{s.location}</p>
                          </div>
                          {s.isCurrent ? (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Bu cihaz</span>
                          ) : (
                            <button
                              onClick={() => { setSessions(prev => prev.filter(x => x.id !== s.id)); showToast('Oturum sonlandırıldı'); }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium"
                            >Sonlandır</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Görünüm Ayarları</h2>
                  <p className="text-sm text-slate-500 mt-1">Arayüz tercihlerinizi özelleştirin</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Tema</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'light', label: 'Açık', bg: 'bg-white border border-slate-200' },
                        { id: 'dark', label: 'Koyu', bg: 'bg-slate-900' },
                        { id: 'system', label: 'Sistem', bg: 'bg-gradient-to-r from-white to-slate-900' },
                      ].map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => { setSelectedTheme(theme.id); showToast(`${theme.label} tema seçildi`); }}
                          className={clsx('p-4 bg-white rounded-xl text-center transition-colors', selectedTheme === theme.id ? 'border-2 border-blue-500' : 'border border-slate-200 hover:border-slate-300')}
                        >
                          <div className={clsx('w-full h-12 rounded-lg mb-2', theme.bg)}></div>
                          <span className="text-sm font-medium text-slate-900">{theme.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Dil</h3>
                    <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Türkçe</option>
                      <option>English</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Veri Yönetimi</h2>
                  <p className="text-sm text-slate-500 mt-1">Verilerinizi yedekleyin ve yönetin</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Veri Yedekleme</h3>
                        <p className="text-xs text-slate-500 mt-1">Son yedekleme: 15.01.2024 03:00</p>
                      </div>
                      <button
                        onClick={handleBackup}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Şimdi Yedekle
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Veri Dışa Aktarma</h3>
                        <p className="text-xs text-slate-500 mt-1">Tüm verilerinizi CSV/Excel formatında indirin</p>
                      </div>
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Dışa Aktar
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-red-900">Hesabı Sil</h3>
                        <p className="text-xs text-red-700 mt-1">Bu işlem geri alınamaz. Tüm verileriniz silinecektir.</p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Hesabı Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Delete Account Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Database className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Hesabı Sil</h3>
            </div>
            <p className="text-sm text-slate-600 mb-2">Bu işlem geri alınamaz. Aşağıdaki veriler kalıcı olarak silinecektir:</p>
            <ul className="text-sm text-slate-600 mb-6 space-y-1 ml-4">
              <li>• 25 icra dosyası</li>
              <li>• 30 işlem kaydı</li>
              <li>• 5 taahhüt</li>
              <li>• Tüm notlar ve bildirimler</li>
            </ul>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); showToast('Demo modunda hesap silinemez', 'error'); }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Kalıcı Olarak Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={clsx(
          'fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-sm font-medium z-50',
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        )}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
