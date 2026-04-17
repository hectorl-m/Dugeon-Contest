"use client";

import { useGame } from "@/hooks/use-game";
import { StatsHeader } from "./stats-header";
import { Monster } from "./monster";
import { Shop } from "./shop";
import { Scroll, Info } from "lucide-react";

export function GameContainer() {
  const {
    gameState,
    damagePopups,
    isShaking,
    monsterDying,
    bossAppearing,
    handleClick,
    purchaseUpgrade,
    getUpgradeCost,
    canAfford,
    resetGame,
  } = useGame();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Stats Header */}
      <StatsHeader
        level={gameState.level}
        gold={gameState.gold}
        dps={gameState.dps}
        clickDamage={gameState.clickDamage}
        critChance={gameState.critChance}
        onReset={resetGame}
      />

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Monster Stage */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative">
          {/* Decorative torch effect */}
          <div className="absolute inset-0 bg-gradient-radial from-amber-900/10 via-transparent to-transparent pointer-events-none" />
          
          <Monster
            level={gameState.level}
            currentHp={gameState.currentHp}
            maxHp={gameState.maxHp}
            isBoss={gameState.isBoss}
            bossTimer={gameState.bossTimer}
            isShaking={isShaking}
            monsterDying={monsterDying}
            bossAppearing={bossAppearing}
            damagePopups={damagePopups}
            onClick={handleClick}
          />
        </div>

        {/* Shop Sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 border-t-4 lg:border-t-0 lg:border-l-4 border-border bg-card p-4 lg:p-6 overflow-y-auto">
          <Shop
            upgrades={gameState.upgrades}
            onPurchase={purchaseUpgrade}
            getUpgradeCost={getUpgradeCost}
            canAfford={canAfford}
          />

          {/* Game Tips */}
          <div className="mt-6 p-4 rounded medieval-border bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="w-5 h-5 gold-text" />
              <h3 className="font-bold text-foreground tracking-wide">Ancient Scrolls</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="gold-text">-</span>
                Click thy enemy to deal damage
              </li>
              <li className="flex items-start gap-2">
                <span className="gold-text">-</span>
                Every 10 stages, a Boss awaits
              </li>
              <li className="flex items-start gap-2">
                <span className="gold-text">-</span>
                Vanquish Bosses within 60 seconds
              </li>
              <li className="flex items-start gap-2">
                <span className="gold-text">-</span>
                Bosses yield 10x gold
              </li>
              <li className="flex items-start gap-2">
                <span className="gold-text">-</span>
                Thy progress is preserved
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-border bg-card py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span className="tracking-wide">Dungeon Conquest - Thy progress is eternally preserved</span>
        </div>
      </footer>
    </div>
  );
}
