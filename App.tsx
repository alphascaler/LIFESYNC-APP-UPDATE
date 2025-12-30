
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Zap, 
  ListTodo, 
  BookOpen, 
  LayoutDashboard,
  Mic,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Settings,
  Download
} from 'lucide-react';
import { Tab, Task, Habit, JournalEntry, AppState } from './types';
import Dashboard from './components/Dashboard';
import Habits from './components/Habits';
import Tasks from './components/Tasks';
import Journal from './components/Journal';
import System from './components/System';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // App State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [journals, setJournals] = useState<Record<string, JournalEntry>>({});
  const [history, setHistory] = useState<Record<string, number>>({});
  const [dailyPriority, setDailyPriority] = useState<AppState['dailyPriority']>(undefined);

  const todayKey = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    // Detection
    setIsInIframe(window.self !== window.top);
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true
    );

    const savedData = localStorage.getItem('lifesync_v4_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData) as AppState;
        setTasks(parsed.tasks || []);
        setHabits(parsed.habits || []);
        setJournals(parsed.journals || {});
        setHistory(parsed.history || {});
        setDailyPriority(parsed.dailyPriority);
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    setTimeout(() => setIsInitializing(false), 1500);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      const data: AppState = { tasks, habits, journals, history, dailyPriority };
      localStorage.setItem('lifesync_v4_data', JSON.stringify(data));
    }
  }, [tasks, habits, journals, history, dailyPriority, isInitializing]);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const input = document.createElement('textarea');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleTab = (tab: Tab) => {
    if ("vibrate" in navigator) navigator.vibrate(10);
    setActiveTab(tab);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center text-white">
        <Zap className="w-16 h-16 fill-white animate-pulse" />
        <h1 className="text-4xl font-extrabold tracking-tighter mt-4 uppercase italic">LifeSync</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200">
      
      {/* MOBILE BREAKOUT BANNER */}
      {isInIframe && !isStandalone && activeTab !== 'system' && (
        <div className="bg-slate-900 p-4 border-b border-slate-800 z-[60]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Mobile Install Helper</p>
              <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Breakout of the editor to install properly.</p>
            </div>
            <button 
              onClick={() => setActiveTab('system')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg"
            >
              Get App/APK
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 p-6 safe-top sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 rotate-3">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">LifeSync</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {activeTab.toUpperCase()} MODE
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('system')}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${activeTab === 'system' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {activeTab === 'dashboard' && (
          <Dashboard 
            tasks={tasks} 
            habits={habits} 
            history={history}
            dailyPriority={dailyPriority}
            setDailyPriority={setDailyPriority}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'habits' && (
          <Habits 
            habits={habits} 
            setHabits={setHabits} 
            setHistory={setHistory}
          />
        )}
        {activeTab === 'tasks' && (
          <Tasks 
            tasks={tasks} 
            setTasks={setTasks} 
          />
        )}
        {activeTab === 'journal' && (
          <Journal 
            journals={journals} 
            setJournals={setJournals} 
            todayKey={todayKey}
          />
        )}
        {activeTab === 'system' && (
          <System 
            appState={{ tasks, habits, journals, history, dailyPriority }}
            onCopy={handleCopy}
            copied={copied}
          />
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 safe-bottom px-6 pt-3 pb-5 flex justify-between items-center z-50 max-w-lg mx-auto">
        <NavButton 
          active={activeTab === 'dashboard'} 
          icon={<LayoutDashboard className="w-6 h-6" />} 
          label="Home" 
          onClick={() => toggleTab('dashboard')} 
        />
        <NavButton 
          active={activeTab === 'habits'} 
          icon={<Zap className="w-6 h-6" />} 
          label="Habits" 
          onClick={() => toggleTab('habits')} 
        />
        <NavButton 
          active={activeTab === 'tasks'} 
          icon={<ListTodo className="w-6 h-6" />} 
          label="Tasks" 
          onClick={() => toggleTab('tasks')} 
        />
        <NavButton 
          active={activeTab === 'journal'} 
          icon={<BookOpen className="w-6 h-6" />} 
          label="Log" 
          onClick={() => toggleTab('journal')} 
        />
        <NavButton 
          active={activeTab === 'system'} 
          icon={<Settings className="w-6 h-6" />} 
          label="System" 
          onClick={() => toggleTab('system')} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ 
  active: boolean; 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
}> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-1 transition-all group flex-1"
  >
    <div className={`
      w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
      ${active 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-slate-400 group-hover:text-slate-600'
      }
    `}>
      {icon}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
      active ? 'text-indigo-600' : 'text-slate-400'
    }`}>
      {label}
    </span>
  </button>
);

export default App;
