"use client";

import { useGame } from "@/hooks/use-game";
import { StatsHeader } from "./stats-header";
import { Monster } from "./monster";
import { Shop } from "./shop";
import { Tavern } from "./tavern";
import { PrestigeModal } from "./prestige-modal";
import { Scroll, Info, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

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
    prepareChest,
    collectChest,
    prestige,
    calculatePendingSouls,
  } = useGame();

  const [isPrestigeModalOpen, setIsPrestigeModalOpen] = useState(false);

  const pendingSouls = calculatePendingSouls(gameState.level);
  const newMultiplier = 1 + (gameState.demonSouls + pendingSouls) * 0.1;
  const isPrestigeAvailable = gameState.level >= 50;

  const handlePrestigeClick = () => {
    if (isPrestigeAvailable) {
      setIsPrestigeModalOpen(true);
    }
  };

  const handlePrestigeConfirm = () => {
    prestige();
    setIsPrestigeModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StatsHeader
        level={gameState.level}
        gold={gameState.gold}
        dps={gameState.dps}
        clickDamage={gameState.clickDamage}
        critChance={gameState.critChance}
        onReset={resetGame}
        demonSouls={gameState.demonSouls}
      />

      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative">
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

        <aside className="w-full lg:w-80 xl:w-96 border-t-4 lg:border-t-0 lg:border-l-4 border-border bg-card p-4 lg:p-6 overflow-y-auto">
          <Tabs defaultValue="shop" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="shop">Blacksmith</TabsTrigger>
              <TabsTrigger value="tavern">Tavern</TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="mt-0">
              <Shop
                upgrades={gameState.upgrades}
                onPurchase={purchaseUpgrade}
                getUpgradeCost={getUpgradeCost}
                canAfford={canAfford}
              />
            </TabsContent>

            <TabsContent value="tavern" className="mt-0">
              <Tavern
                gold={gameState.gold}
                level={gameState.level}
                prepareChest={prepareChest}
                collectChest={collectChest}
              />
            </TabsContent>
          </Tabs>

          {isPrestigeAvailable && (
            <div className="mt-6 p-4 rounded medieval-border bg-gradient-to-br from-red-950 to-slate-900 border-2 border-red-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                  <h3 className="font-bold text-red-400 tracking-wide">Dark Ascension</h3>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <p className="text-red-300">
                  Current Bonus: <span className="font-bold text-amber-300">+{Math.round((newMultiplier - 1) * 100)}%</span> Damage & Gold
                </p>
                <p className="text-red-200">
                  Ascend now to claim <span className="font-bold text-red-300">{pendingSouls}</span> Demon Souls
                </p>
              </div>

              <button
                onClick={handlePrestigeClick}
                className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded transition-all duration-200 border border-red-600 shadow-lg hover:shadow-red-700/50 flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                Ascend to Greater Power
              </button>
            </div>
          )}

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

      <PrestigeModal
        isOpen={isPrestigeModalOpen}
        onClose={() => setIsPrestigeModalOpen(false)}
        onConfirm={handlePrestigeConfirm}
        pendingSouls={pendingSouls}
        currentMultiplier={newMultiplier}
        level={gameState.level}
      />

      <footer className="border-t-4 border-border bg-card py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span className="tracking-wide">Dungeon Conquest - Thy progress is eternally preserved</span>
        </div>
      </footer>
    </div>
  );
}
