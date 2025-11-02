import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import Header from './components/Header'
import Footer from './components/Footer'
import DetailModal from './components/DetailModal'
import GameScene from './components/GameScene'
import FrontPage from './components/FrontPage'
import './index.css'

const USER_PROFILE = {
  name: 'Roshan Sah',
  title: 'M.Sc. Information & Communication (Pursuing) || B.Sc. Electronics (2023) || Web Development & Machine Learning Enthusiast || Exploring Software Development || Tech Learner',
  bio: `I am currently pursuing my Master’s in Information & Communication, with a background in Electronics.

During my academic journey, I’ve developed an interest in software development, web technologies, and applied machine learning. My goal is to build practical skills that help me solve real-world problems through technology.

I’m a curious learner who enjoys exploring how both hardware and software work together, and I’m constantly improving my understanding of coding, databases, and cloud-based applications.

Looking forward to collaborating, learning, and growing in the tech field.`,
  links: {
    linkedin: 'https://www.linkedin.com/in/roshan-sah-0b1371219',
    github: 'https://github.com/roshankumar0735-cmd',
    email: 'roshankumar0735@gmail.com'
  },
  experience: [{ role: 'Fresher', company: '—', years: '0+ Year' }],
  projects: [{ name: 'Gamified Portfolio', desc: 'My first project — an interactive 3D portfolio built with React and Three.js.' }],
  qualification: [
    { degree: 'M.Sc. Informatics and Communication', year: '2026' },
    { degree: 'B.Sc. Electronics', year: '2023' }
  ],
  skills: [
    'Web Development', 'Python', 'Cyber Laws and Information Security', 'NI Multisim', 'Scilab',
    'Canva', 'MySQL', 'JavaScript', 'HTML', 'CSS', 'Office 365', 'C/C++ Programming'
  ]
}

export default function App() {
  const [gameMode, setGameMode] = useState(false)
  const [active, setActive] = useState(null)
  const [rotateAstronaut, setRotateAstronaut] = useState(true)
  const [musicOn, setMusicOn] = useState(false)
  const form = useRef()
  
  // Game state
  const [arrowsRemaining, setArrowsRemaining] = useState(5)
  const [hitSpheres, setHitSpheres] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const gameSceneRef = useRef()
  
  // Total spheres to hit (8 spheres)
  const TOTAL_SPHERES = 8
  
  // Reset game when entering game mode
  useEffect(() => {
    if (gameMode) {
      setArrowsRemaining(5)
      setHitSpheres([])
      setGameOver(false)
      setGameWon(false)
      setActive(null)
    }
  }, [gameMode])
  
  // Win condition removed - game only ends when arrows run out (misses)
  
  const resetGame = () => {
    setArrowsRemaining(5)
    setHitSpheres([])
    setGameOver(false)
    setGameWon(false)
    setActive(null)
  }
  
  const handleSphereHit = (sphereId, index) => {
    if (!hitSpheres.includes(sphereId)) {
      setHitSpheres(prev => {
        const newHitSpheres = [...prev, sphereId]
        
        // Check if all spheres are hit (win condition)
        if (newHitSpheres.length >= TOTAL_SPHERES) {
          console.log(`🎉 All ${TOTAL_SPHERES} spheres hit! You Win!`)
          setTimeout(() => {
            setGameWon(true)
          }, 500)
        }
        
        return newHitSpheres
      })
      // Info box will be shown in GameScene component
    }
  }
  
  const handleArrowMiss = () => {
    console.log('🎯 handleArrowMiss() CALLED - Arrow missed! Decreasing count...')
    console.log('Current state - arrowsRemaining:', arrowsRemaining, 'gameOver:', gameOver, 'gameWon:', gameWon)
    
    // Don't process miss if game is already over or won
    if (gameOver || gameWon) {
      console.log('⚠️ Game already over/won, ignoring miss')
      return
    }
    
    setArrowsRemaining(prev => {
      console.log('setArrowsRemaining called with prev:', prev)
      
      // CRITICAL: Double-check gameOver state using functional update to get latest value
      // This prevents processing misses after game is over
      setGameOver(currentGameOver => {
        if (currentGameOver) {
          console.log('⚠️ Game already over (checked via ref), skipping miss')
          return currentGameOver // Keep it true
        }
        return currentGameOver // Return unchanged
      })
      
      // Double-check again in this scope
      if (gameOver) {
        console.log('⚠️ Game already over, skipping miss')
        return prev
      }
      
      // Ensure we have arrows to decrease
      if (prev <= 0) {
        console.log(`⚠️ Already at 0 arrows (prev: ${prev}), skipping miss`)
        return 0 // Already at 0, don't go negative
      }
      
      // Ensure prev is a valid number (should be 5, 4, 3, 2, or 1)
      if (prev < 1 || prev > 5) {
        console.log(`⚠️ Invalid arrow count: ${prev}, resetting to 5`)
        return 5 // Reset to valid value
      }
      
      const newCount = prev - 1
      console.log(`✅ Decreased! Arrows remaining: ${prev} → ${newCount}`)
      
      // Game Over condition: After 5 missed shots (arrowsRemaining reaches 0)
      // IMPORTANT: Only trigger game over when count reaches exactly 0 (after 5 misses)
      // This should ONLY happen when prev was 1 and we decrement to 0
      if (newCount === 0 && prev === 1) {
        console.log('🛑 Game Over! 5 arrows missed. Triggering game over...')
        // Game ends when all 5 arrows are missed - trigger after a short delay to allow UI update
        setTimeout(() => {
          console.log('🛑 Setting gameOver to true')
          setGameOver(true)
        }, 500)
      } else if (newCount === 0) {
        console.error(`⚠️ ERROR: newCount is 0 but prev was ${prev} (expected 1)! This shouldn't happen!`)
      }
      
      return newCount
    })
  }
  
  const handleReleaseArrow = () => {
    console.log(`🎯 Release Arrow clicked! Current count: ${arrowsRemaining}, gameOver: ${gameOver}, gameWon: ${gameWon}`)
    if (arrowsRemaining > 0 && !gameOver && !gameWon) {
      if (gameSceneRef.current && gameSceneRef.current.fireArrow) {
        console.log('✅ Firing arrow - count will NOT decrease (only decreases on MISS)')
        // Fire arrow but DON'T decrease count yet - only decrease on miss
        gameSceneRef.current.fireArrow()
      } else {
        console.error('❌ Cannot fire arrow - gameSceneRef or fireArrow not available')
      }
    } else {
      console.log('⚠️ Cannot fire arrow:', {
        arrowsRemaining,
        gameOver,
        gameWon
      })
    }
  }
  
  const handleCloseModal = () => {
    setActive(null)
  }
  
  const handleRestartGame = () => {
    resetGame()
  }

  const slideVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  }

  // ✅ EmailJS Function
  const sendEmail = (e) => {
    e.preventDefault()

    emailjs
      .sendForm(
        'service_5wmmsdn',   // replace with your EmailJS Service ID
        'template_v5vt919',  // replace with your EmailJS Template ID
        form.current,
        '1BwCYbp-mDHwROj5w'  // replace with your EmailJS Public Key
      )
      .then(
        () => {
          alert('✅ Message sent successfully!')
          form.current.reset()
        },
        (error) => {
          alert('❌ Failed to send message. Please try again.')
          console.error(error)
        }
      )
  }

  const sections = [
    {
      title: 'About Me',
      content: <p className="text-white/80 whitespace-pre-line">{USER_PROFILE.bio}</p>
    },
    {
      title: 'Projects',
      content: USER_PROFILE.projects.map((p, i) => (
        <div key={i} className="mt-3 p-3 bg-white/5 rounded-lg hover:bg-white/20 transition-all">
          <div className="font-bold">{p.name}</div>
          <div className="text-sm mt-1 text-gray-300">{p.desc}</div>
        </div>
      ))
    },
    {
      title: 'Experience',
      content: USER_PROFILE.experience.map((e, i) => (
        <div key={i} className="mt-3 p-3 bg-white/5 rounded-lg">
          {e.role} — {e.company}
          <div className="text-sm mt-1 text-gray-400">{e.years}</div>
        </div>
      ))
    },
    {
      title: 'Skills',
      content: (
        <div className="flex flex-wrap gap-2 mt-3">
          {USER_PROFILE.skills.map((s, i) => (
            <span key={i} className="px-3 py-1 bg-white/10 rounded-lg hover:bg-blue-500/30 transition-all">
              {s}
            </span>
          ))}
        </div>
      )
    },
    {
      title: 'Qualification',
      content: USER_PROFILE.qualification.map((q, i) => (
        <div key={i} className="p-3 bg-white/5 rounded-lg mb-2 hover:bg-white/20 transition-all">
          {q.degree} — {q.year}
        </div>
      ))
    },
    {
      title: "Let's Talk",
      content: (
        <form ref={form} onSubmit={sendEmail} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="user_name"
              placeholder="Full Name"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="user_email"
              placeholder="Email"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <textarea
            name="message"
            placeholder="Your Message..."
            rows="4"
            required
            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all"
            >
              🚀 Send Message
            </button>
          </div>
        </form>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: 'Inter, system-ui, Arial' }}>
      <Header
        name={USER_PROFILE.name}
        title={USER_PROFILE.title}
        onToggleGame={() => setGameMode(g => !g)}
        gameMode={gameMode}
      />

      <main className="p-6">
        {!gameMode ? (
          <div className="max-w-5xl mx-auto space-y-10">
            <FrontPage />

            {/* 🌈 Animated glassy gradient sections */}
            {sections.map((section, i) => (
              <motion.section
                key={i}
                className="p-6 rounded-2xl shadow-xl backdrop-blur-md border border-white/10 
                           bg-[length:200%_200%] animate-nebula-glow transition-transform duration-500"
                variants={slideVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-3xl font-bold text-blue-300 mb-3">{section.title}</h2>
                {section.content}
              </motion.section>
            ))}
          </div>
        ) : (
          <section className="w-full h-[78vh] rounded-lg overflow-hidden relative border border-white/5">
            <GameScene
              ref={gameSceneRef}
              onHit={handleSphereHit}
              onMiss={handleArrowMiss}
              arrowsRemaining={arrowsRemaining}
              hitSpheres={hitSpheres}
              gameOver={gameOver}
            />
            <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 60 }}>
              <button onClick={() => setGameMode(false)} className="px-3 py-2 bg-white/10 rounded">
                🏠 Home
              </button>
            </div>
          </section>
        )}
      </main>

      <DetailModal id={active} profile={USER_PROFILE} onClose={handleCloseModal} />

      {/* Game Over Modal - Shows after 5 missed shots */}
      <AnimatePresence>
        {gameOver && !gameWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleRestartGame}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-red-900/90 to-orange-900/90 backdrop-blur-md p-8 rounded-2xl border border-red-500/50 shadow-2xl max-w-md w-full mx-4"
            >
              <h2 className="text-4xl font-bold text-center mb-4 text-red-200">Game Over!</h2>
              <p className="text-center text-white/90 mb-2">You've missed 5 arrows!</p>
              <p className="text-center text-white/70 mb-6">
                You hit <span className="text-yellow-400 font-bold">{hitSpheres.length}</span> out of {TOTAL_SPHERES} spheres.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleRestartGame}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-bold hover:scale-105 transition-all"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => setGameMode(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 rounded-lg font-bold hover:scale-105 transition-all"
                >
                  🏠 Back to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* You Win Modal */}
      <AnimatePresence>
        {gameWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleRestartGame}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-green-900/90 to-emerald-900/90 backdrop-blur-md p-8 rounded-2xl border border-green-500/50 shadow-2xl max-w-md w-full mx-4"
            >
              <h2 className="text-4xl font-bold text-center mb-4 text-green-200">🎉 You Win!</h2>
              <p className="text-center text-white/90 mb-2">Congratulations! You hit all {TOTAL_SPHERES} spheres!</p>
              <p className="text-center text-white/70 mb-6">
                You used <span className="text-yellow-400 font-bold">{5 - arrowsRemaining}</span> out of 5 arrows.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleRestartGame}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:scale-105 transition-all"
                >
                  🔄 Play Again
                </button>
                <button
                  onClick={() => setGameMode(false)}
                  className="flex-1 px-6 py-3 bg-gray-700 rounded-lg font-bold hover:scale-105 transition-all"
                >
                  🏠 Back to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer 
        onToggleGame={() => setGameMode(g => !g)} 
        gameMode={gameMode}
        onReleaseArrow={handleReleaseArrow}
        arrowsRemaining={arrowsRemaining}
      />
    </div>
  )
}