import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Code, Copy, Check } from 'lucide-react';
import katex from 'katex';
import { generatePDF } from '../services/pdfService';

const OutputSection = ({ paperData, currentView, onViewChange, onUpdateLatex, isMobile }) => {
  const previewRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [editedLatex, setEditedLatex] = useState('');
  
  const processLatexCommands = useCallback((latex) => {
    // Remove comments
    latex = latex.replace(/%.*$/gm, '');
    
    // Handle center environment
    latex = latex.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, '<div class="text-center my-4">$1</div>');
    
    // Handle vspace (convert to margin)
    latex = latex.replace(/\\vspace\{([^}]+)\}/g, (match, p1) => {
      const size = parseFloat(p1) * 16; // Convert cm to approximate px
      return `<div style="height: ${size}px"></div>`;
    });
    
    // Handle text size commands
    latex = latex.replace(/\\Large\s+/g, '<span class="text-2xl font-bold">');
    latex = latex.replace(/\\large\s+/g, '<span class="text-xl">');
    latex = latex.replace(/\\small\s+/g, '<span class="text-sm">');
    latex = latex.replace(/\\normalsize\s+/g, '<span class="text-base">');
    
    // Convert sections
    latex = latex.replace(/\\section\*?\{([^}]+)\}/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-900">$1</h2>');
    latex = latex.replace(/\\subsection\*?\{([^}]+)\}/g, '<h3 class="text-xl font-semibold mt-6 mb-3 text-gray-800">$1</h3>');
    latex = latex.replace(/\\subsubsection\*?\{([^}]+)\}/g, '<h4 class="text-lg font-medium mt-4 mb-2 text-gray-700">$1</h4>');
    
    // Text formatting
    latex = latex.replace(/\\textbf\{([^}]+)\}/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    latex = latex.replace(/\\textit\{([^}]+)\}/g, '<em class="italic text-gray-700">$1</em>');
    latex = latex.replace(/\\emph\{([^}]+)\}/g, '<em class="italic text-gray-700">$1</em>');
    
    // Convert display math
    latex = latex.replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
      return `<div class="math-display my-6 overflow-x-auto text-gray-900">${p1}</div>`;
    });
    
    // Convert inline math
    latex = latex.replace(/\$([^\$]+)\$/g, '<span class="math-inline text-gray-900">$1</span>');
    
    // Paragraphs
    latex = latex.split('\n\n').map(para => {
      para = para.trim();
      if (para && !para.startsWith('<h') && !para.includes('math-display') && !para.startsWith('<div')) {
        return `<p class="mb-4 text-gray-700 leading-relaxed">${para}</p>`;
      }
      return para;
    }).join('\n');
    
    return latex;
  }, []);
  
  const renderLatex = useCallback(() => {
    if (!previewRef.current || !paperData.latexContent) return;
    
    let processed = processLatexCommands(paperData.latexContent);
    previewRef.current.innerHTML = processed;
    
    // Render math with KaTeX
    const mathElements = previewRef.current.querySelectorAll('.math-inline, .math-display');
    mathElements.forEach(elem => {
      try {
        katex.render(elem.textContent, elem, {
          displayMode: elem.classList.contains('math-display'),
          throwOnError: false
        });
      } catch (e) {
        console.error('KaTeX error:', e);
      }
    });
  }, [paperData.latexContent, processLatexCommands]);
  
  // Render preview whenever paper content changes or when switching to preview
  useEffect(() => {
    if (paperData.latexContent && previewRef.current) {
      renderLatex();
    }
  }, [paperData.latexContent, renderLatex]);
  
  useEffect(() => {
    setEditedLatex(paperData.latexContent);
  }, [paperData.latexContent]);
  
  const handleDownloadPDF = async () => {
    if (!paperData.latexContent) return;
    
    const title = paperData.title || 'research-paper';
    await generatePDF(previewRef.current, title);
  };
  
  const handleCopyLatex = () => {
    navigator.clipboard.writeText(editedLatex || paperData.latexContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col min-h-0 h-full border-r border-dark-800/50 bg-dark-900/30 backdrop-blur-xl"
    >
      {/* Section header */}
      <div className="px-6 py-4 border-b border-dark-800/50 backdrop-blur-sm bg-dark-900/30 min-h-[76px] flex items-center">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/20">
              <FileText className="w-4 h-4 text-primary-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Research Paper</h2>
            </div>
          </div>
          
          {/* Right side: Action button + View toggle */}
          <div className="flex items-center gap-2">
            {/* Download PDF or Copy button - only show when paper exists */}
            {paperData.latexContent && (
              <>
                {currentView === 'preview' ? (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLatex}
                    className="px-3.5 py-2 rounded-xl bg-dark-800/80 hover:bg-dark-700 border border-dark-700/50 text-white text-xs font-semibold transition-all flex items-center gap-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </motion.button>
                )}
              </>
            )}
            
            {/* View toggle */}
            <div className="flex items-center gap-1 bg-dark-800/60 rounded-xl p-1 border border-dark-700/50">
              <button
                onClick={() => onViewChange('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'preview'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => onViewChange('latex')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'latex'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                LaTeX
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!paperData.latexContent ? (
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
                <FileText className="w-10 h-10 text-dark-500" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-primary-500/20 blur-xl"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <h3 className="text-lg font-semibold text-white">No paper yet</h3>
              <p className="text-dark-400 text-sm max-w-xs">
                Your research paper will appear here after generation
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500/50" />
                <p className="text-dark-600 text-xs">
                  Enter a topic and description to begin
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* Preview - always mounted, toggle visibility */}
            <div className={`${currentView === 'preview' ? 'block' : 'hidden'} p-8 pb-12`}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl mx-auto font-serif border border-gray-200"
                style={{
                  boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div ref={previewRef} />
              </motion.div>
            </div>
            
            {/* LaTeX - always editable */}
            <div className={`${currentView === 'latex' ? 'block' : 'hidden'} p-6 pb-12`}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                <textarea
                  value={editedLatex}
                  onChange={(e) => {
                    setEditedLatex(e.target.value);
                    onUpdateLatex(e.target.value);
                  }}
                  className="w-full min-h-[600px] p-6 bg-dark-800/60 rounded-2xl border-2 border-dark-700/50 text-dark-200 font-mono text-sm leading-relaxed focus:border-primary-500/50 focus:bg-dark-800/80 transition-all resize-none backdrop-blur-sm shadow-inner"
                  spellCheck={false}
                  style={{ tabSize: 2 }}
                />
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
              </motion.div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default OutputSection;
