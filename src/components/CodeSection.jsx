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
      <div className="px-6 py-3.5 border-b border-dark-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-500/20">
            <Terminal className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">Code</h2>
        </div>
        
        {pythonCode && (
          <motion.a
            href={`https://colab.research.google.com/`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/20 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            Run in Colab
          </motion.a>
        )}
      </div>
      
      {/* Action buttons */}
      {pythonCode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-2.5 border-b border-dark-800/50 flex gap-2"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-white text-xs font-medium transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-white text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
          </motion.button>
          
          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-white text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveEdit}
                className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-all"
              >
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditedCode(pythonCode);
                  setIsEditing(false);
                }}
                className="px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-white text-xs font-medium transition-all"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full p-8"
          >
            <div className="w-16 h-16 rounded-xl bg-dark-800/50 flex items-center justify-center mb-3">
              <Code2 className="w-8 h-8 text-dark-500" />
            </div>
            <p className="text-dark-400 text-center text-sm">
              Python experiment code will appear here
            </p>
            <p className="text-dark-600 text-xs text-center mt-1.5">
              Generate a paper to see the implementation
            </p>
          </motion.div>
        ) : (
          <div className="bg-dark-950/80 border-t border-dark-800/50 pb-12">
            {isEditing ? (
              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full min-h-[600px] p-6 bg-transparent text-dark-200 font-mono text-sm leading-relaxed resize-none focus:outline-none"
                spellCheck={false}
                style={{ tabSize: 4 }}
              />
            ) : (
              <div className="relative">
                {/* Line numbers */}
                <div className="absolute left-0 top-0 w-12 bg-dark-900/50 text-dark-600 text-right pr-2 pt-6 pb-12 select-none">
                  {pythonCode.split('\n').map((_, i) => (
                    <div key={i} className="font-mono text-xs leading-relaxed">
                      {i + 1}
                    </div>
                  ))}
                </div>
                
                {/* Code content */}
                <pre 
                  className="pl-16 pr-6 pt-6 pb-12 text-dark-200 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                >
                  {pythonCode}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CodeSection;
