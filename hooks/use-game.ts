"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Types for game state
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  effect: number;
  icon: string;
}

export interface GameState {
  gold: number;
  level: number;
  currentHp: number;
  maxHp: number;
  dps: number;
  clickDamage: number;
  critChance: number;
  isBoss: boolean;
  bossTimer: number;
  upgrades: Upgrade[];
  demonSouls: number;
}

export interface DamagePopup {
  id: number;
  damage: number;
  isCrit: boolean;
  x: number;
  y: number;
  isDps?: boolean;
}

export interface ChestReward {
  type: "gold" | "upgrade";
  amount?: number;
  upgradeId?: string;
  message: string;
}

// Storage key for localStorage
const STORAGE_KEY = "hyper-clicker-dungeon-save";

// Boss timer duration in seconds
const BOSS_TIMER_DURATION = 60;

// Calculate monster HP based on level
const calculateMonsterHp = (level: number, isBoss: boolean): number => {
  const baseHp = 10;
  // Scalado del 20% (1.2) exponencial
  const scaling = Math.pow(1.2, level - 1);
  const hp = Math.floor(baseHp * scaling);
  // El jefe tiene 5 veces más vida
  return isBoss ? hp * 5 : hp;
};

// Calculate upgrade cost
const calculateUpgradeCost = (upgrade: Upgrade): number => {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
};

// Format large numbers
export const formatNumber = (num: number): string => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return Math.floor(num).toString();
};

// Initial upgrades
const initialUpgrades: Upgrade[] = [
  {
    id: "weapon",
    name: "Weapon Upgrade",
    description: "Increases damage per click",
    level: 0,
    baseCost: 10,
    costMultiplier: 1.3, // <- Cambiado a 1.3 (crece más rápido)
    effect: 1,
    icon: "⚔️",
  },
  {
    id: "mercenary",
    name: "Mercenaries",
    description: "Automated damage per second",
    level: 0,
    baseCost: 50,
    costMultiplier: 1.4, // <- Cambiado a 1.4 (bastante más caro)
    effect: 1,
    icon: "🛡️",
  },
  {
    id: "critical",
    name: "Critical Hit",
    description: "Chance to deal 5x damage",
    level: 0,
    baseCost: 100,
    costMultiplier: 1.5, // <- Cambiado a 1.5 (muy caro)
    effect: 2,
    icon: "💥",
  },
];

// Default initial state
const getInitialState = (): GameState => ({
  gold: 0,
  level: 1,
  currentHp: calculateMonsterHp(1, false),
  maxHp: calculateMonsterHp(1, false),
  dps: 0,
  clickDamage: 1,
  critChance: 0,
  isBoss: false,
  bossTimer: BOSS_TIMER_DURATION,
  upgrades: initialUpgrades,
  demonSouls: 0,
});

// Calculate pending souls based on current level
const calculatePendingSouls = (level: number): number => {
  return Math.floor(level / 10);
};

// Calculate prestige multiplier
const calculatePrestigeMultiplier = (demonSouls: number): number => {
  return 1 + demonSouls * 0.1;
};

// Calculate derived stats - defined outside hook to avoid initialization issues
const calculateStatsFromUpgrades = (upgrades: Upgrade[], demonSouls: number = 0) => {
  const weaponUpgrade = upgrades.find((u) => u.id === "weapon");
  const mercenaryUpgrade = upgrades.find((u) => u.id === "mercenary");
  const criticalUpgrade = upgrades.find((u) => u.id === "critical");

  const weaponLv = weaponUpgrade?.level ?? 0;
  const mercLv = mercenaryUpgrade?.level ?? 0;
  const critLv = criticalUpgrade?.level ?? 0;

  const prestigeMultiplier = calculatePrestigeMultiplier(demonSouls);

  return {
    // El daño base es 1. Cada nivel aumenta el daño un 20% exponencialmente.
    clickDamage: Math.floor(
      (weaponLv === 0 ? 1 : Math.floor(1 * Math.pow(1.2, weaponLv))) * prestigeMultiplier
    ),
    
    // Los mercenarios empiezan dando 5 DPS y crecen un 25% exponencialmente por nivel.
    dps: Math.floor(
      (mercLv === 0 ? 0 : Math.floor(5 * Math.pow(1.25, mercLv - 1))) * prestigeMultiplier
    ),
    
    // El crítico se queda igual (lineal) para que no pase del 100%
    critChance: Math.min(critLv * (criticalUpgrade?.effect ?? 2), 100),
  };
};

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(getInitialState);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [monsterDying, setMonsterDying] = useState(false);
  const [bossAppearing, setBossAppearing] = useState(false);
  const popupIdRef = useRef(0);
  const lastSaveRef = useRef(Date.now());

  // Load saved game on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial state to handle new upgrades
        const mergedUpgrades = initialUpgrades.map((defaultUpgrade) => {
          const savedUpgrade = parsed.upgrades?.find(
            (u: Upgrade) => u.id === defaultUpgrade.id
          );
          return savedUpgrade
            ? { ...defaultUpgrade, level: savedUpgrade.level }
            : defaultUpgrade;
        });
        
        // Recalculate stats from loaded upgrades, including prestige bonus
        const stats = calculateStatsFromUpgrades(mergedUpgrades, parsed.demonSouls);
        
        setGameState((prev) => ({
          ...prev,
          ...parsed,
          upgrades: mergedUpgrades,
          ...stats, // Apply recalculated stats
        }));
      }
    } catch (e) {
      console.error("Failed to load save:", e);
    }
  }, []);

  // Save game periodically and on state change
  useEffect(() => {
    const now = Date.now();
    if (now - lastSaveRef.current > 5000) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      lastSaveRef.current = now;
    }
  }, [gameState]);

  // Save on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    };
  }, [gameState]);



  // Advance to next monster/level
  const advanceLevel = useCallback(() => {
    setMonsterDying(true);
    
    setTimeout(() => {
      setMonsterDying(false);
      setGameState((prev) => {
        const newLevel = prev.level + 1;
        const newIsBoss = newLevel % 10 === 0;
        const newMaxHp = calculateMonsterHp(newLevel, newIsBoss);

        if (newIsBoss) {
          setBossAppearing(true);
          setTimeout(() => setBossAppearing(false), 500);
        }

        return {
          ...prev,
          level: newLevel,
          isBoss: newIsBoss,
          maxHp: newMaxHp,
          currentHp: newMaxHp,
          bossTimer: newIsBoss ? BOSS_TIMER_DURATION : prev.bossTimer,
        };
      });
    }, 300);
  }, []);

  // Handle boss timer failure
  const handleBossFailure = useCallback(() => {
    setGameState((prev) => {
      const newLevel = Math.max(1, prev.level - 1);
      const newIsBoss = false;
      const newMaxHp = calculateMonsterHp(newLevel, newIsBoss);

      return {
        ...prev,
        level: newLevel,
        isBoss: newIsBoss,
        maxHp: newMaxHp,
        currentHp: newMaxHp,
        bossTimer: BOSS_TIMER_DURATION,
      };
    });
  }, []);

  // Deal damage to monster
  const dealDamage = useCallback(
    (damage: number, isCrit: boolean, x: number, y: number) => {
      // Add damage popup
      const popupId = popupIdRef.current++;
      setDamagePopups((prev) => [
        ...prev,
        { id: popupId, damage, isCrit, x, y },
      ]);

      // Remove popup after animation
      setTimeout(() => {
        setDamagePopups((prev) => prev.filter((p) => p.id !== popupId));
      }, 800);

      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);

      // Apply damage
      setGameState((prev) => {
        const newHp = prev.currentHp - damage;

        if (newHp <= 0) {
          // Monster defeated - give 20% of max HP as gold, with prestige multiplier
          const baseGoldReward = Math.max(1, Math.floor(prev.maxHp * 0.2));
          const prestigeMultiplier = calculatePrestigeMultiplier(prev.demonSouls);
          const goldReward = Math.floor(baseGoldReward * prestigeMultiplier);
          
          return {
            ...prev,
            currentHp: 0,
            gold: prev.gold + goldReward,
          };
        }

        return {
          ...prev,
          currentHp: newHp,
        };
      });
    },
    []
  );

  // Handle click on monster
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const isCrit = Math.random() * 100 < gameState.critChance;
      const damage = isCrit ? gameState.clickDamage * 5 : gameState.clickDamage;

      dealDamage(damage, isCrit, x, y);
    },
    [gameState.clickDamage, gameState.critChance, dealDamage]
  );

  // Check for monster death and advance
  useEffect(() => {
    if (gameState.currentHp <= 0 && !monsterDying) {
      advanceLevel();
    }
  }, [gameState.currentHp, monsterDying, advanceLevel]);

  // DPS game loop - shows popups but no shake
  const dpsAccumulatorRef = useRef(0);
  
  useEffect(() => {
    if (gameState.dps <= 0) return;

    const interval = setInterval(() => {
      // Accumulate fractional DPS damage
      dpsAccumulatorRef.current += gameState.dps / 10;
      
      // Only apply damage when we have at least 1 point
      if (dpsAccumulatorRef.current >= 1) {
        const damageToApply = Math.floor(dpsAccumulatorRef.current);
        dpsAccumulatorRef.current -= damageToApply;
        
        // Add damage popup at random position (no shake)
        const popupId = popupIdRef.current++;
        const x = 80 + Math.random() * 90; // Random x position
        const y = 60 + Math.random() * 80; // Random y position
        
        setDamagePopups((prev) => [
          ...prev,
          { id: popupId, damage: damageToApply, isCrit: false, x, y, isDps: true },
        ]);
        
        // Remove popup after animation
        setTimeout(() => {
          setDamagePopups((prev) => prev.filter((p) => p.id !== popupId));
        }, 800);
        
        setGameState((prev) => {
          if (prev.currentHp <= 0) return prev;
          
          const newHp = prev.currentHp - damageToApply;
          
          if (newHp <= 0) {
            // Monster defeated - give 20% of max HP as gold, with prestige multiplier
            const baseGoldReward = Math.max(1, Math.floor(prev.maxHp * 0.2));
            const prestigeMultiplier = calculatePrestigeMultiplier(prev.demonSouls);
            const goldReward = Math.floor(baseGoldReward * prestigeMultiplier);
            return {
              ...prev,
              currentHp: 0,
              gold: prev.gold + goldReward,
            };
          }
          
          return {
            ...prev,
            currentHp: newHp,
          };
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.dps]);

  // Boss timer countdown - use ref to track boss state without re-running effect
  const isBossRef = useRef(gameState.isBoss);
  const monsterAliveRef = useRef(gameState.currentHp > 0);
  
  useEffect(() => {
    isBossRef.current = gameState.isBoss;
    monsterAliveRef.current = gameState.currentHp > 0;
  }, [gameState.isBoss, gameState.currentHp]);
  
  useEffect(() => {
    if (!gameState.isBoss) return;

    const interval = setInterval(() => {
      // Check refs to avoid stale closure issues
      if (!isBossRef.current || !monsterAliveRef.current) return;
      
      setGameState((prev) => {
        if (!prev.isBoss || prev.currentHp <= 0) return prev;
        if (prev.bossTimer <= 1) {
          // Time's up! Will be handled by failure effect
          return { ...prev, bossTimer: 0 };
        }
        return {
          ...prev,
          bossTimer: prev.bossTimer - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isBoss]);

  // Check boss timer failure
  useEffect(() => {
    if (gameState.isBoss && gameState.bossTimer <= 0 && gameState.currentHp > 0) {
      handleBossFailure();
    }
  }, [gameState.isBoss, gameState.bossTimer, gameState.currentHp, handleBossFailure]);

  // Purchase upgrade
  const purchaseUpgrade = useCallback((upgradeId: string) => {
    setGameState((prev) => {
      const upgradeIndex = prev.upgrades.findIndex((u) => u.id === upgradeId);
      if (upgradeIndex === -1) return prev;

      const upgrade = prev.upgrades[upgradeIndex];
      const cost = calculateUpgradeCost(upgrade);

      if (prev.gold < cost) return prev;

      const newUpgrades = [...prev.upgrades];
      newUpgrades[upgradeIndex] = {
        ...upgrade,
        level: upgrade.level + 1,
      };

      const stats = calculateStatsFromUpgrades(newUpgrades, prev.demonSouls);

      return {
        ...prev,
        gold: prev.gold - cost,
        upgrades: newUpgrades,
        ...stats,
      };
    });
  }, []);

  // Get upgrade cost for display
  const getUpgradeCost = useCallback((upgradeId: string): number => {
    const upgrade = gameState.upgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return 0;
    return calculateUpgradeCost(upgrade);
  }, [gameState.upgrades]);

  // Check if can afford upgrade
  const canAfford = useCallback(
    (upgradeId: string): boolean => {
      return gameState.gold >= getUpgradeCost(upgradeId);
    },
    [gameState.gold, getUpgradeCost]
  );

  // Reset game
  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(getInitialState());
  }, []);

  const prepareChest = useCallback((type: 'wooden' | 'ad', level: number): { reward: ChestReward; cost: number } | null => {
    let reward: ChestReward | null = null;
    let cost = 0;

    if (type === 'wooden') {
      cost = Math.floor(200 * Math.pow(1.15, level - 1));
    } else {
      cost = 0; // Ad chest is free
    }

    const rand = Math.random();
    let loot: ChestReward;

    if (type === 'wooden') {
      if (rand < 0.7) {
        const minGold = Math.floor(cost * 0.5);
        const maxGold = Math.floor(cost * 1.2);
        const goldAmount = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
        loot = {
          type: 'gold',
          amount: goldAmount,
          message: `A MODEST LOOT... ${formatNumber(goldAmount).toUpperCase()} GOLD`,
        };
      } else if (rand < 0.9) {
        const minGold = Math.floor(cost * 2);
        const maxGold = Math.floor(cost * 3);
        const goldAmount = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
        loot = {
          type: 'gold',
          amount: goldAmount,
          message: `A WEALTHY FIND! ${formatNumber(goldAmount).toUpperCase()} GOLD`,
        };
      } else {
        const upgradeIds = ['weapon', 'mercenary', 'critical'];
        const upgradeNames = ['Weapon Upgrade', 'Mercenaries', 'Critical Hit'];
        const randomIndex = Math.floor(Math.random() * upgradeIds.length);
        const randomUpgradeId = upgradeIds[randomIndex];
        const randomUpgradeName = upgradeNames[randomIndex];
        loot = {
          type: 'upgrade',
          upgradeId: randomUpgradeId,
          amount: 1,
          message: `YOU GAINED +1 ${randomUpgradeName}!`,
        };
      }
    } else {
      // Ad chest - guaranteed high value
      if (rand < 0.7) {
        // EL ARREGLO: Base de 5000 (10 veces más que el de madera) pero escalando a 1.2
        const goldAmount = Math.floor(2000 * Math.pow(1.15, level - 1));
        loot = { type: 'gold', amount: goldAmount, message: `YOU FOUND ${formatNumber(goldAmount).toUpperCase()} GOLD!` };
      } else {
        // Mejora mejorada: ¡En lugar de +1, el anuncio te da +2 niveles para que merezca más la pena!
        loot = { type: 'upgrade', upgradeId: 'permanent_damage', amount: 2, message: 'YOU GAINED +2 PERMANENT CLICK DAMAGE!' };
      }
    }

    reward = loot;

    return { reward, cost };
  }, []);

  const collectChest = useCallback((reward: ChestReward | null, cost: number = 0) => {
    if (!reward) return;

    setGameState((prev) => {
      let newGold = prev.gold - cost; // Deduct cost here
      let newUpgrades = [...prev.upgrades];

      if (reward.type === 'gold' && reward.amount) {
        newGold += reward.amount;
      }

      if (reward.type === 'upgrade' && reward.upgradeId && reward.amount) {
        if (reward.upgradeId === 'permanent_damage') {
          const weaponIndex = newUpgrades.findIndex((u) => u.id === 'weapon');
          if (weaponIndex !== -1) {
            newUpgrades[weaponIndex] = {
              ...newUpgrades[weaponIndex],
              level: newUpgrades[weaponIndex].level + reward.amount,
            };
          }
        } else {
          const upgradeIndex = newUpgrades.findIndex((u) => u.id === reward.upgradeId);
          if (upgradeIndex !== -1) {
            newUpgrades[upgradeIndex] = {
              ...newUpgrades[upgradeIndex],
              level: newUpgrades[upgradeIndex].level + reward.amount,
            };
          }
        }
      }

      const stats = calculateStatsFromUpgrades(newUpgrades, prev.demonSouls);

      return {
        ...prev,
        gold: newGold,
        upgrades: newUpgrades,
        ...stats,
      };
    });
  }, []);

  // Prestige function
  const prestige = useCallback(() => {
    setGameState((prev) => {
      const pendingSouls = calculatePendingSouls(prev.level);
      const newDemonSouls = prev.demonSouls + pendingSouls;
      const newUpgrades = initialUpgrades.map(u => ({ ...u }));
      const stats = calculateStatsFromUpgrades(newUpgrades, newDemonSouls);

      return {
        ...getInitialState(),
        demonSouls: newDemonSouls,
        upgrades: newUpgrades,
        ...stats,
      };
    });
  }, []);

  return {
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
  };
}