import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Github, Star, Zap } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-20 border-b border-dark-800/50 backdrop-blur-xl bg-dark-900/50"
    >
      {/* Subtle glow effect on border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
      
      <div className="px-4 lg:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.05 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 shadow-lg shadow-primary-500/30 group"
            >
              <Sparkles className="w-5 h-5 text-white relative z-10" />
              {/* Animated glow */}
              <motion.div 
                className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-50 blur-md"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
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
              <h1 className="text-lg font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                AI Research Agent
              </h1>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-dark-800/60 transition-colors hidden sm:flex items-center gap-1.5 group"
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4 text-dark-400 group-hover:text-white transition-colors" />
              <Star className="w-3.5 h-3.5 text-dark-500 group-hover:text-yellow-400 transition-colors" />
            </motion.a>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 bg-dark-800/50 rounded-lg px-3 py-1.5 border border-dark-700/50"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-dark-400 font-medium hidden sm:inline">Online</span>
              <div className="h-3 w-px bg-dark-700/50 hidden sm:block" />
              <span className="text-xs text-dark-500 font-mono hidden sm:inline">v0.1</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
