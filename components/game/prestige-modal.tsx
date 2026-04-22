"use client";

import { useState } from "react";
import { formatNumber } from "@/hooks/use-game";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Flame } from "lucide-react";

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingSouls: number;
  currentMultiplier: number;
  level: number;
}

export function PrestigeModal({
  isOpen,
  onClose,
  onConfirm,
  pendingSouls,
  currentMultiplier,
  level,
}: PrestigeModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="border-2 border-red-900 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3 justify-center">
            <Flame className="w-8 h-8 text-red-500 animate-pulse" />
            <AlertDialogTitle className="text-2xl font-bold text-red-500 text-center">
              DARK ASCENSION
            </AlertDialogTitle>
            <Flame className="w-8 h-8 text-red-500 animate-pulse" />
          </div>

          <AlertDialogDescription className="space-y-4 text-center">
            <span className="block mt-2 text-red-300 font-semibold text-lg">
              THE POINT OF NO RETURN
            </span>

            <span className="block mt-2 space-y-3 text-sm flex flex-col">
              <span className="block p-3 bg-red-950/50 rounded border border-red-800 flex flex-col">
                <span className="text-red-200 font-semibold">Current Stage: {level}</span>
                <span className="text-red-400 mt-2 block">
                  You will earn <span className="text-red-300 font-bold text-lg">{pendingSouls}</span> DEMON SOULS
                </span>
              </span>

              <span className="block p-3 bg-slate-900/50 rounded border border-slate-700 flex flex-col">
                <span className="text-slate-300 text-xs mb-2">Upon ascension:</span>
                <span className="text-slate-300 space-y-1 text-xs flex flex-col items-center">
                  <span className="block">✗ All gold will be lost</span>
                  <span className="block">✗ All upgrades will be reset to level 0</span>
                  <span className="block">✗ You will return to Stage 1</span>
                  <span className="block text-purple-300">✓ You will keep all Demon Souls</span>
                </span>
              </span>

              <span className="block p-3 bg-amber-950/50 rounded border border-amber-700 flex flex-col">
                <span className="text-amber-300 font-semibold">
                  New Multiplier: +{Math.round((currentMultiplier - 1) * 100)}% Power
                </span>
                <span className="text-amber-200 text-xs mt-2 block">
                  (+{pendingSouls * 10}% Damage & Gold from {pendingSouls} new souls)
                </span>
              </span>
            </span>

            <span className="text-red-400 text-sm font-bold block mt-4">
              ARE YOU READY TO ASCEND TO GREATER POWER?
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-3 justify-center mt-6">
          <AlertDialogCancel className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600">
            Stay Behind
          </AlertDialogCancel>
          <AlertDialogAction className="bg-red-700 hover:bg-red-600 text-white border-red-600" onClick={handleConfirm}>
            Ascend Now
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
