export interface ObstacleConfig {
  id: string
  type: 'wall' | 'moving' | 'bouncer'
  position: [number, number, number]
  size: [number, number, number]
  rotation?: [number, number, number]
}

export interface LevelConfig {
  id: number
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  description: string
  targetScore: number
  kicksAllowed: number
  ballStartPos: [number, number, number]
  goalPos: [number, number, number]
  obstacles: ObstacleConfig[]
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Kick Off',
    difficulty: 'easy',
    description: 'A clear path to the goal. Just kick the ball straight in!',
    targetScore: 100,
    kicksAllowed: 3,
    ballStartPos: [0, 0.5, 5],
    goalPos: [0, 0, -5],
    obstacles: [],
  },
]
