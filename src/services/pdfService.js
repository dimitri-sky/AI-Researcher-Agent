import jsPDF from 'jspdf';

// Advanced PDF generation from LaTeX content
export async function generatePDF(element, filename = 'research-paper', latexContent = null) {
  console.log('generatePDF called with:', { filename, hasElement: !!element, hasLatex: !!latexContent });
  
  let loadingDiv = null;

  try {
    // Show loading indicator
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading-indicator';
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  z-index: 9999; background: white; padding: 24px 32px; border-radius: 12px; 
                  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 28px; height: 28px; border: 3px solid #e0e0e0; 
                      border-top: 3px solid #2563eb; border-radius: 50%; 
                      animation: spin 1s linear infinite;"></div>
          <div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                        font-size: 16px; font-weight: 600; color: #1f2937;">Generating PDF</div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                        font-size: 13px; color: #6b7280; margin-top: 4px;">Creating professional document...</div>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loadingDiv);

    // Create high-quality PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });

    // A4 dimensions in points
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = {
      top: 72,    // 1 inch
      bottom: 72,
      left: 72,
      right: 72
    };
    const contentWidth = pageWidth - margin.left - margin.right;
    const lineHeight = 14;
    const paragraphSpacing = 8;

    // Set document properties
    const now = new Date();
    pdf.setProperties({
      title: filename,
      subject: 'AI-Generated Research Paper',
      author: 'AI Research Paper Generator',
      keywords: 'research, paper, ai, neurips',
      creator: 'AI Research Paper Generator'
    });

    // Initialize formatting
    pdf.setFont('times', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setLineHeightFactor(1.5);
    
    let currentY = margin.top;
    let currentPage = 1;
    let sectionCounter = 0;
    let subsectionCounter = 0;

    // Helper function to convert LaTeX math to readable text
    const convertLatexMath = (latex) => {
      // Remove $$ or $ delimiters
      let text = latex.replace(/^\$\$?|\$\$?$/g, '').trim();
      
      // Common LaTeX math replacements to Unicode
      const replacements = {
        // Greek letters
        '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
        '\\epsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
        '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\mu': 'μ',
        '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
        '\\sigma': 'σ', '\\tau': 'τ', '\\phi': 'φ', '\\chi': 'χ',
        '\\psi': 'ψ', '\\omega': 'ω',
        '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
        '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
        '\\Psi': 'Ψ', '\\Omega': 'Ω',
        
        // Mathematical operators
        '\\times': '×', '\\div': '÷', '\\pm': '±', '\\mp': '∓',
        '\\cdot': '·', '\\circ': '∘', '\\bullet': '•', '\\star': '★',
        '\\dagger': '†', '\\ddagger': '‡', '\\amalg': '⨿',
        
        // Relations
        '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\approx': '≈',
        '\\equiv': '≡', '\\sim': '∼', '\\simeq': '≃', '\\propto': '∝',
        '\\perp': '⊥', '\\parallel': '∥', '\\subset': '⊂', '\\supset': '⊃',
        '\\subseteq': '⊆', '\\supseteq': '⊇', '\\in': '∈', '\\notin': '∉',
        '\\ni': '∋', '\\notni': '∌',
        
        // Arrows
        '\\rightarrow': '→', '\\leftarrow': '←', '\\leftrightarrow': '↔',
        '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\Leftrightarrow': '⇔',
        '\\uparrow': '↑', '\\downarrow': '↓', '\\updownarrow': '↕',
        '\\mapsto': '↦', '\\to': '→',
        
        // Logic
        '\\forall': '∀', '\\exists': '∃', '\\nexists': '∄',
        '\\neg': '¬', '\\land': '∧', '\\lor': '∨', '\\wedge': '∧', '\\vee': '∨',
        '\\therefore': '∴', '\\because': '∵',
        
        // Sets
        '\\emptyset': '∅', '\\varnothing': '∅', '\\cup': '∪', '\\cap': '∩',
        '\\setminus': '∖', '\\bigcup': '⋃', '\\bigcap': '⋂',
        
        // Calculus
        '\\partial': '∂', '\\nabla': '∇', '\\infty': '∞',
        '\\int': '∫', '\\iint': '∬', '\\iiint': '∭', '\\oint': '∮',
        '\\sum': 'Σ', '\\prod': 'Π', '\\coprod': '∐',
        
        // Other symbols
        '\\ldots': '...', '\\cdots': '⋯', '\\vdots': '⋮', '\\ddots': '⋱',
        '\\Re': 'ℜ', '\\Im': 'ℑ', '\\wp': '℘', '\\ell': 'ℓ',
        '\\hbar': 'ℏ', '\\hslash': 'ℏ',
        
        // Common sets
        '\\mathbb{R}': 'ℝ', '\\mathbb{C}': 'ℂ', '\\mathbb{N}': 'ℕ',
        '\\mathbb{Z}': 'ℤ', '\\mathbb{Q}': 'ℚ', '\\mathbb{P}': 'ℙ',
        '\\mathbb{E}': '𝔼', '\\R': 'ℝ', '\\E': '𝔼', '\\N': 'ℕ', '\\Z': 'ℤ',
        
        // Functions
        '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan', '\\cot': 'cot',
        '\\sec': 'sec', '\\csc': 'csc', '\\arcsin': 'arcsin', '\\arccos': 'arccos',
        '\\arctan': 'arctan', '\\log': 'log', '\\ln': 'ln', '\\exp': 'exp',
        '\\min': 'min', '\\max': 'max', '\\sup': 'sup', '\\inf': 'inf',
        '\\lim': 'lim', '\\liminf': 'liminf', '\\limsup': 'limsup',
        '\\det': 'det', '\\dim': 'dim', '\\ker': 'ker', '\\rank': 'rank',
        '\\argmin': 'argmin', '\\argmax': 'argmax',
        
        // Spacing
        '\\quad': '  ', '\\qquad': '    ', '~': ' ',
        
        // Text mode
        '\\text': '', '\\textbf': '', '\\textit': '', '\\textrm': '',
        '\\mathrm': '', '\\mathbf': '', '\\mathit': '', '\\mathcal': '',
        '\\mathsf': '', '\\mathtt': '', '\\mathfrak': ''
      };
      
      // Apply replacements
      for (const [latex, unicode] of Object.entries(replacements)) {
        const regex = new RegExp(latex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        text = text.replace(regex, unicode);
      }
      
      // Handle parentheses and brackets
      text = text.replace(/\\left\(/g, '(');
      text = text.replace(/\\right\)/g, ')');
      text = text.replace(/\\left\[/g, '[');
      text = text.replace(/\\right\]/g, ']');
      text = text.replace(/\\left\\{/g, '{');
      text = text.replace(/\\right\\}/g, '}');
      text = text.replace(/\\left\|/g, '||');
      text = text.replace(/\\right\|/g, '||');
      
      // Handle fractions \frac{num}{den} -> num/den
      text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
      
      // Handle square roots \sqrt{x} -> √(x)
      text = text.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
      text = text.replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√($2)');
      
      // Handle superscripts ^{x} -> ˣ (limited support)
      text = text.replace(/\^\{([^}]+)\}/g, '^($1)');
      text = text.replace(/\^(\w)/g, '^$1');
      
      // Handle subscripts _{x} -> ₓ (limited support)  
      text = text.replace(/_\{([^}]+)\}/g, '_($1)');
      text = text.replace(/_(\w)/g, '_$1');
      
      // Handle common matrix notation
      text = text.replace(/\\begin\{[bp]?matrix\}/g, '[');
      text = text.replace(/\\end\{[bp]?matrix\}/g, ']');
      
      // Clean up remaining braces and backslashes
      text = text.replace(/[{}]/g, '');
      text = text.replace(/\\/g, '');
      
      // Clean up extra spaces
      text = text.replace(/\s+/g, ' ').trim();
      
      return text;
    };

    // Helper function to add text with word wrap and page breaks
    const addText = (text, options = {}) => {
      const {
        fontSize = 11,
        fontStyle = 'normal',
        align = 'justify',
        indent = 0,
        spacing = lineHeight,
        isMath = false
      } = options;

      pdf.setFontSize(fontSize);
      pdf.setFont('times', fontStyle);

      // Convert LaTeX math if needed
      if (isMath) {
        text = convertLatexMath(text);
      }

      // Handle page break if needed
      if (currentY + spacing > pageHeight - margin.bottom) {
        pdf.addPage();
        currentPage++;
        currentY = margin.top;
      }

      // Split text to fit width
      const lines = pdf.splitTextToSize(text, contentWidth - indent);
      
      lines.forEach((line, index) => {
        // Check for page break
        if (currentY + spacing > pageHeight - margin.bottom) {
      pdf.addPage();
          currentPage++;
          currentY = margin.top;
        }

        // Add text based on alignment
        let x = margin.left + indent;
        if (align === 'center') {
          x = pageWidth / 2;
        } else if (align === 'right') {
          x = pageWidth - margin.right;
        }

        pdf.text(line, x, currentY, { align });
        currentY += spacing;
      });

      // Add paragraph spacing
      if (options.paragraphBreak) {
        currentY += paragraphSpacing;
      }
    };

    // Process LaTeX content
    const processContent = (latex) => {
      if (!latex) return;

      // Remove comments
      latex = latex.replace(/%.*$/gm, '');
      
      // Split content into lines
      const lines = latex.split('\n');
      let inAbstract = false;
      let currentParagraph = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Handle title (Large text in center)
        if (line.includes('\\Large') || (line.includes('\\textbf') && i < 10)) {
          const titleMatch = line.match(/\\textbf\{\\Large\s+([^}]+)\}/) || 
                             line.match(/\\Large\s+\\textbf\{([^}]+)\}/) ||
                             line.match(/\\textbf\{([^}]+)\}/);
          if (titleMatch) {
            addText(titleMatch[1], {
              fontSize: 18,
              fontStyle: 'bold',
              align: 'center',
              spacing: 24
            });
            currentY += 12;
            continue;
          }
        }

        // Handle authors and affiliations
        if (i < 30 && line.includes('$^{') && line.includes('}$')) {
          const cleanLine = line
            .replace(/\$\^\{([^}]+)\}\$/g, ' ($1)')
            .replace(/\\textbf\{([^}]+)\}/g, '$1');
          addText(cleanLine, {
            fontSize: 12,
            align: 'center',
            spacing: 16
          });
          continue;
        }

        // Handle section headers
        if (line.startsWith('\\section{')) {
          // Flush current paragraph
          if (currentParagraph.length > 0) {
            addText(currentParagraph.join(' '), { paragraphBreak: true });
            currentParagraph = [];
          }

          const title = line.match(/\\section\{([^}]+)\}/)?.[1] || '';
          sectionCounter++;
          subsectionCounter = 0;
          currentY += 8;
          addText(`${sectionCounter}. ${title.toUpperCase()}`, {
            fontSize: 12,
            fontStyle: 'bold',
            spacing: 18
          });
          currentY += 4;
          continue;
        }

        // Handle section* (Abstract, Acknowledgments, etc.)
        if (line.startsWith('\\section*{')) {
          // Flush current paragraph
          if (currentParagraph.length > 0) {
            addText(currentParagraph.join(' '), { paragraphBreak: true });
            currentParagraph = [];
          }

          const title = line.match(/\\section\*\{([^}]+)\}/)?.[1] || '';
          if (title.toLowerCase().includes('abstract')) {
            inAbstract = true;
            currentY += 8;
            addText('ABSTRACT', {
              fontSize: 11,
              fontStyle: 'bold',
              align: 'center',
              spacing: 18
            });
            currentY += 4;
          } else {
            inAbstract = false;
            currentY += 8;
            addText(title.toUpperCase(), {
              fontSize: 11,
              fontStyle: 'bold',
              spacing: 18
            });
            currentY += 4;
          }
          continue;
        }

        // Handle subsection headers
        if (line.startsWith('\\subsection{')) {
          // Flush current paragraph
          if (currentParagraph.length > 0) {
            addText(currentParagraph.join(' '), { paragraphBreak: true });
            currentParagraph = [];
          }

          const title = line.match(/\\subsection\{([^}]+)\}/)?.[1] || '';
          subsectionCounter++;
          currentY += 6;
          addText(`${sectionCounter}.${subsectionCounter} ${title}`, {
            fontSize: 11,
            fontStyle: 'bold',
            spacing: 16
          });
          currentY += 2;
          continue;
        }

        // Handle keywords
        if (line.includes('Keywords:') || line.includes('\\textbf{Keywords:}')) {
          // Flush current paragraph
          if (currentParagraph.length > 0) {
            addText(currentParagraph.join(' '), { paragraphBreak: true });
            currentParagraph = [];
          }

          const keywords = line.replace(/\\textbf\{Keywords:\}/g, '').replace(/Keywords:/g, '').trim();
          addText('Keywords: ' + keywords, {
            fontSize: 10,
            fontStyle: 'italic',
            spacing: 14
          });
          currentY += 8;
          inAbstract = false;
          continue;
        }

        // Handle display math equations (standalone equations)
        if (line.includes('$$') && line.trim().startsWith('$$') && line.trim().endsWith('$$')) {
          // Flush current paragraph first
          if (currentParagraph.length > 0) {
            const paragraphText = currentParagraph.join(' ');
            addText(paragraphText, { paragraphBreak: true });
            currentParagraph = [];
          }
          
          // Display the equation - convert LaTeX to Unicode
          const equation = line.trim();
          currentY += 4;
          addText(equation, { 
            fontSize: 10,
            align: 'center',
            spacing: 16,
            isMath: true  // This will trigger LaTeX to Unicode conversion
          });
          currentY += 4;
          continue;
        }
        
        // Handle regular text
        if (line.length > 0 && !line.startsWith('\\')) {
          // Clean up LaTeX commands but preserve math
          let cleanLine = line;
          
          // First, preserve display math equations
          const displayMathRegex = /\$\$(.*?)\$\$/g;
          const displayMaths = [];
          cleanLine = cleanLine.replace(displayMathRegex, (match, math) => {
            displayMaths.push(math);
            return `[EQUATION ${displayMaths.length}]`;
          });
          
          // Preserve inline math
          const inlineMathRegex = /\$([^\$]+)\$/g;
          const inlineMaths = [];
          cleanLine = cleanLine.replace(inlineMathRegex, (match, math) => {
            inlineMaths.push(math);
            return `[MATH ${inlineMaths.length}]`;
          });
          
          // Now clean other LaTeX commands
          cleanLine = cleanLine
            .replace(/\\textbf\{([^}]+)\}/g, '$1')
            .replace(/\\textit\{([^}]+)\}/g, '$1')
            .replace(/\\emph\{([^}]+)\}/g, '$1')
            .replace(/\\cite\{([^}]+)\}/g, '[$1]')
            .replace(/\\\[(\d+)\]/g, '[$1]')
            .replace(/\\quad/g, '    ')
            .replace(/\\qquad/g, '        ')
            .replace(/~/g, ' ')
            .replace(/\\\\/g, '')
            .replace(/\\vspace\{[^}]+\}/g, '')
            .replace(/\\begin\{center\}/g, '')
            .replace(/\\end\{center\}/g, '');
          
          // Restore display math with formatting (centered equations)
          displayMaths.forEach((math, i) => {
            // Convert LaTeX math to Unicode for display equations
            const converted = convertLatexMath(math);
            cleanLine = cleanLine.replace(`[EQUATION ${i + 1}]`, `\n\n    ${converted}\n\n`);
          });
          
          // Restore inline math with Unicode conversion
          inlineMaths.forEach((math, i) => {
            // Convert LaTeX math to Unicode for inline math
            const converted = convertLatexMath(math);
            cleanLine = cleanLine.replace(`[MATH ${i + 1}]`, converted);
          });

          if (cleanLine.trim()) {
            currentParagraph.push(cleanLine);
          }
        } else if (line === '' && currentParagraph.length > 0) {
          // Empty line - flush paragraph
          let paragraphText = currentParagraph.join(' ');
          
          // Handle display equations specially
          if (paragraphText.includes('\n\n    ')) {
            // Split by equations
            const parts = paragraphText.split(/\n\n/);
            parts.forEach(part => {
              if (part.trim().startsWith('    ')) {
                // This is an equation - center it (already converted to Unicode)
                const equation = part.trim();
                currentY += 4;
                addText(equation, { 
                  fontSize: 10,
                  align: 'center',
                  spacing: 16
                });
                currentY += 4;
              } else if (part.trim()) {
                // Regular text (inline math already converted)
                if (inAbstract) {
                  addText(part.trim(), { 
                    fontSize: 10,
                    indent: 20,
                    paragraphBreak: false
                  });
                } else {
                  addText(part.trim(), { paragraphBreak: false });
                }
              }
            });
            currentY += paragraphSpacing;
          } else {
            // Regular paragraph
            if (inAbstract) {
              addText(paragraphText, { 
                fontSize: 10,
                indent: 20,
                paragraphBreak: true 
              });
            } else {
              addText(paragraphText, { paragraphBreak: true });
            }
          }
          currentParagraph = [];
        }
      }

      // Flush any remaining paragraph
      if (currentParagraph.length > 0) {
        const paragraphText = currentParagraph.join(' ');
        if (inAbstract) {
          addText(paragraphText, { 
            fontSize: 10,
            indent: 20,
            paragraphBreak: true 
          });
        } else {
          addText(paragraphText, { paragraphBreak: true });
        }
      }
      
      // Add a footer note about mathematical notation
      currentY = Math.min(currentY + 20, pageHeight - margin.bottom - 50);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin.left, currentY, pageWidth - margin.right, currentY);
      currentY += 10;
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('times', 'italic');
      const noteText = 'Note: Mathematical symbols have been converted to Unicode approximations.';
      pdf.text(noteText, margin.left, currentY);
      currentY += 12;
      const noteText2 = 'For perfectly rendered equations, export as LaTeX (.tex) and compile in Overleaf.';
      pdf.text(noteText2, margin.left, currentY);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('times', 'normal');
    };

    // Process the content
    if (latexContent) {
      processContent(latexContent);
    } else if (element) {
      // Fallback: extract text from element
      const text = element.innerText || element.textContent || '';
      processContent(text);
    } else {
      throw new Error('No content available for PDF generation');
    }

    // Format filename
    const formattedFilename = filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'research-paper';

    // Add timestamp
    const timestamp = now.toISOString().slice(0, 10);
    const finalFilename = `${formattedFilename}-${timestamp}.pdf`;

    // Save the PDF
    console.log('Saving PDF as:', finalFilename);
    pdf.save(finalFilename);
    console.log('PDF generated successfully');

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  } finally {
    // Remove loading indicator
    if (loadingDiv && loadingDiv.parentNode) {
      try {
        document.body.removeChild(loadingDiv);
      } catch (e) {
        console.error('Error removing loading indicator:', e);
      }
    }
    // Fallback removal
    const existingLoader = document.getElementById('pdf-loading-indicator');
    if (existingLoader && existingLoader.parentNode) {
      try {
        document.body.removeChild(existingLoader);
      } catch (e) {
        console.error('Error removing existing loader:', e);
      }
    }
  }
}

export async function exportLatex(content, filename = 'paper.tex') {
  try {
    // Create a complete LaTeX document with NeurIPS style
    const fullDocument = `% NeurIPS-style Research Paper
% Generated by AI Research Paper Generator
% Compile with pdflatex

\\documentclass[11pt]{article}

% Essential packages for NeurIPS papers
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{amsfonts}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{url}
\\usepackage{booktabs}
\\usepackage{natbib}

% Page layout - standard 1-inch margins
\\usepackage[margin=1in,top=1in,bottom=1in]{geometry}

% Line spacing
\\usepackage{setspace}
\\onehalfspacing

% Useful math commands
\\newcommand{\\R}{\\mathbb{R}}
\\newcommand{\\E}{\\mathbb{E}}
\\newcommand{\\N}{\\mathbb{N}}
\\newcommand{\\Z}{\\mathbb{Z}}
\\DeclareMathOperator*{\\argmin}{arg\\,min}
\\DeclareMathOperator*{\\argmax}{arg\\,max}

% Hyperref setup
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,
    urlcolor=cyan,
    citecolor=blue
}

\\begin{document}

% Paper content starts here
${content}

\\end{document}`;

    // Format filename with timestamp
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 10);
    const baseFilename = filename.replace('.tex', '');
    const finalFilename = `${baseFilename}-${timestamp}.tex`;

    // Create blob and download
    const blob = new Blob([fullDocument], { type: 'text/x-latex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting LaTeX:', error);
    throw new Error('Failed to export LaTeX file.');
  }
}

// Helper function to format LaTeX for copy-paste to Overleaf
export function formatLatexForCopy(content) {
  // Ensure the LaTeX is properly formatted for direct copy-paste
  let formatted = content;
  
  // Remove any extra whitespace
  formatted = formatted.trim();
  
  // Ensure proper line breaks
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // Add document wrapper if not present (for Overleaf compatibility)
  if (!formatted.includes('\\documentclass')) {
    formatted = `% NeurIPS-style Research Paper
% Copy this entire code into Overleaf and compile with pdflatex
% This document is ready to compile as-is

\\documentclass[11pt]{article}

% Essential packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{amssymb}
\\usepackage{amsfonts}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{url}
\\usepackage{booktabs}
\\usepackage{natbib}

% Page layout
\\usepackage[margin=1in,top=1in,bottom=1in]{geometry}

% Line spacing
\\usepackage{setspace}
\\onehalfspacing

% Custom math commands
\\newcommand{\\R}{\\mathbb{R}}
\\newcommand{\\E}{\\mathbb{E}}
\\newcommand{\\N}{\\mathbb{N}}
\\newcommand{\\Z}{\\mathbb{Z}}
\\DeclareMathOperator*{\\argmin}{arg\\,min}
\\DeclareMathOperator*{\\argmax}{arg\\,max}

% Hyperref configuration
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,
    urlcolor=cyan,
    citecolor=blue,
    pdfauthor={AI Research Paper Generator},
    pdfsubject={Research Paper}
}

\\begin{document}

${formatted}

\\end{document}`;
  }
  
  return formatted;
}