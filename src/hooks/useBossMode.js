import { useState } from 'react';

export default function useBossMode(initialValue = false) {
  const [isBossMode, setIsBossMode] = useState(initialValue);

  function enterBossMode() {
    setIsBossMode(true);
  }

  function exitBossMode() {
    setIsBossMode(false);
  }

  function toggleBossMode() {
    setIsBossMode((currentValue) => !currentValue);
  }

  return {
    isBossMode,
    enterBossMode,
    exitBossMode,
    setIsBossMode,
    toggleBossMode,
  };
}
