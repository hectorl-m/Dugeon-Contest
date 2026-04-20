"use client";

import { useState } from "react";
import type { ChestReward } from "@/hooks/use-game";
import { formatNumber } from "@/hooks/use-game";
import { useToast } from "@/hooks/use-toast";
import { Beer, Coins, Play, Star, Hourglass } from "lucide-react";

interface TavernProps {
  gold: number;
  level: number;
  prepareChest: (type: 'wooden' | 'ad', level: number) => { reward: ChestReward; cost: number } | null;
  collectChest: (reward: ChestReward | null, cost: number) => void;
}

type ChestState = {
  reward: ChestReward;
  cost: number;
  clicksRemaining: number;
  phase: 'opening' | 'reveal';
} | null;

type AdState = 'idle' | 'loading' | 'ready';

function DarkMedievalChestIcon({ glow, shaking }: { glow: boolean; shaking: boolean }) {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100" 
        className="w-48 h-48 drop-shadow-[0_0_25px_rgba(217,119,6,0.15)] hover:scale-105 active:scale-95 transition-transform duration-100 cursor-pointer"
        >
        {/* Sombra en el suelo */}
        <ellipse cx="50" cy="95" rx="40" ry="5" fill="#050505" opacity="0.8"/>

        {/* Base de madera oscura */}
        <polygon points="10,45 90,45 85,90 15,90" fill="#27140C" stroke="#111111" strokeWidth="2"/>

        {/* Tapa angulosa de madera (2 niveles de profundidad) */}
        <polygon points="15,20 85,20 90,45 10,45" fill="#3A1D11" stroke="#111111" strokeWidth="2"/>
        <polygon points="25,10 75,10 85,20 15,20" fill="#1C0D07" stroke="#111111" strokeWidth="2"/>

        {/* Cintas de hierro forjado (Izquierda, Derecha y Centro) */}
        <polygon points="25,10 35,10 32,90 22,90" fill="#111111"/>
        <polygon points="75,10 65,10 68,90 78,90" fill="#111111"/>
        <polygon points="46,10 54,10 54,90 46,90" fill="#161616"/>

        {/* Bordes de hierro (Horizontal para cierre inferior y superior) */}
        <rect x="10" y="42" width="80" height="6" fill="#0A0A0A"/>
        <rect x="14" y="85" width="72" height="6" fill="#111111"/>

        {/* Bloque central de la cerradura */}
        <rect x="40" y="32" width="20" height="26" fill="#0A0A0A" stroke="#1A1A1A" strokeWidth="2"/>
        
        {/* Ojo de cerradura brillante ámbar */}
        <path 
            d="M48 40 A 2 2 0 1 1 52 40 L54 50 L46 50 Z" 
            fill="#D97706" 
            filter="drop-shadow(0px 0px 6px #F59E0B)"
        />
        
        {/* Remaches de acero oscuro */}
        <circle cx="28" cy="15" r="1.5" fill="#404040"/>
        <circle cx="72" cy="15" r="1.5" fill="#404040"/>
        <circle cx="30" cy="30" r="1.5" fill="#404040"/>
        <circle cx="70" cy="30" r="1.5" fill="#404040"/>
        <circle cx="28" cy="65" r="1.5" fill="#404040"/>
        <circle cx="72" cy="65" r="1.5" fill="#404040"/>
        <circle cx="50" cy="80" r="1.5" fill="#404040"/>
    </svg>
  );
}

export function Tavern({ gold, level, prepareChest, collectChest }: TavernProps) {
  const { toast } = useToast();
  const [chestState, setChestState] = useState<ChestState>(null);
  const [adState, setAdState] = useState<AdState>('idle');
  const [isShaking, setIsShaking] = useState(false);

  const getWoodenChestCost = () => Math.floor(200 * Math.pow(1.15, level - 1));

  const startChest = (type: 'wooden' | 'ad') => {
    if (type === 'wooden') {
      const cost = getWoodenChestCost();
      if (gold < cost) {
        toast({
          title: "Not enough gold!",
          description: `You need ${cost} gold to open a wooden chest.`,
          variant: "destructive",
        });
        return;
      }
    }

    if (type === 'ad') {
      setAdState('loading');
      setTimeout(() => {
        setAdState('ready');
      }, 3000);
      return;
    }

    const result = prepareChest(type, level);
    if (result) {
      setChestState({ ...result, clicksRemaining: 3, phase: 'opening' });
    }
  };

  const handleAdReady = () => {
    const result = prepareChest('ad', level);
    if (result) {
      setChestState({ ...result, clicksRemaining: 3, phase: 'opening' });
      setAdState('idle');
    }
  };

  const handleChestClick = () => {
    if (!chestState || chestState.phase !== 'opening') return;

    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 180);

    setChestState((prev) => {
      if (!prev) return null;
      const nextCount = prev.clicksRemaining - 1;
      if (nextCount <= 0) {
        return { ...prev, clicksRemaining: 0, phase: 'reveal' };
      }
      return { ...prev, clicksRemaining: nextCount };
    });
  };

  const handleCollect = () => {
    if (!chestState) return;
    collectChest(chestState.reward, chestState.cost);
    setChestState(null);
  };

  return (
    <>
      <div className="w-full">
        <div className="flex items-center gap-3 mb-5">
          <Beer className="w-6 h-6 gold-text" />
          <h2 className="text-xl font-bold gold-text tracking-wide">Tavern</h2>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => startChest('wooden')}
            disabled={gold < getWoodenChestCost() || !!chestState || adState !== 'idle'}
            className={`w-full p-4 rounded text-left medieval-button ${gold < getWoodenChestCost() || chestState || adState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded medieval-border ${gold >= getWoodenChestCost() && !chestState && adState === 'idle' ? 'gold-text' : 'text-muted-foreground'}`}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    className="w-6 h-6 shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    >
                    <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" fill="#451A03" stroke="#FBBF24"/>
                    <path d="M2 8h20" stroke="#FBBF24" strokeWidth="3"/>
                    <path d="M8 8v3a4 4 0 0 0 8 0V8" stroke="#FBBF24" opacity="0.8"/>
                    <circle cx="12" cy="11" r="1.5" fill="#FBBF24" stroke="none"/>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v2H2V6c0-1.1.9-2 2-2z" fill="#78350F" stroke="#FBBF24"/>
                    </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground tracking-wide mb-1">Buy Wooden Chest</div>
                <div className="text-sm text-muted-foreground mb-2">A mysterious chest containing scaled gold or rare upgrades.</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Coins className={`w-5 h-5 ${gold >= getWoodenChestCost() && !chestState && adState === 'idle' ? 'gold-text' : 'text-muted-foreground'}`} />
                <span className={`font-bold tabular-nums ${gold >= getWoodenChestCost() && !chestState && adState === 'idle' ? 'gold-text' : 'text-muted-foreground'}`}>{formatNumber(getWoodenChestCost())}</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => startChest('ad')}
            disabled={!!chestState || adState !== 'idle'}
            className={`w-full p-4 rounded text-left medieval-button ${chestState || adState !== 'idle' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded medieval-border ${!chestState && adState === 'idle' ? 'gold-text' : 'text-muted-foreground'}`}>
                <Play className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground tracking-wide mb-1">Watch Ad Chest</div>
                <div className="text-sm text-muted-foreground mb-2">Commune with spirits for immense wealth or permanent power.</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-bold tabular-nums gold-text">FREE</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Ad Loading Modal */}
      {adState === 'loading' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/95 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 p-8">
            <Hourglass className="w-16 h-16 text-amber-600 animate-spin" />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold gold-text tracking-wide">Communing with the Ancient Spirits...</h3>
              <p className="text-muted-foreground">The spirits demand your attention for 3 seconds.</p>
            </div>
          </div>
        </div>
      )}

      {/* Chest Modal */}
      {(chestState || adState === 'ready') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950 border-4 border-amber-900/50 shadow-[0_0_50px_rgba(120,53,15,0.6)] backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-4xl rounded-none border-none bg-transparent p-6">
            {adState === 'ready' ? (
              <div className="flex flex-col items-center gap-8 text-center">
                <div className="space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-amber-300 drop-shadow-[0_0_35px_rgba(251,191,36,0.65)]">
                    The Spirits Have Spoken
                  </h2>
                  <p className="text-base text-slate-300">Strike the chest to claim your reward.</p>
                </div>
                <button
                  onClick={handleAdReady}
                  className="inline-flex items-center justify-center rounded-none bg-amber-700 px-8 py-4 text-lg font-bold text-stone-950 shadow-lg shadow-amber-500/40 transition hover:bg-amber-600 border-2 border-amber-900"
                >
                  Open the Chest
                </button>
              </div>
            ) : chestState && chestState.phase === 'opening' ? (
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="relative flex flex-col items-center gap-4">
                  <div className={`absolute inset-0 rounded-none bg-red-900/20 ${chestState.clicksRemaining === 1 ? 'opacity-80 blur-sm' : 'opacity-0'} transition-all duration-200`} />
                  <div onClick={handleChestClick} className="relative">
                    <DarkMedievalChestIcon glow={chestState.clicksRemaining === 1} shaking={isShaking} />
                  </div>
                </div>
              </div>
            ) : chestState && chestState.phase === 'reveal' ? (
              <div className="flex flex-col items-center gap-8 text-center animate-in zoom-in duration-500">
                
                {/* Contenedor de Textos */}
                <div className="space-y-4">
                  {/* Título elegante, sutil y antiguo */}
                  <h1 className="text-lg md:text-xl font-bold uppercase tracking-[0.4em] text-amber-700/80 font-serif">
                    Treasure Uncovered
                  </h1>
                  
                  {/* El premio: Letras con degradado de oro fundido */}
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-800 drop-shadow-[0_0_30px_rgba(217,119,6,0.3)] font-serif py-2">
                    {chestState.reward.message}
                  </h2>
                  
                  {/* Subtítulo rolero en cursiva */}
                  <p className="text-sm italic text-stone-500 font-serif tracking-wide">
                    The spoils of the dark dungeon are yours.
                  </p>
                </div>

                {/* Botón estilo placa de hierro forjado y oro viejo */}
                <button
                  onClick={handleCollect}
                  className="relative mt-6 px-12 py-4 bg-stone-950 border-y-2 border-amber-900/60 text-amber-600 font-bold uppercase tracking-[0.2em] hover:bg-stone-800 hover:text-amber-400 hover:border-amber-700 transition-all duration-300 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] font-serif"
                >
                  Collect Loot
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
