
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
  LayoutDashboard,
  Activity,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
  baseIncome: number;
  currentDate: Date;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const ganhos = payload.find((p: any) => p.dataKey === 'ganhos')?.value || 0;
    const gastos = payload.find((p: any) => p.dataKey === 'gastos')?.value || 0;
    const saldo = ganhos - gastos;

    return (
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 border-b border-neutral-800 pb-2 text-left">{label}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Ganhos</span>
            </div>
            <span className="text-xs font-black text-emerald-400">R$ {ganhos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center justify-between space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Gastos</span>
            </div>
            <span className="text-xs font-black text-primary">R$ {gastos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Saldo</span>
            <span className={`text-xs font-black ${saldo >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              R$ {saldo.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const Analytics: React.FC<AnalyticsProps> = ({ 
  transactions, 
  baseIncome, 
  currentDate,
  onMonthChange
}) => {
  const monthLabel = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();

  const { chartData, currentHealthScore } = useMemo(() => {
    const data: Array<{ name: string, ganhos: number, gastos: number, fullDate: Date }> = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const key = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      data.push({ name: key, ganhos: baseIncome, gastos: 0, fullDate: d });
    }
    
    data.forEach(monthBucket => {
      transactions.forEach(t => {
        const [day, month, year] = t.date.split('/').map(Number);
        const tDate = new Date(year, month - 1, day);
        
        const isSameMonth = tDate.getMonth() === monthBucket.fullDate.getMonth() && 
                            tDate.getFullYear() === monthBucket.fullDate.getFullYear();
        
        const isProjectedFixed = t.isFixed && (
          tDate.getFullYear() < monthBucket.fullDate.getFullYear() || 
          (tDate.getFullYear() === monthBucket.fullDate.getFullYear() && tDate.getMonth() <= monthBucket.fullDate.getMonth())
        );

        if (isSameMonth || isProjectedFixed) {
          if (t.type === 'revenue') monthBucket.ganhos += t.amount;
          else monthBucket.gastos += t.amount;
        }
      });
    });

    const currentMonthData = data[5];
    const expenseRatio = currentMonthData.ganhos > 0 ? currentMonthData.gastos / currentMonthData.ganhos : 1;
    let score = 100 - (expenseRatio * 100);
    if (score < 0) score = 0;

    return { chartData: data, currentHealthScore: score };
  }, [transactions, baseIncome, currentDate]);

  const healthStatus = currentHealthScore >= 30 ? 'excelente' : (currentHealthScore >= 10 ? 'alerta' : 'critico');

  return (
    <div className="space-y-8 animate-slide-up px-1 pb-20">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-neutral-900 border border-primary/20 rounded-[2rem] flex items-center justify-center text-primary shadow-glow transform rotate-3">
          <Activity size={32} />
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none">Saúde Financeira</h2>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em]">Score de Inteligência do Casal</p>
        </div>
      </div>

      {/* HEALTH SCORE CARD */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className={`inline-flex items-center px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
              healthStatus === 'excelente' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
              healthStatus === 'alerta' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              {healthStatus === 'excelente' ? <ShieldCheck size={14} className="mr-2" /> : <AlertCircle size={14} className="mr-2" />}
              Status: {healthStatus.toUpperCase()}
            </div>
            <h3 className="text-2xl md:text-3xl font-display font-black text-white italic tracking-tight uppercase">Seu Score de Economia</h3>
            <p className="text-neutral-400 text-sm max-w-sm leading-relaxed">
              {healthStatus === 'excelente' ? 'Vocês estão com um ótimo fôlego financeiro! O caminho para as metas está livre.' : 
               healthStatus === 'alerta' ? 'Atenção ao fluxo. Os gastos estão aproximando-se da reserva de segurança.' :
               'Alerta crítico. Os gastos superaram a renda ou estão em nível de risco.'}
            </p>
          </div>
          <div className="relative">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[10px] border-neutral-900 flex items-center justify-center shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%" cy="50%" r="42%"
                  className={`fill-none stroke-[10px] transition-all duration-1000 ${
                    healthStatus === 'excelente' ? 'stroke-emerald-500' : 
                    healthStatus === 'alerta' ? 'stroke-amber-500' : 'stroke-red-500'
                  }`}
                  strokeDasharray={`${currentHealthScore * 2.8}, 1000`}
                />
              </svg>
              <div className="text-center">
                <span className="text-5xl md:text-6xl font-display font-black text-white italic">{currentHealthScore.toFixed(0)}</span>
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mt-1">Pontos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SELETOR DE MÊS */}
      <div className="flex justify-center">
        <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-1.5 shadow-xl">
          <button onClick={() => onMonthChange('prev')} className="p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl text-neutral-500 transition-all active:scale-90">
            <ChevronLeft size={20} />
          </button>
          <span className="px-8 font-black uppercase text-[11px] tracking-[0.2em] text-neutral-900 dark:text-white italic">{monthLabel}</span>
          <button onClick={() => onMonthChange('next')} className="p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-2xl text-neutral-500 transition-all active:scale-90">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* GRÁFICO PRINCIPAL */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 opacity-20"></div>
        
        <div className="mb-10 flex flex-col items-center gap-6 text-center">
          <div className="text-center">
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight italic">Tendência Semestral</h3>
            <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest mt-1">Comparativo de Geração de Riqueza</p>
          </div>
          
          <div className="flex items-center space-x-8 bg-neutral-900 px-8 py-5 rounded-[2rem] border border-neutral-800 shadow-inner">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Ganhos</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-primary shadow-glow"></div>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Gastos</span>
            </div>
          </div>
        </div>

        <div className="h-[300px] md:h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barGap={10}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#737373', fontSize: 10, fontWeight: '900' }} 
                dy={15} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#737373', fontSize: 10, fontWeight: 'bold' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar 
                dataKey="ganhos" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={window.innerWidth < 768 ? 14 : 28} 
              />
              <Bar 
                dataKey="gastos" 
                fill="#FACC15" 
                radius={[6, 6, 0, 0]} 
                barSize={window.innerWidth < 768 ? 14 : 28} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
