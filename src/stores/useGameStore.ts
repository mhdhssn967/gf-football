import { create } from 'zustand'

export type GamePhase = 'MENU' | 'LOADING' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY'

interface GameState {
  // State variables
  phase: GamePhase
  score: number
  highScore: number
  currentLevelIndex: number
  kicksRemaining: number
  isSoundEnabled: boolean
  isMusicEnabled: boolean

  // Actions
  setPhase: (phase: GamePhase) => void
  startGame: () => void
  pauseGame: () => void
  resumeGame: () => void
  resetLevel: () => void
  nextLevel: () => void
  addScore: (points: number) => void
  toggleSound: () => void
  toggleMusic: () => void
  decrementKicks: () => void
  setLevel: (index: number) => void
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'MENU',
  score: 0,
  highScore: 0,
  currentLevelIndex: 0,
  kicksRemaining: 3,
  isSoundEnabled: true,
  isMusicEnabled: true,

  setPhase: (phase) => set({ phase }),
  startGame: () => set({ phase: 'PLAYING', score: 0, kicksRemaining: 3 }),
  pauseGame: () =>
    set((state) => {
      if (state.phase === 'PLAYING') return { phase: 'PAUSED' }
      return {}
    }),
  resumeGame: () =>
    set((state) => {
      if (state.phase === 'PAUSED') return { phase: 'PLAYING' }
      return {}
    }),
  resetLevel: () => set({ score: 0, kicksRemaining: 3, phase: 'PLAYING' }),
  nextLevel: () =>
    set((state) => ({
      currentLevelIndex: state.currentLevelIndex + 1,
      kicksRemaining: 3,
      phase: 'PLAYING',
    })),
  addScore: (points) =>
    set((state) => {
      const newScore = state.score + points
      return {
        score: newScore,
        highScore: Math.max(newScore, state.highScore),
      }
    }),
  toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
  toggleMusic: () => set((state) => ({ isMusicEnabled: !state.isMusicEnabled })),
  decrementKicks: () => set((state) => ({ kicksRemaining: Math.max(0, state.kicksRemaining - 1) })),
  setLevel: (index) => set({ currentLevelIndex: index }),
}))
