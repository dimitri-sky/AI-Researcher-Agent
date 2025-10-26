import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Code, Copy, Check, FileDown } from 'lucide-react';
import katex from 'katex';
import { generatePDF, exportLatex, formatLatexForCopy } from '../services/pdfService';

const OutputSection = ({ paperData, currentView, onViewChange, onUpdateLatex, isMobile }) => {
  const previewRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [editedLatex, setEditedLatex] = useState('');
  
  const processLatexCommands = useCallback((latex) => {
    // Remove comments
    latex = latex.replace(/%.*$/gm, '');
    
    // Track section numbering for NeurIPS style
    let sectionNum = 0;
    let subsectionNum = 0;
    let isAfterAbstract = false;
    
    // Handle center environment - special handling for title/author block
    latex = latex.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, (match, content) => {
      // Check if this is title/author block (contains Large or author affiliations)
      if (content.includes('\\Large') || content.includes('\\textbf') || content.includes('$^{')) {
        // Format as title/author block
        return `<div class="text-center mb-8 pb-4 border-gray-300">${content}</div>`;
      }
      return `<div class="text-center my-4">${content}</div>`;
    });
    
    // Handle vspace (convert to margin)
    latex = latex.replace(/\\vspace\{([^}]+)\}/g, '<div class="my-2"></div>');
    
    // Handle text size commands - NeurIPS style
    latex = latex.replace(/\\Large\s+/g, '<span class="text-2xl font-bold">');
    latex = latex.replace(/\\large\s+/g, '<span class="text-lg">');
    latex = latex.replace(/\\small\s+/g, '<span class="text-xs">');
    latex = latex.replace(/\\normalsize\s+/g, '<span class="text-sm">');
    latex = latex.replace(/\\tiny\s+/g, '<span class="text-xs">');
    latex = latex.replace(/\\huge\s+/g, '<span class="text-3xl font-bold">');
    
    // Convert sections with NeurIPS-style formatting and numbering
    latex = latex.replace(/\\section\{([^}]+)\}/g, (match, title) => {
      sectionNum++;
      subsectionNum = 0;
      isAfterAbstract = true;
      // NeurIPS uses bold, smaller text for section headers
      return `<h2 class="text-base font-bold mt-6 mb-3 text-black">${sectionNum} &nbsp; ${title}</h2>`;
    });
    
    // Handle starred sections (like Abstract, Acknowledgments)
    latex = latex.replace(/\\section\*\{([^}]+)\}/g, (match, title) => {
      const titleLower = title.toLowerCase();
      if (titleLower.includes('abstract')) {
        return `<div class="mb-6 pb-3 border-b"><h2 class="text-sm font-bold text-center mb-2 text-black">Abstract</h2><div class="text-xs text-justify text-black leading-tight">`;
      }
      return `<h2 class="text-base font-bold mt-6 mb-3 text-black">${title}</h2>`;
    });
    
    // Close abstract div when we hit Keywords or next section
    latex = latex.replace(/(<div class="text-xs text-justify text-black leading-tight">[\s\S]*?)(\n\\textbf\{Keywords|\\section)/g, 
      '$1</div></div>$2');
    
    latex = latex.replace(/\\subsection\{([^}]+)\}/g, (match, title) => {
      subsectionNum++;
      return `<h3 class="text-sm font-bold mt-4 mb-2 text-black">${sectionNum}.${subsectionNum} &nbsp; ${title}</h3>`;
    });
    latex = latex.replace(/\\subsection\*\{([^}]+)\}/g, '<h3 class="text-sm font-bold mt-4 mb-2 text-black">$1</h3>');
    latex = latex.replace(/\\subsubsection\{([^}]+)\}/g, '<h4 class="text-sm font-semibold mt-3 mb-2 text-black italic">$1</h4>');
    latex = latex.replace(/\\subsubsection\*\{([^}]+)\}/g, '<h4 class="text-sm font-semibold mt-3 mb-2 text-black italic">$1</h4>');
    latex = latex.replace(/\\paragraph\{([^}]+)\}/g, '<span class="font-bold text-black">$1.</span>');
    
    // Text formatting - NeurIPS style
    latex = latex.replace(/\\textbf\{([^}]+)\}/g, '<strong class="font-bold text-black">$1</strong>');
    latex = latex.replace(/\\textit\{([^}]+)\}/g, '<em class="italic text-black">$1</em>');
    latex = latex.replace(/\\emph\{([^}]+)\}/g, '<em class="italic text-black">$1</em>');
    latex = latex.replace(/\\underline\{([^}]+)\}/g, '<u class="underline text-black">$1</u>');
    latex = latex.replace(/\\texttt\{([^}]+)\}/g, '<code class="font-mono text-xs bg-gray-50 px-0.5 text-black">$1</code>');
    latex = latex.replace(/\\textsc\{([^}]+)\}/g, '<span class="text-xs uppercase tracking-wide text-black">$1</span>');
    
    // Handle itemize and enumerate environments - NeurIPS compact style
    latex = latex.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, p1) => {
      const items = p1.replace(/\\item\s*/g, '<li class="mb-1 ml-5 text-sm text-black">').trim();
      return `<ul class="my-2 text-black list-disc">${items}</ul>`;
    });
    
    latex = latex.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, p1) => {
      const items = p1.replace(/\\item\s*/g, '<li class="mb-1 ml-5 text-sm text-black">').trim();
      return `<ol class="my-2 text-black list-decimal">${items}</ol>`;
    });
    
    // Handle tables - NeurIPS style (smaller, compact)
    latex = latex.replace(/\\begin\{tabular\}\{[^}]+\}([\s\S]*?)\\end\{tabular\}/g, (match, p1) => {
      let tableContent = p1.trim();
      tableContent = tableContent.replace(/\\hline/g, '');
      const rows = tableContent.split('\\\\').filter(row => row.trim());
      const tableRows = rows.map((row, index) => {
        const cells = row.split('&').map(cell => cell.trim());
        const cellTag = index === 0 ? 'th' : 'td';
        const cellClass = index === 0 ? 'font-semibold px-2 py-1 border-t-2 border-b border-black text-xs text-black' : 'px-2 py-1 text-xs text-black';
        const cellsHtml = cells.map(cell => `<${cellTag} class="${cellClass}">${cell}</${cellTag}>`).join('');
        return `<tr>${cellsHtml}</tr>`;
      }).join('');
      return `<div class="my-4 text-center"><table class="inline-block border-collapse text-black">${tableRows}</table></div>`;
    });
    
    // Handle citations - NeurIPS style [1,2,3]
    latex = latex.replace(/\\\[(\d+)\]/g, '<sup class="text-xs text-black">[$1]</sup>');
    latex = latex.replace(/\\cite\{([^}]+)\}/g, '<sup class="text-xs text-black">[$1]</sup>');
    
    // Handle verbatim/code blocks - NeurIPS compact style
    latex = latex.replace(/\\begin\{verbatim\}([\s\S]*?)\\end\{verbatim\}/g, 
      '<pre class="bg-gray-50 p-2 overflow-x-auto font-mono text-xs my-2 text-black border-l-2 border-gray-300"><code class="text-black">$1</code></pre>');
    
    // Convert display math - NeurIPS style (centered, no background)
    latex = latex.replace(/\$\$(.*?)\$\$/gs, (match, p1) => {
      return `<div class="math-display my-3 overflow-x-auto text-center text-black">${p1}</div>`;
    });
    
    // Convert inline math
    latex = latex.replace(/\$([^\$]+)\$/g, '<span class="math-inline text-black">$1</span>');
    
    // Handle quad spacing
    latex = latex.replace(/\\quad/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    latex = latex.replace(/\\qquad/g, '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    
    // Handle Keywords specially
    latex = latex.replace(/\\textbf\{Keywords:\}(.*?)(?=\\section|\\subsection|<h2|<h3|$)/gs, (match, keywords) => {
      return `<div class="mt-3 mb-4"><span class="font-bold text-xs text-black">Keywords:</span><span class="text-xs text-black italic">${keywords.trim()}</span></div>`;
    });
    
    // Paragraphs - NeurIPS style (smaller text, tight spacing, justified)
    latex = latex.split('\n\n').map(para => {
      para = para.trim();
      if (para && !para.startsWith('<') && !para.includes('math-display')) {
        return `<p class="mb-3 text-black text-sm leading-tight text-justify">${para}</p>`;
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
    if (!paperData.latexContent) {
      console.error('No paper content available');
      alert('No paper content available to export as PDF');
      return;
    }
    
    try {
      // Get the complete LaTeX document with proper formatting
      const latexContent = formatLatexForCopy(editedLatex || paperData.latexContent);
      
      // Create a form to POST to Overleaf
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://www.overleaf.com/docs';
      form.target = '_blank';
      
      // Add the encoded LaTeX content
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'encoded_snip';
      input.value = encodeURIComponent(latexContent);
      form.appendChild(input);
      
      // Set the TeX engine to pdflatex
      const engineInput = document.createElement('input');
      engineInput.type = 'hidden';
      engineInput.name = 'engine';
      engineInput.value = 'pdflatex';
      form.appendChild(engineInput);
      
      // Append form to body, submit, and remove
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
      console.log('Opened paper in Overleaf');
    } catch (error) {
      console.error('Error opening in Overleaf:', error);
      alert('Failed to open in Overleaf: ' + error.message);
    }
  };
  
  const handleCopyLatex = () => {
    const latexToCopy = formatLatexForCopy(editedLatex || paperData.latexContent);
    navigator.clipboard.writeText(latexToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownloadLatex = async () => {
    if (!paperData.latexContent) return;
    const title = paperData.title || 'research-paper';
    await exportLatex(editedLatex || paperData.latexContent, title);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col min-h-0 h-full backdrop-blur-xl"
      style={{
        borderRight: '1px solid rgba(30, 36, 44, 0.8)',
        background: 'rgba(13, 17, 23, 0.3)'
      }}
    >
      {/* Section header */}
      <div className="px-6 py-4 backdrop-blur-sm min-h-[76px] flex items-center"
        style={{
          borderBottom: '1px solid rgba(30, 36, 44, 0.8)',
          background: 'rgba(13, 17, 23, 0.4)'
        }}
      >
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl"
              style={{
                background: 'rgba(47, 129, 247, 0.15)',
                border: '1px solid rgba(47, 129, 247, 0.25)'
              }}
            >
              <FileText className="w-4 h-4" style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Research Paper</h2>
            </div>
          </div>
          
          {/* Right side: Action buttons + View toggle */}
          <div className="flex items-center gap-2">
            {/* Download/Copy buttons - only show when paper exists */}
            {paperData.latexContent && (
              <>
                {currentView === 'preview' ? (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                    style={{
                      background: 'transparent',
                      color: '#E6EDF3'
                    }}
                    title="Download as PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyLatex}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                      style={{
                        background: 'transparent',
                        color: '#E6EDF3'
                      }}
                      title="Copy LaTeX code to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#3FB950' }} /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadLatex}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                      style={{
                        background: 'transparent',
                        color: '#E6EDF3'
                      }}
                      title="Download as .tex file"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      .tex
                    </motion.button>
                  </>
                )}
              </>
            )}
            
            {/* View toggle */}
            <div className="flex items-center gap-1 rounded-xl p-1"
              style={{
                background: 'rgba(22, 27, 34, 0.6)',
                border: '1px solid rgba(30, 36, 44, 0.8)'
              }}
            >
              <button
                onClick={() => onViewChange('preview')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={
                  currentView === 'preview'
                    ? { 
                        background: '#2F81F7', 
                        color: '#E6EDF3',
                        boxShadow: '0 4px 12px -2px rgba(47, 129, 247, 0.4)'
                      }
                    : { 
                        color: '#6E7681',
                        background: 'transparent'
                      }
                }
                onMouseEnter={(e) => currentView !== 'preview' && (e.currentTarget.style.background = 'rgba(30, 36, 44, 0.6)')}
                onMouseLeave={(e) => currentView !== 'preview' && (e.currentTarget.style.background = 'transparent')}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => onViewChange('latex')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={
                  currentView === 'latex'
                    ? { 
                        background: '#2F81F7', 
                        color: '#E6EDF3',
                        boxShadow: '0 4px 12px -2px rgba(47, 129, 247, 0.4)'
                      }
                    : { 
                        color: '#6E7681',
                        background: 'transparent'
                      }
                }
                onMouseEnter={(e) => currentView !== 'latex' && (e.currentTarget.style.background = 'rgba(30, 36, 44, 0.6)')}
                onMouseLeave={(e) => currentView !== 'latex' && (e.currentTarget.style.background = 'transparent')}
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
              <h3 className="text-lg font-semibold" style={{ color: '#E6EDF3' }}>No paper yet</h3>
              <p className="text-sm max-w-xs" style={{ color: '#6E7681' }}>
                Your research paper will appear here after generation
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(47, 129, 247, 0.5)' }} />
                <p className="text-xs" style={{ color: '#484F58' }}>
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
                className="bg-white rounded-lg shadow-xl px-12 py-10 mx-auto text-black"
                style={{
                  maxWidth: '700px', // NeurIPS single column width
                  boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  fontFamily: 'Times New Roman, Times, serif'
                }}
              >
                <div ref={previewRef} className="text-black" style={{ columnWidth: '100%' }} />
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
                  className="w-full min-h-[600px] p-6 rounded-2xl border-2 font-mono text-sm leading-relaxed transition-all resize-none backdrop-blur-sm shadow-inner"
                  style={{
                    background: 'rgba(22, 27, 34, 0.6)',
                    borderColor: '#21262D',
                    color: '#9BA3AF',
                    tabSize: 2
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2F81F7'}
                  onBlur={(e) => e.target.style.borderColor = '#21262D'}
                  spellCheck={false}
                />
                <div className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"
                  style={{
                    background: 'linear-gradient(to right, transparent, rgba(47, 129, 247, 0.1), transparent)'
                  }}
                />
              </motion.div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default OutputSection;
