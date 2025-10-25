import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Download, Copy, Check, Edit3, Play, Terminal } from 'lucide-react';

const CodeSection = ({ pythonCode, onUpdateCode, isMobile }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(pythonCode);
  
  React.useEffect(() => {
    setEditedCode(pythonCode);
  }, [pythonCode]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'experiment.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSaveEdit = () => {
    onUpdateCode(editedCode);
    setIsEditing(false);
  };
  
  // No syntax highlighting - just display plain text
  // The highlighting was causing HTML rendering issues
  const highlightCode = (code) => {
    return code || '';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col min-h-0 h-full backdrop-blur-xl"
      style={{
        background: 'rgba(13, 17, 23, 0.6)'
      }}
    >
      {/* Section header */}
      <div className="px-6 py-4 backdrop-blur-sm min-h-[76px] flex items-center"
        style={{
          borderBottom: '1px solid rgba(30, 36, 44, 0.8)',
          background: 'rgba(13, 17, 23, 0.5)'
        }}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl"
              style={{
                background: 'rgba(63, 185, 80, 0.15)',
                border: '1px solid rgba(63, 185, 80, 0.25)'
              }}
            >
              <Terminal className="w-4 h-4" style={{ color: '#3FB950' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Python Code</h2>
            </div>
          </div>
          
          {pythonCode && (
            <motion.a
              href={`https://colab.research.google.com/`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 group"
              style={{
                background: 'linear-gradient(to right, #3FB950, #2ea043)',
                color: '#E6EDF3',
                boxShadow: '0 4px 12px -2px rgba(63, 185, 80, 0.3)'
              }}
            >
              <Play className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              Run in Colab
            </motion.a>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      {pythonCode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 flex gap-2"
          style={{
            borderBottom: '1px solid rgba(30, 36, 44, 0.8)',
            background: 'rgba(13, 17, 23, 0.4)'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="p-2.5 rounded-xl transition-all group"
            style={{
              background: 'rgba(22, 27, 34, 0.8)',
              border: '1px solid rgba(30, 36, 44, 0.8)',
              color: '#E6EDF3'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 36, 44, 0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22, 27, 34, 0.8)'}
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4" style={{ color: '#3FB950' }} />
            ) : (
              <Copy className="w-4 h-4 transition-colors" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="p-2.5 rounded-xl transition-all group"
            style={{
              background: 'rgba(22, 27, 34, 0.8)',
              border: '1px solid rgba(30, 36, 44, 0.8)',
              color: '#E6EDF3'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 36, 44, 0.9)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22, 27, 34, 0.8)'}
            title="Download as .py"
          >
            <Download className="w-4 h-4 transition-colors" />
          </motion.button>
          
          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="p-2.5 rounded-xl transition-all group"
              style={{
                background: 'rgba(22, 27, 34, 0.8)',
                border: '1px solid rgba(30, 36, 44, 0.8)',
                color: '#E6EDF3'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 36, 44, 0.9)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22, 27, 34, 0.8)'}
              title="Edit code"
            >
              <Edit3 className="w-4 h-4 transition-colors" />
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: 'linear-gradient(to right, #3FB950, #2ea043)',
                  color: '#E6EDF3',
                  boxShadow: '0 4px 12px -2px rgba(63, 185, 80, 0.3)'
                }}
              >
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditedCode(pythonCode);
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: 'rgba(22, 27, 34, 0.8)',
                  border: '1px solid rgba(30, 36, 44, 0.8)',
                  color: '#E6EDF3'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(30, 36, 44, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(22, 27, 34, 0.8)'}
              >
                Cancel
              </motion.button>
            </>
          )}
        </motion.div>
      )}
      
      {/* Code editor/display */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!pythonCode ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full p-8"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative mb-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-dark-800/60 to-dark-800/40 border border-dark-700/50 flex items-center justify-center backdrop-blur-sm">
                <Code2 className="w-10 h-10 text-dark-500" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-green-500/20 blur-xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <h3 className="text-lg font-semibold" style={{ color: '#E6EDF3' }}>No code yet</h3>
              <p className="text-sm max-w-xs" style={{ color: '#6E7681' }}>
                Python implementation will appear here after generation
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(63, 185, 80, 0.5)' }} />
                <p className="text-xs" style={{ color: '#484F58' }}>
                  Generate a paper to see the code
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="pb-12" style={{ background: 'rgba(13, 17, 23, 0.9)' }}>
            {isEditing ? (
              <div className="relative group p-6">
                <textarea
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  className="w-full min-h-[600px] p-6 rounded-2xl border-2 font-mono text-sm leading-relaxed resize-none transition-all backdrop-blur-sm shadow-inner"
                  style={{
                    background: 'rgba(22, 27, 34, 0.6)',
                    borderColor: '#21262D',
                    color: '#9BA3AF',
                    tabSize: 4
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3FB950'}
                  onBlur={(e) => e.target.style.borderColor = '#21262D'}
                  spellCheck={false}
                />
                <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"
                  style={{
                    background: 'linear-gradient(to right, transparent, rgba(63, 185, 80, 0.1), transparent)'
                  }}
                />
              </div>
            ) : (
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 w-14 text-right pr-3 pt-6 pb-12 select-none backdrop-blur-sm"
                  style={{
                    background: 'rgba(13, 17, 23, 0.7)',
                    color: '#484F58',
                    borderRight: '1px solid rgba(30, 36, 44, 0.8)'
                  }}
                >
                  {pythonCode.split('\n').map((_, i) => (
                    <div key={i} className="font-mono text-xs leading-relaxed">
                      {i + 1}
                    </div>
                  ))}
                </div>
                
                {/* Code content with subtle background */}
                <div className="pl-16 pr-6 pt-6 pb-12"
                  style={{
                    background: 'linear-gradient(135deg, rgba(13, 17, 23, 0.6) 0%, rgba(22, 27, 34, 0.4) 100%)'
                  }}
                >
                  <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: '#9BA3AF' }}
                  >
                    {pythonCode}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CodeSection;
