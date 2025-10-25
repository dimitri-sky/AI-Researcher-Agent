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
      className="fixed bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-xl border-t border-dark-800/50 z-50"
    >
      <div className="flex justify-around items-center py-2 px-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => !section.disabled && onSectionChange(section.id)}
              disabled={section.disabled}
              className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all ${
                section.disabled 
                  ? 'opacity-30 cursor-not-allowed' 
                  : isActive 
                    ? '' 
                    : 'hover:bg-dark-800/50'
              }`}
            >
              <motion.div
                className={`p-2 rounded-lg ${
                  isActive 
                    ? `bg-gradient-to-br ${section.color}` 
                    : 'bg-dark-800'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-dark-400'}`} />
              </motion.div>
              <span className={`text-xs font-medium ${
                isActive ? 'text-white' : 'text-dark-400'
              }`}>
                {section.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-xl border-2 border-primary-500/30 pointer-events-none"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
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
