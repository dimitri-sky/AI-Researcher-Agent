# PDF Text Color Fix

## Problem
PDF exports showed text in gray and blue colors instead of pure black, making the document less professional and harder to read.

## Root Cause
The preview rendering used CSS classes with colored text:
- `text-gray-900` for headings and bold text
- `text-gray-700` for paragraphs
- `text-gray-800` for subsections
- `text-blue-600` for citations and links

When `html2canvas` captured the preview for PDF generation, it preserved these colors, resulting in gray and blue text in the final PDF.

## Solution
Added CSS overrides in the `onclone` callback of `html2canvas` to force all text to pure black (`#000000`) during PDF generation.

### Implementation
```javascript
onclone: (clonedDoc) => {
  const clonedElement = clonedDoc.body;
  if (clonedElement) {
    // Override all text colors to black for PDF
    const style = clonedDoc.createElement('style');
    style.textContent = `
      * {
        color: #000000 !important;
      }
      h1, h2, h3, h4, h5, h6 {
        color: #000000 !important;
      }
      p, span, div, li, td, th {
        color: #000000 !important;
      }
      strong, em, b, i {
        color: #000000 !important;
      }
      a, sup {
        color: #000000 !important;
        text-decoration: none !important;
      }
      code, pre {
        color: #000000 !important;
      }
    `;
    clonedDoc.head.appendChild(style);
    
    // Ensure serif font
    clonedElement.style.fontFamily = 'serif';
  }
}
```

## What This Fixes
- ✅ All text in PDF is now pure black (#000000)
- ✅ Headings render in black (was gray)
- ✅ Paragraphs render in black (was gray)
- ✅ Citations render in black (was blue)
- ✅ Links render in black (was blue)
- ✅ Code blocks render in black (was gray)
- ✅ All text elements consistently colored

## Impact
- **Professional appearance**: PDF now looks like a proper academic paper
- **Better readability**: Black text on white background is easiest to read
- **Printing quality**: Black text prints clearly without gray tints
- **No visual changes to preview**: The colored preview remains intact for better web viewing

## Testing
To verify the fix:
1. Generate any research paper
2. Click "Download PDF"
3. Open the PDF file
4. Verify all text is pure black
5. Check headings, paragraphs, citations, and code blocks
6. Ensure no gray or blue text appears

## Result
PDFs now export with professional black text throughout, making them suitable for:
- Academic submissions
- Professional presentations
- Print publications
- Formal documentation

The web preview retains its colored styling for better readability on screen, while PDFs get pure black text for print-ready output.
