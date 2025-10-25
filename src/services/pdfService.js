import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF(element, filename = 'research-paper') {
  console.log('generatePDF called with:', { element, filename });
  
  if (!element) {
    console.error('No element provided for PDF generation');
    throw new Error('No element provided for PDF generation');
  }

  let loadingDiv = null;

  try {
    console.log('Creating loading indicator...');
    // Show loading indicator
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading-indicator';
    loadingDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                  z-index: 9999; background: white; padding: 20px; border-radius: 8px; 
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 24px; height: 24px; border: 3px solid #f3f3f3; 
                      border-top: 3px solid #3498db; border-radius: 50%; 
                      animation: spin 1s linear infinite;"></div>
          <span style="font-family: sans-serif; color: #333;">Generating PDF...</span>
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
    console.log('Loading indicator added');

    // Create a canvas from the element with optimized settings
    console.log('Starting html2canvas...');
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: true,
      useCORS: true,
      allowTaint: true,
      onclone: (clonedDoc) => {
        try {
          console.log('Cloning document for PDF...');
          const clonedElement = clonedDoc.body;
          if (clonedElement) {
            const style = clonedDoc.createElement('style');
            style.textContent = `* { color: #000000 !important; }`;
            clonedDoc.head.appendChild(style);
            clonedElement.style.fontFamily = 'serif';
            console.log('Document cloned successfully');
          }
        } catch (e) {
          console.error('Error in onclone:', e);
        }
      }
    });
    console.log('Canvas created, dimensions:', canvas.width, 'x', canvas.height);

    // Calculate dimensions with margins
    console.log('Converting canvas to image...');
    const imgData = canvas.toDataURL('image/png', 1.0);
    console.log('Image data created');
    const margin = 10; // 10mm margins
    const imgWidth = 210 - (2 * margin); // A4 width minus margins
    const pageHeight = 297 - (2 * margin); // A4 height minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF with improved settings
    console.log('Creating PDF document...');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    console.log('PDF instance created');
    
    let position = 0;

    // Add metadata
    const now = new Date();
    pdf.setProperties({
      title: filename,
      subject: 'AI-Generated Research Paper',
      author: 'AI Research Paper Generator',
      keywords: 'research, paper, ai, neurips',
      creator: 'AI Research Paper Generator',
      creationDate: now
    });
    console.log('PDF metadata added');

    // Add first page with margins
    console.log('Adding first page...');
    pdf.addImage(imgData, 'PNG', margin, margin + position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
    console.log('First page added');

    // Add additional pages if needed
    let pageCount = 1;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
      pageCount++;
      console.log('Added page', pageCount);
    }

    // Format filename
    const formattedFilename = filename
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'research-paper';

    // Add timestamp to filename
    const timestamp = now.toISOString().slice(0, 10);
    const finalFilename = `${formattedFilename}-${timestamp}.pdf`;

    // Save the PDF
    console.log('Saving PDF as:', finalFilename);
    pdf.save(finalFilename);
    console.log('PDF saved successfully');

    // Remove loading indicator
    if (loadingDiv && loadingDiv.parentNode) {
      document.body.removeChild(loadingDiv);
    }

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  } finally {
    // Always remove loading indicator
    if (loadingDiv && loadingDiv.parentNode) {
      try {
        document.body.removeChild(loadingDiv);
      } catch (e) {
        console.error('Error removing loading indicator:', e);
      }
    }
    // Fallback: remove by ID
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
    const blob = new Blob([fullDocument], { type: 'text/x-latex; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
