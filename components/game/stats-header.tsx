"use client";

import { formatNumber } from "@/hooks/use-game";
import { Swords, Coins, Zap, MousePointerClick, Flame, RotateCcw, Skull } from "lucide-react";

interface StatsHeaderProps {
  level: number;
  gold: number;
  dps: number;
  clickDamage: number;
  critChance: number;
  totalClicks: number;
  demonSouls: number;
  onReset: () => void;
}

export function StatsHeader({
  level,
  gold,
  dps,
  clickDamage,
  critChance,
  totalClicks,
  demonSouls,
  onReset,
}: StatsHeaderProps) {
  return (
    <header className="w-full medieval-frame">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Title and Reset */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold gold-text tracking-wider flex items-center gap-3">
            <Swords className="w-7 h-7 md:w-8 md:h-8" />
            <span className="font-sans">Dungeon Conquest</span>
          </h1>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded medieval-button"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap gap-3 md:gap-5">
          {/* Total Clicks */}
          <div className="flex items-center gap-2 px-3 py-2 rounded medieval-border bg-secondary/50">
            <MousePointerClick className="w-5 h-5 text-foreground" />
            <span className="text-muted-foreground text-sm">Total</span>
            <span className="font-bold text-foreground">{formatNumber(totalClicks)}</span>
          </div>
          
          {/* Level */}
          <div className="flex items-center gap-2 px-3 py-2 rounded medieval-border bg-secondary/50">
            <span className="text-muted-foreground text-sm">Stage</span>
            <span className="font-bold text-foreground text-lg">{level}</span>
          </div>

          {/* Gold */}
          <div className="flex items-center gap-2 px-3 py-2 rounded medieval-border bg-secondary/50">
            <Coins className="w-5 h-5 gold-text" />
            <span className="font-bold gold-text text-lg">{formatNumber(gold)}</span>
          </div>

          {/* DPS */}
          <div className="flex items-center gap-2 px-3 py-2 rounded medieval-border bg-secondary/50">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span className="text-muted-foreground text-sm">DPS</span>
            <span className="font-bold text-foreground">{formatNumber(dps)}</span>
          </div>

          {/* Click Damage */}
          <div className="flex items-center gap-2 px-3 py-2 rounded medieval-border bg-secondary/50">
            <MousePointerClick className="w-5 h-5 text-foreground" />
            <span className="text-muted-foreground text-sm">Click</span>
            <span className="font-bold text-foreground">{formatNumber(clickDamage)}</span>
          </div>

          {/* Crit Chance */}
          {critChance > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded medieval-border bg-secondary/50">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-muted-foreground text-sm">Crit</span>
              <span className="font-bold text-orange-400">{critChance}%</span>
            </div>
          )}
          
          {/* Contador de Almas de Prestigio */}
          {demonSouls > 0 && (
            <div className="flex items-center gap-2 bg-purple-950/40 px-3 py-1.5 rounded-md border border-purple-800/50 shadow-[0_0_10px_rgba(147,51,234,0.15)]">
              <Skull className="w-4 h-4 text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
              <span className="text-sm font-bold text-purple-200 font-serif tracking-wider">
                {demonSouls}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
