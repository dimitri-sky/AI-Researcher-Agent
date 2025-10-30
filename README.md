# AI Research Paper Generator

Generate academic papers with matching Python implementations using Gemini, Grok, Claude, or OpenAI APIs. React-based web app with LaTeX rendering, interactive editing, and PDF export.

## Quick Start

```bash
npm install
npm run dev
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS + Framer Motion
- Google Gemini, xAI Grok, Anthropic Claude, and OpenAI GPT APIs
- KaTeX (math rendering)
- jsPDF + html2canvas (PDF generation)

## Project Structure

```
src/
├── components/
│   ├── Header.jsx           # Top navigation
│   ├── InputSection.jsx     # Topic input + AI chat
│   ├── OutputSection.jsx    # LaTeX preview + PDF export
│   ├── CodeSection.jsx      # Python code display
│   └── MobileNavigation.jsx # Mobile tabs
├── services/
│   ├── geminiService.js     # AI API integration
│   ├── aiService.js         # Legacy API handler
│   └── pdfService.js        # PDF generation
├── App.jsx                  # Main app logic
└── main.jsx                 # Entry point
```

## Core Features

**Paper Generation**
- Input topic + description → full paper in 30-60s
- Automatic sections: Abstract, Introduction, Methodology, Results, Conclusion
- LaTeX formatting with KaTeX rendering

**AI Chat Agent**
- Interactive editing via natural language
- Maintains conversation context
- Real-time content updates

**Python Code**
- Generates implementation matching paper methodology
- Syntax highlighting
- Export/copy functionality

**Mobile Responsive**
- Single-section view with bottom navigation
- Touch-optimized interactions

## Contributing

### Development Setup

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Make changes in feature branch
5. Test on mobile + desktop
6. Submit PR

### Code Guidelines

- **Components:** Keep under 500 lines, extract sub-components
- **Services:** Pure functions, no side effects in exports
- **State:** Use React hooks, avoid prop drilling beyond 2 levels
- **Styling:** Tailwind utility classes, avoid inline styles
- **Accessibility:** ARIA labels on interactive elements

### Key Files

- `geminiService.js`: AI prompt engineering + API calls
- `App.jsx`: State management + data flow
- `OutputSection.jsx`: LaTeX rendering logic
- `pdfService.js`: PDF layout + formatting

### Adding Features

**New AI capabilities:** Modify prompts in `geminiService.js` → `SYSTEM_PROMPT`

**UI components:** Add to `components/` → Import in `App.jsx` → Pass props

**Export formats:** Extend `pdfService.js` or create new service

### Testing Locally

- Test paper generation with various topics
- Verify LaTeX renders correctly (especially math equations)
- Check PDF export formatting
- Test chat agent modifications
- Validate mobile navigation

## Known Issues

- LaTeX tables may render incorrectly in complex cases
- PDF pagination breaks on very long papers
- Some advanced math equations need manual LaTeX adjustment
- Mobile keyboard overlaps input on certain devices

## Security Notes

- **Production:** Proxy API key through backend, don't expose in frontend
- Sanitize user input before LaTeX rendering
- Implement rate limiting for API calls
- Deploy with HTTPS + CSP headers

## License

MIT - See [LICENSE](LICENSE) file for details. Free for personal and commercial use.
