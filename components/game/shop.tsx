"use client";

import type { Upgrade } from "@/hooks/use-game";
import { formatNumber } from "@/hooks/use-game";
import { Store, Coins, Sword, Users, Flame } from "lucide-react";

interface ShopProps {
  upgrades: Upgrade[];
  onPurchase: (upgradeId: string) => void;
  getUpgradeCost: (upgradeId: string) => number;
  canAfford: (upgradeId: string) => boolean;
  demonSouls: number;
}

// Get icon for upgrade type
const getUpgradeIcon = (upgradeId: string) => {
  switch (upgradeId) {
    case "weapon":
      return <Sword className="w-6 h-6" />;
    case "mercenary":
      return <Users className="w-6 h-6" />;
    case "critical":
      return <Flame className="w-6 h-6" />;
    default:
      return null;
  }
};

// Get effect description based on upgrade type
const getEffectDescription = (upgrade: Upgrade): string => {
  switch (upgrade.id) {
    case "weapon":
      return "Boosts your click power";
    case "mercenary":
      return "Summons allies for automatic DPS";
    case "critical":
      return `+${upgrade.effect}% crit chance per level`;
    default:
      return upgrade.description;
  }
};

// Get current bonus based on upgrade level
const getCurrentBonus = (upgrade: Upgrade, demonSouls: number): string => {
  const damageMultiplier = 1 + demonSouls * 0.1;
  switch (upgrade.id) {
    case "weapon":
      const dmg = upgrade.level === 0 ? 1 : Math.floor(1 * Math.pow(1.2, upgrade.level));
      return `Total: ${formatNumber(dmg * damageMultiplier)} damage`;
    case "mercenary":
      const dps = upgrade.level === 0 ? 0 : Math.floor(5 * Math.pow(1.25, upgrade.level - 1));
      return `Total: ${formatNumber(dps * damageMultiplier)} DPS`;
    case "critical":
      return `${Math.min(upgrade.level * upgrade.effect, 100)}% chance`;
    default:
      return "";
  }
};

export function Shop({ upgrades, onPurchase, getUpgradeCost, canAfford, demonSouls }: ShopProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-5">
        <Store className="w-6 h-6 gold-text" />
        <h2 className="text-xl font-bold gold-text tracking-wide">Blacksmith</h2>
      </div>

      <div className="flex flex-col gap-4">
        {upgrades.map((upgrade) => {
          const cost = getUpgradeCost(upgrade.id);
          const affordable = canAfford(upgrade.id);

          return (
            <button
              key={upgrade.id}
              onClick={() => onPurchase(upgrade.id)}
              disabled={!affordable}
              className={`
                w-full p-4 rounded text-left
                medieval-button
                ${!affordable ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-2 rounded medieval-border ${affordable ? "gold-text" : "text-muted-foreground"}`}>
                  {getUpgradeIcon(upgrade.id)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-foreground tracking-wide">
                      {upgrade.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary/50 text-muted-foreground border border-border">
                      Lv. {upgrade.level}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {getEffectDescription(upgrade)}
                  </div>
                  {upgrade.level > 0 && (
                    <div className="text-xs gold-text">
                      Current: {getCurrentBonus(upgrade, demonSouls)}
                    </div>
                  )}
                </div>

                {/* Cost */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Coins className={`w-5 h-5 ${affordable ? "gold-text" : "text-muted-foreground"}`} />
                  <span className={`font-bold tabular-nums ${affordable ? "gold-text" : "text-muted-foreground"}`}>
                    {formatNumber(cost)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
