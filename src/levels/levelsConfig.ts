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
    goalPos: [0, 0, -10],
    obstacles: [],
  },
  {
    id: 2,
    name: 'The Wall',
    difficulty: 'medium',
    description: 'A wall blocks your direct shot. Curve the ball or bounce it off the edges!',
    targetScore: 200,
    kicksAllowed: 3,
    ballStartPos: [0, 0.5, 6],
    goalPos: [0, 0, -10],
    obstacles: [
      {
        id: 'wall_1',
        type: 'wall',
        position: [0, 1, -2],
        size: [4, 2, 0.5],
      },
    ],
  },
  {
    id: 3,
    name: 'Double Trouble',
    difficulty: 'hard',
    description: 'Two pillars are moving back and forth. Timing is everything.',
    targetScore: 300,
    kicksAllowed: 4,
    ballStartPos: [0, 0.5, 8],
    goalPos: [0, 0, -12],
    obstacles: [
      {
        id: 'pillar_1',
        type: 'moving',
        position: [-3, 1.5, -4],
        size: [1, 3, 1],
      },
      {
        id: 'pillar_2',
        type: 'moving',
        position: [3, 1.5, -4],
        size: [1, 3, 1],
      },
    ],
  },
]
