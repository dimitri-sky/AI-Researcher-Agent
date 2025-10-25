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
      className="flex flex-col min-h-0 h-full bg-dark-950/50 backdrop-blur-xl"
    >
      {/* Section header */}
      <div className="px-6 py-4 border-b border-dark-800/50 backdrop-blur-sm bg-dark-950/40 min-h-[76px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/20">
              <Terminal className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Python Code</h2>
            </div>
          </div>
          
          {pythonCode && (
            <motion.a
              href={`https://colab.research.google.com/`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white text-xs font-semibold hover:from-green-600 hover:via-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 flex items-center gap-2 group"
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
          className="px-6 py-3 border-b border-dark-800/50 flex gap-2 bg-dark-900/30"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-dark-700/50 text-white transition-all group"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 group-hover:text-primary-400 transition-colors" />
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="p-2.5 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-dark-700/50 text-white transition-all group"
            title="Download as .py"
          >
            <Download className="w-4 h-4 group-hover:text-primary-400 transition-colors" />
          </motion.button>
          
          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="p-2.5 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-dark-700/50 text-white transition-all group"
              title="Edit code"
            >
              <Edit3 className="w-4 h-4 group-hover:text-primary-400 transition-colors" />
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-semibold transition-all shadow-lg shadow-green-500/20"
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
                className="px-4 py-2 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-dark-700/50 text-white text-xs font-semibold transition-all"
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
              <h3 className="text-lg font-semibold text-white">No code yet</h3>
              <p className="text-dark-400 text-sm max-w-xs">
                Python implementation will appear here after generation
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                <p className="text-dark-600 text-xs">
                  Generate a paper to see the code
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="bg-dark-950/80 pb-12">
            {isEditing ? (
              <div className="relative group p-6">
                <textarea
                  value={editedCode}
                  onChange={(e) => setEditedCode(e.target.value)}
                  className="w-full min-h-[600px] p-6 bg-dark-800/60 rounded-2xl border-2 border-dark-700/50 text-dark-200 font-mono text-sm leading-relaxed resize-none focus:border-green-500/50 focus:bg-dark-800/80 transition-all backdrop-blur-sm shadow-inner"
                  spellCheck={false}
                  style={{ tabSize: 4 }}
                />
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-600/0 opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
              </div>
            ) : (
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 w-14 bg-dark-900/60 text-dark-600 text-right pr-3 pt-6 pb-12 select-none backdrop-blur-sm border-r border-dark-800/50">
                  {pythonCode.split('\n').map((_, i) => (
                    <div key={i} className="font-mono text-xs leading-relaxed">
                      {i + 1}
                    </div>
                  ))}
                </div>
                
                {/* Code content with subtle background */}
                <div className="pl-16 pr-6 pt-6 pb-12 bg-gradient-to-br from-dark-950/50 to-dark-900/30">
                  <pre className="text-dark-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
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
