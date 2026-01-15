
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import DailyBudget from './components/DailyBudget';
import MonthlySummary from './components/MonthlySummary';
import DebtSystem from './components/DebtSystem';
import Settings from './components/Settings';
import { loadState, saveState } from './services/store';
import { AppState, DailyRecord, Client, DebtTransaction, UserProfile, WhatsAppTemplates } from './types';
import { LogIn, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeTab, setActiveTab] = useState('daily');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', mobile: '' });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) return;
    setState(prev => ({ ...prev, isLoggedIn: true, profile: { ...prev.profile, email: authForm.email, mobile: authForm.mobile } }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, isLoggedIn: false }));
  };

  const handleSaveDaily = (record: DailyRecord) => {
    setState(prev => ({
      ...prev,
      dailyRecords: [...prev.dailyRecords, record]
    }));
  };

  const handleDeleteDaily = (id: string) => {
    setState(prev => ({
      ...prev,
      dailyRecords: prev.dailyRecords.filter(r => r.id !== id)
    }));
  };

  const handleAddClient = (client: Client) => {
    setState(prev => ({
      ...prev,
      clients: [...prev.clients, client]
    }));
  };

  const handleAddDebtTransaction = (clientId: string, transaction: DebtTransaction) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            balance: c.balance + transaction.amount,
            transactions: [...c.transactions, transaction]
          };
        }
        return c;
      })
    }));
  };

  const handleDeleteClient = (id: string) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== id)
    }));
  };

  const updateProfile = (profile: UserProfile) => setState(prev => ({ ...prev, profile }));
  const updateTemplates = (templates: WhatsAppTemplates) => setState(prev => ({ ...prev, templates }));

  const formatMessage = (template: string, data: any) => {
    let msg = template;
    const map: any = {
      '{{اسم_المكتب}}': state.profile.officeName,
      '{{التاريخ}}': data.date || new Date().toLocaleDateString('ar-SA'),
      '{{الكاش}}': data.cash || 0,
      '{{الشبكة}}': data.network || 0,
      '{{التحويل}}': data.transfer || 0,
      '{{السحبيات}}': data.withdrawals || 0,
      '{{إجمالي_الدرج}}': data.drawerCash || 0,
      '{{إجمالي_الدخل}}': (data.cash + data.network + data.transfer) || 0,
      '{{اسم_العميل}}': data.clientName || '',
      '{{رصيد_الدين}}': data.balance || 0,
    };
    Object.keys(map).forEach(key => {
      msg = msg.replace(new RegExp(key, 'g'), map[key]);
    });
    return msg;
  };

  const handleShareWhatsApp = (record: DailyRecord) => {
    const text = formatMessage(state.templates.daily, record);
    const url = `https://wa.me/${state.profile.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!state.isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" dir="rtl">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-blue-600">موازنة</h1>
            <p className="text-slate-400 font-medium">نظام الإدارة المالية الذكي</p>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              تسجيل دخول
            </button>
            <button 
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${authMode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <input
                required
                type="email"
                placeholder="البريد الإلكتروني"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                value={authForm.email}
                onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
              />
              {authMode === 'register' && (
                <input
                  type="tel"
                  placeholder="رقم الجوال"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                  value={authForm.mobile}
                  onChange={e => setAuthForm({ ...authForm, mobile: e.target.value })}
                />
              )}
              <input
                required
                type="password"
                placeholder="كلمة المرور"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500"
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              {authMode === 'login' ? 'دخول' : 'إنشاء حساب'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return (
          <DailyBudget
            records={state.dailyRecords}
            onSave={handleSaveDaily}
            onDelete={handleDeleteDaily}
            onShareWhatsApp={handleShareWhatsApp}
            onGeneratePDF={(r) => alert('سيتم تصدير PDF للموازنة: ' + r.date)}
          />
        );
      case 'monthly':
        return <MonthlySummary records={state.dailyRecords} />;
      case 'debts':
        return (
          <DebtSystem
            clients={state.clients}
            onAddClient={handleAddClient}
            onAddTransaction={handleAddDebtTransaction}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'settings':
        return (
          <Settings
            profile={state.profile}
            templates={state.templates}
            onUpdateProfile={updateProfile}
            onUpdateTemplates={updateTemplates}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
};

export default App;
