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
      className="fixed bottom-0 left-0 right-0 backdrop-blur-2xl z-50 safe-area-bottom"
      style={{
        background: 'rgba(13, 17, 23, 0.98)',
        borderTop: '1px solid rgba(30, 36, 44, 0.8)',
        boxShadow: '0 -4px 24px -2px rgba(0, 0, 0, 0.5), 0 -1px 0 0 rgba(47, 129, 247, 0.15)'
      }}
    >
      {/* Subtle gradient line on top */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(47, 129, 247, 0.3), transparent)'
        }}
      />
      
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
                  className="absolute inset-0 rounded-2xl backdrop-blur-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(22, 27, 34, 0.7) 0%, rgba(22, 27, 34, 0.5) 100%)',
                    border: '1px solid rgba(30, 36, 44, 0.8)',
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(230, 237, 243, 0.05)'
                  }}
                />
              )}
              
              <motion.div
                className="relative p-2.5 rounded-xl"
                style={
                  isActive 
                    ? { 
                        background: section.id === 'input' 
                          ? '#000000'
                          : section.id === 'output'
                          ? 'linear-gradient(135deg, #3B82F6, #2563eb)'
                          : 'linear-gradient(135deg, #3FB950, #2ea043)',
                        boxShadow: section.id === 'input'
                          ? '0 4px 12px -2px rgba(0, 0, 0, 0.6)'
                          : section.id === 'output'
                          ? '0 4px 12px -2px rgba(47, 129, 247, 0.4)'
                          : '0 4px 12px -2px rgba(63, 185, 80, 0.4)'
                      }
                    : { 
                        background: 'rgba(22, 27, 34, 0.6)',
                        border: '1px solid rgba(30, 36, 44, 0.8)'
                      }
                }
                animate={isActive ? { 
                  scale: [1, 1.05, 1],
                  boxShadow: section.id === 'input'
                    ? [
                        '0 4px 12px -2px rgba(0, 0, 0, 0.6)',
                        '0 8px 16px -2px rgba(0, 0, 0, 0.7)',
                        '0 4px 12px -2px rgba(0, 0, 0, 0.6)'
                      ]
                    : [
                        '0 4px 12px -2px rgba(47, 129, 247, 0.4)',
                        '0 8px 16px -2px rgba(47, 129, 247, 0.5)',
                        '0 4px 12px -2px rgba(47, 129, 247, 0.4)'
                      ]
                } : {}}
                transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2 }}
              >
                <Icon className="w-5 h-5 relative z-10" 
                  style={{ color: isActive ? '#E6EDF3' : '#6E7681' }}
                />
                {isActive && (
                  <motion.div
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-xl blur-md"
                    style={{
                      background: section.id === 'input'
                        ? 'rgba(0, 0, 0, 0.5)'
                        : section.id === 'code' 
                        ? 'linear-gradient(135deg, rgba(63, 185, 80, 0.4), rgba(46, 160, 67, 0.4))'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.4))'
                    }}
                  />
                )}
              </motion.div>
              
              <span className="relative text-xs font-semibold"
                style={{ color: isActive ? '#E6EDF3' : '#6E7681' }}
              >
                {section.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNavigation;
