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
            <div className="text-red-300 font-semibold text-lg">
              THE POINT OF NO RETURN
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-950/50 rounded border border-red-800">
                <p className="text-red-200 font-semibold">Current Stage: {level}</p>
                <p className="text-red-400 mt-2">
                  You will earn <span className="text-red-300 font-bold text-lg">{pendingSouls}</span> DEMON SOULS
                </p>
              </div>

              <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
                <p className="text-slate-300 text-xs mb-2">Upon ascension:</p>
                <ul className="text-slate-300 space-y-1 text-xs">
                  <li>✗ All gold will be lost</li>
                  <li>✗ All upgrades will be reset to level 0</li>
                  <li>✗ You will return to Stage 1</li>
                  <li>✓ You will keep all Demon Souls</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-950/50 rounded border border-amber-700">
                <p className="text-amber-300 font-semibold">
                  New Multiplier: +{Math.round((currentMultiplier - 1) * 100)}% Power
                </p>
                <p className="text-amber-200 text-xs mt-2">
                  (+{pendingSouls * 10}% Damage & Gold from {pendingSouls} new souls)
                </p>
              </div>
            </div>

            <div className="text-red-400 text-sm font-bold">
              ARE YOU READY TO ASCEND TO GREATER POWER?
            </div>
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
