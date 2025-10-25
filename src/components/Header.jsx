import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Github, Moon, Sun } from 'lucide-react';

const Header = ({ darkMode, toggleDarkMode }) => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative z-20 border-b border-dark-800/50 backdrop-blur-xl bg-dark-900/50"
    >
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">
                AI Research Agent
              </h1>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg hover:bg-dark-800/50 transition-colors hidden sm:block"
              aria-label="View on GitHub"
            >
              <Github className="w-4 h-4 text-dark-400" />
            </motion.button>
            
            <motion.div
              className="flex items-center gap-1.5 bg-dark-800/50 rounded-lg px-2.5 py-1.5"
            >
              <span className="text-xs text-dark-500 hidden sm:inline">v2.0</span>
              <div className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-[10px] font-medium">
                PRO
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
