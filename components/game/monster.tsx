"use client";

import type { DamagePopup } from "@/hooks/use-game";
import { formatNumber } from "@/hooks/use-game";
import { Skull, Timer, Shield } from "lucide-react";

interface MonsterProps {
  level: number;
  currentHp: number;
  maxHp: number;
  isBoss: boolean;
  bossTimer: number;
  isShaking: boolean;
  monsterDying: boolean;
  bossAppearing: boolean;
  damagePopups: DamagePopup[];
  onClick: (e: React.MouseEvent) => void;
}

// Monster appearances based on level ranges
const getMonsterEmoji = (level: number, isBoss: boolean): string => {
  if (isBoss) {
    if (level >= 90) return "🐉";
    if (level >= 70) return "👹";
    if (level >= 50) return "🧟";
    if (level >= 30) return "👿";
    return "💀";
  }
  
  if (level >= 80) return "🦇";
  if (level >= 60) return "🐺";
  if (level >= 40) return "🕷️";
  if (level >= 20) return "🐀";
  if (level >= 10) return "👻";
  return "🦴";
};

const getMonsterName = (level: number, isBoss: boolean): string => {
  if (isBoss) {
    if (level >= 90) return "Ancient Dragon";
    if (level >= 70) return "Demon Lord";
    if (level >= 50) return "Undead King";
    if (level >= 30) return "Dark Overlord";
    return "Skeleton Lord";
  }
  
  if (level >= 80) return "Vampire Bat";
  if (level >= 60) return "Dire Wolf";
  if (level >= 40) return "Giant Spider";
  if (level >= 20) return "Dungeon Rat";
  if (level >= 10) return "Wandering Ghost";
  return "Skeleton Minion";
};

export function Monster({
  level,
  currentHp,
  maxHp,
  isBoss,
  bossTimer,
  isShaking,
  monsterDying,
  bossAppearing,
  damagePopups,
  onClick,
}: MonsterProps) {
  const hpPercentage = Math.max(0, (currentHp / maxHp) * 100);
  const monsterEmoji = getMonsterEmoji(level, isBoss);
  const monsterName = getMonsterName(level, isBoss);
  const bossTimerMax = 60;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Monster Name Plate */}
      <div className="text-center medieval-frame px-6 py-3 rounded">
        <h2 className={`text-xl md:text-2xl font-bold tracking-wide ${isBoss ? "gold-text" : "text-foreground"}`}>
          {monsterName}
        </h2>
        {isBoss && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <Skull className="w-4 h-4 gold-text" />
            <span className="text-sm gold-text font-semibold tracking-widest">BOSS BATTLE</span>
            <Skull className="w-4 h-4 gold-text" />
          </div>
        )}
      </div>

      {/* HP Bar */}
      <div className="w-full">
        <div className="flex items-center justify-between text-sm mb-2 px-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span className="font-semibold">Health</span>
          </div>
          <span className="font-bold text-foreground tabular-nums">
            {formatNumber(Math.max(0, currentHp))} / {formatNumber(maxHp)}
          </span>
        </div>
        <div className="hp-bar-medieval h-6 rounded overflow-hidden">
          <div
            className="hp-bar-fill h-full transition-all duration-200 ease-out"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>

      {/* Boss Timer */}
      {isBoss && (
        <div className="w-full">
          <div className="flex items-center justify-between text-sm mb-2 px-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className={`w-4 h-4 ${bossTimer <= 10 ? "text-destructive" : "gold-text"}`} />
              <span className="font-semibold">Time Remaining</span>
            </div>
            <span className={`font-bold tabular-nums ${bossTimer <= 10 ? "text-destructive" : "gold-text"}`}>
              {bossTimer}s
            </span>
          </div>
          <div className="hp-bar-medieval h-3 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                bossTimer <= 10 
                  ? "bg-gradient-to-b from-red-600 via-red-700 to-red-800" 
                  : "bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700"
              }`}
              style={{ width: `${(bossTimer / bossTimerMax) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Monster Display Area */}
      <div
        onClick={onClick}
        className={`
          relative cursor-pointer select-none
          w-56 h-56 md:w-72 md:h-72
          flex items-center justify-center
          rounded-lg medieval-frame
          transition-all duration-200
          hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]
          active:scale-[0.97]
          ${isShaking ? "animate-shake" : ""}
          ${monsterDying ? "animate-death" : ""}
          ${bossAppearing ? "animate-boss-entrance" : ""}
          ${isBoss ? "shadow-[0_0_30px_rgba(255,215,0,0.2)]" : ""}
        `}
      >
        {/* Corner Decorations */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/40" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/40" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/40" />

        {/* Monster Emoji */}
        <span
          className={`text-8xl md:text-9xl transition-transform torch-glow ${
            isBoss ? "drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" : "drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
          }`}
        >
          {monsterEmoji}
        </span>

        {/* Damage Popups */}
        {damagePopups.map((popup) => (
          <div
            key={popup.id}
            className={`
              absolute pointer-events-none
              font-bold animate-float-up
              ${popup.isCrit ? "gold-text text-2xl md:text-3xl scale-125" : ""}
              ${popup.isDps ? "text-cyan-400 text-sm md:text-base" : ""}
              ${!popup.isCrit && !popup.isDps ? "text-destructive text-xl md:text-2xl" : ""}
            `}
            style={{
              left: popup.x,
              top: popup.y,
              textShadow: popup.isCrit ? "0 0 10px rgba(255,215,0,0.8)" : "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {popup.isCrit && "CRIT! "}
            -{formatNumber(popup.damage)}
          </div>
        ))}

        {/* Click hint */}
        <div className="absolute bottom-4 text-xs text-muted-foreground font-semibold tracking-wide">
          CLICK TO ATTACK
        </div>
      </div>
    </div>
  );
}
