
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
      <div className="bg-neutral-900 border border-neutral-800 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-[8px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 md:mb-3 border-b border-neutral-800 pb-2 text-left">{label}</p>
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex items-center justify-between space-x-4 md:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Ganhos</span>
            </div>
            <span className="text-[10px] md:text-xs font-black text-emerald-400">R$ {ganhos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center justify-between space-x-4 md:space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary" />
              <span className="text-[8px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">Gastos</span>
            </div>
            <span className="text-[10px] md:text-xs font-black text-primary">R$ {gastos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="pt-1.5 md:pt-2 mt-1.5 md:mt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-widest">Saldo</span>
            <span className={`text-[10px] md:text-xs font-black ${saldo >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
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
    <div className="space-y-6 md:space-y-8 animate-slide-up px-1 pb-24 md:pb-20">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 md:space-y-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-900 border border-primary/20 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-primary shadow-glow transform rotate-3 shrink-0">
          <Activity className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div className="space-y-1 px-4">
          <h2 className="text-3xl md:text-5xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none">Saúde Financeira</h2>
          <p className="text-[8px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] md:tracking-[0.4em]">Score de Inteligência do Casal</p>
        </div>
      </div>

      {/* HEALTH SCORE CARD */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-2xl relative overflow-hidden text-center md:text-left mx-1 sm:mx-0">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-emerald-500/5 blur-[80px] md:blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="space-y-3 md:space-y-4 flex flex-col items-center md:items-start">
            <div className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-[8px] md:text-[10px] font-black uppercase tracking-widest ${
              healthStatus === 'excelente' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
              healthStatus === 'alerta' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
              'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              {healthStatus === 'excelente' ? <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" /> : <AlertCircle className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />}
              {healthStatus.toUpperCase()}
            </div>
            <h3 className="text-xl md:text-3xl font-display font-black text-white italic tracking-tight uppercase leading-none">Seu Score de Economia</h3>
            <p className="text-neutral-400 text-xs md:text-sm max-w-sm leading-relaxed text-center md:text-left">
              {healthStatus === 'excelente' ? 'Vocês estão com um ótimo fôlego financeiro! O caminho para as metas está livre.' : 
               healthStatus === 'alerta' ? 'Atenção ao fluxo. Os gastos estão aproximando-se da reserva de segurança.' :
               'Alerta crítico. Os gastos superaram a renda ou estão em nível de risco.'}
            </p>
          </div>
          <div className="relative shrink-0">
            <div className="w-32 h-32 xs:w-40 xs:h-40 md:w-48 md:h-48 rounded-full border-[8px] md:border-[10px] border-neutral-900 flex items-center justify-center shadow-inner">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%" cy="50%" r="42%"
                  className={`fill-none stroke-[8px] md:stroke-[10px] transition-all duration-1000 ${
                    healthStatus === 'excelente' ? 'stroke-emerald-500' : 
                    healthStatus === 'alerta' ? 'stroke-amber-500' : 'stroke-red-500'
                  }`}
                  strokeDasharray={`${currentHealthScore * 2.8}, 1000`}
                />
              </svg>
              <div className="text-center">
                <span className="text-4xl xs:text-5xl md:text-6xl font-display font-black text-white italic leading-none">{currentHealthScore.toFixed(0)}</span>
                <p className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest mt-1">Pontos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SELETOR DE MÊS */}
      <div className="flex justify-center px-4">
        <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl md:rounded-[2rem] p-1 shadow-xl w-full sm:w-auto justify-between sm:justify-start">
          <button onClick={() => onMonthChange('prev')} className="p-3 md:p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl md:rounded-2xl text-neutral-500 transition-all active:scale-90">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <span className="px-4 md:px-8 font-black uppercase text-[9px] md:text-[11px] tracking-[0.1em] md:tracking-[0.2em] text-neutral-900 dark:text-white italic truncate">{monthLabel}</span>
          <button onClick={() => onMonthChange('next')} className="p-3 md:p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl md:rounded-2xl text-neutral-500 transition-all active:scale-90">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* GRÁFICO PRINCIPAL */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-[2rem] md:rounded-[3rem] p-5 md:p-12 shadow-2xl relative overflow-hidden mx-1 sm:mx-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500 opacity-20"></div>
        
        <div className="mb-6 md:mb-10 flex flex-col items-center gap-4 md:gap-6 text-center">
          <div>
            <h3 className="text-lg md:text-xl font-display font-black text-white uppercase tracking-tight italic leading-none">Tendência Semestral</h3>
            <p className="text-[8px] md:text-[9px] text-neutral-500 font-black uppercase tracking-widest mt-1.5">Comparativo de Geração de Riqueza</p>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-8 bg-neutral-900 px-6 py-3 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] border border-neutral-800 shadow-inner">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
              <span className="text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">Ganhos</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary shadow-glow"></div>
              <span className="text-[8px] md:text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">Gastos</span>
            </div>
          </div>
        </div>

        <div className="h-[250px] xs:h-[300px] md:h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
              barGap={window.innerWidth < 768 ? 4 : 10}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#737373', fontSize: 8, fontWeight: '900' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#737373', fontSize: 8, fontWeight: 'bold' }} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar 
                dataKey="ganhos" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                barSize={window.innerWidth < 375 ? 10 : window.innerWidth < 768 ? 14 : 28} 
              />
              <Bar 
                dataKey="gastos" 
                fill="#FACC15" 
                radius={[4, 4, 0, 0]} 
                barSize={window.innerWidth < 375 ? 10 : window.innerWidth < 768 ? 14 : 28} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
