import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, Code2 } from 'lucide-react';

const MobileNavigation = ({ activeSection, onSectionChange, hasContent }) => {
  const sections = [
    { id: 'input', label: 'Input', icon: MessageSquare, color: 'from-primary-400 to-primary-600' },
    { id: 'output', label: 'Paper', icon: FileText, color: 'from-blue-400 to-blue-600', disabled: !hasContent },
    { id: 'code', label: 'Code', icon: Code2, color: 'from-green-400 to-green-600', disabled: !hasContent },
  ];
  
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-dark-900/98 backdrop-blur-2xl border-t border-dark-800/50 z-50 safe-area-bottom"
      style={{
        boxShadow: '0 -4px 24px -2px rgba(0, 0, 0, 0.4), 0 -1px 0 0 rgba(59, 130, 246, 0.1)'
      }}
    >
      {/* Subtle gradient line on top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      
      <div className="flex justify-around items-center py-3 px-4 max-w-2xl mx-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.9 }}
              whileHover={!section.disabled ? { y: -2 } : {}}
              onClick={() => !section.disabled && onSectionChange(section.id)}
              disabled={section.disabled}
              className={`relative flex flex-col items-center gap-1.5 px-6 py-2.5 rounded-2xl transition-all ${
                section.disabled 
                  ? 'opacity-30 cursor-not-allowed' 
                  : 'active:scale-95'
              }`}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="active-bg"
                  className="absolute inset-0 bg-gradient-to-br from-dark-800/60 to-dark-800/40 border border-dark-700/50 rounded-2xl backdrop-blur-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
                  }}
                />
              )}
              
              <motion.div
                className={`relative p-2.5 rounded-xl ${
                  isActive 
                    ? `bg-gradient-to-br ${section.color} shadow-lg` 
                    : 'bg-dark-800/60 border border-dark-700/50'
                }`}
                animate={isActive ? { 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 4px 8px rgba(0, 0, 0, 0.2)',
                    '0 8px 16px rgba(0, 0, 0, 0.3)',
                    '0 4px 8px rgba(0, 0, 0, 0.2)'
                  ]
                } : {}}
                transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-dark-400'} relative z-10`} />
                {isActive && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/40 to-primary-600/40 blur-md"
                  />
                )}
              </motion.div>
              
              <span className={`relative text-xs font-semibold ${
                isActive ? 'text-white' : 'text-dark-400'
              }`}>
                {section.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-500"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNavigation;
