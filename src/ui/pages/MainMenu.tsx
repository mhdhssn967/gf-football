import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '@/stores/useGameStore'
import { LEVELS } from '@/levels/levelsConfig'
import { Button } from '@/components/Button'
import { Volume2, VolumeX, Play, Trophy, HelpCircle, X, Award } from 'lucide-react'
import './MainMenu.css'

const MainMenu: React.FC = () => {
  const navigate = useNavigate()
  const {
    highScore,
    isSoundEnabled,
    isMusicEnabled,
    toggleSound,
    toggleMusic,
    setLevel,
    startGame,
  } = useGameStore()

  const [showLevelsModal, setShowLevelsModal] = useState(false)
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false)

  const handleSelectLevel = (levelIndex: number) => {
    setLevel(levelIndex)
    setShowLevelsModal(false)
    startGame()
    navigate('/game')
  }

  const handlePlayDefault = () => {
    // Starts from level 0 or current level
    startGame()
    navigate('/game')
  }

  return (
    <div className="main-menu-container">
      <div className="menu-background">
        <div className="pitch-grid-overlay"></div>
        <div className="menu-glow-1"></div>
        <div className="menu-glow-2"></div>
      </div>

      <div className="menu-card">
        {/* Header Section */}
        <header className="menu-header">
          <div className="trophy-badge">
            <Trophy size={16} className="trophy-icon" />
            <span>High Score: {highScore}</span>
          </div>

          <h1 className="menu-title">
            KICK<span className="accent">TACTICS</span>
          </h1>
          <p className="menu-tagline">Solve with Kicks, Score with Brain</p>
        </header>

        {/* Action Buttons Section */}
        <div className="menu-actions">
          <Button variant="primary" size="lg" onClick={handlePlayDefault} className="play-btn">
            <Play size={20} fill="currentColor" /> Play Game
          </Button>

          <Button variant="secondary" size="md" onClick={() => setShowLevelsModal(true)}>
            <Award size={18} /> Select Level
          </Button>

          <Button variant="ghost" size="md" onClick={() => setShowHowToPlayModal(true)}>
            <HelpCircle size={18} /> How to Play
          </Button>
        </div>

        {/* Footer Settings Control */}
        <footer className="menu-footer">
          <button
            onClick={toggleSound}
            className={`setting-toggle-btn ${isSoundEnabled ? 'active' : ''}`}
            aria-label="Toggle Sound Effects"
          >
            {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span>SFX</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`setting-toggle-btn ${isMusicEnabled ? 'active' : ''}`}
            aria-label="Toggle Music"
          >
            {isMusicEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            <span>Music</span>
          </button>
        </footer>
      </div>

      {/* Levels Modal */}
      {showLevelsModal && (
        <div className="modal-backdrop" onClick={() => setShowLevelsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Level</h2>
              <button className="close-btn" onClick={() => setShowLevelsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="levels-list">
              {LEVELS.map((lvl, index) => (
                <button
                  key={lvl.id}
                  className="level-item-card"
                  onClick={() => handleSelectLevel(index)}
                >
                  <div className="level-item-info">
                    <span className="level-item-num">Lvl {lvl.id}</span>
                    <span className="level-item-name">{lvl.name}</span>
                  </div>
                  <div className="level-item-meta">
                    <span className={`difficulty-badge ${lvl.difficulty}`}>
                      {lvl.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How To Play Modal */}
      {showHowToPlayModal && (
        <div className="modal-backdrop" onClick={() => setShowHowToPlayModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>How to Play</h2>
              <button className="close-btn" onClick={() => setShowHowToPlayModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="instruction-content">
              <div className="step-card">
                <div className="step-number">1</div>
                <p>Drag back from the ball to set power and trajectory, then release to shoot.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <p>Avoid defenders, blocks, and walls to bypass puzzles.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <p>Land the football inside the net to score points and advance to the next level.</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <p>Each level has a maximum number of kicks. Solve the puzzle before you run out!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainMenu
