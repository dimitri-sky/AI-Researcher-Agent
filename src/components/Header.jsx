import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Github, Star, Zap, Rocket } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-20 backdrop-blur-xl"
      style={{
        borderBottom: '1px solid rgba(30, 36, 44, 0.8)',
        background: 'rgba(13, 17, 23, 0.6)'
      }}
    >
      {/* Subtle glow effect on border */}
      <div className="absolute bottom-0 left-0 right-0 h-px" 
        style={{
          background: 'linear-gradient(to right, transparent, rgba(47, 129, 247, 0.25), transparent)'
        }}
      />
      
      <div className="px-4 lg:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.05 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative p-2.5 rounded-xl shadow-lg group"
              style={{
                background: '#000000',
                boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.6)'
              }}
            >
              <Rocket className="w-5 h-5 relative z-10" style={{ color: '#FFFFFF' }} />
              {/* Animated glow */}
              <motion.div 
                className="absolute inset-0 rounded-xl blur-md"
                style={{
                  background: '#000000',
                  opacity: 0
                }}
                animate={{ 
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight" 
                style={{ 
                  background: 'linear-gradient(to right, #E6EDF3, #E6EDF3, #9BA3AF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                AI Research Agent
              </h1>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <motion.a
              href="https://github.com/dimitri-sky/AI-Researcher-Agent"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 group"
              style={{ 
                background: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(22, 27, 34, 0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4 transition-colors" 
                style={{ color: '#6E7681' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#E6EDF3'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6E7681'}
              />
              <Star className="w-3.5 h-3.5 transition-colors" 
                style={{ color: '#484F58' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#F0B429'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#484F58'}
              />
            </motion.a>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{
                background: 'rgba(22, 27, 34, 0.6)',
                border: '1px solid rgba(30, 36, 44, 0.8)'
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3FB950' }} />
              <span className="text-xs font-medium hidden sm:inline" style={{ color: '#6E7681' }}>Online</span>
              <div className="h-3 w-px hidden sm:block" style={{ background: 'rgba(30, 36, 44, 0.8)' }} />
              <span className="text-xs font-mono hidden sm:inline" style={{ color: '#484F58' }}>v0.1</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
