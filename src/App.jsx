import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import CodeSection from './components/CodeSection';
import Header from './components/Header';
import MobileNavigation from './components/MobileNavigation';
import { generatePaper, generatePythonCode, chatWithAI } from './services/geminiService';
import { Loader2, Sparkles, Maximize2 } from 'lucide-react';

function App() {
  const [paperData, setPaperData] = useState({
    title: '',
    description: '',
    latexContent: '',
    pythonCode: ''
  });
  
  const [chatHistory, setChatHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [activeSection, setActiveSection] = useState('input'); // For mobile navigation
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState('preview'); // 'preview' or 'latex'
  
  // Panel width states with default values
  const [panelWidths, setPanelWidths] = useState(() => {
    const saved = localStorage.getItem('panelWidths');
    const defaults = { left: 380, right: 450 };
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validate saved widths
        const MAX_LEFT_WIDTH = 800;
        const MAX_RIGHT_WIDTH = 700;
        const MIN_LEFT_WIDTH = 280;
        const MIN_RIGHT_WIDTH = 350;
        
        // Ensure saved widths are within acceptable ranges
        const validatedLeft = Math.min(Math.max(parsed.left || defaults.left, MIN_LEFT_WIDTH), MAX_LEFT_WIDTH);
        const validatedRight = Math.min(Math.max(parsed.right || defaults.right, MIN_RIGHT_WIDTH), MAX_RIGHT_WIDTH);
        
        return {
          left: validatedLeft,
          right: validatedRight
        };
      } catch (e) {
        console.error('Error parsing saved panel widths:', e);
        return defaults;
      }
    }
    return defaults;
  });
  
  const [isResizing, setIsResizing] = useState(null); // 'left' or 'right' or null
  const containerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Validate panel widths on window resize to prevent overflow
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && !isMobile) {
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        const MIN_CENTER_WIDTH = 400;
        
        // Check if current widths exceed container
        const totalWidth = panelWidths.left + panelWidths.right + MIN_CENTER_WIDTH;
        
        if (totalWidth > containerWidth) {
          // Reset to safe defaults
          setPanelWidths({
            left: Math.min(380, containerWidth * 0.25),
            right: Math.min(450, containerWidth * 0.25)
          });
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, panelWidths.left, panelWidths.right]);
  
  // Save panel widths to localStorage when they change
  useEffect(() => {
    localStorage.setItem('panelWidths', JSON.stringify(panelWidths));
  }, [panelWidths]);
  
  // Handle resize mouse events
  const handleMouseDown = (panel) => {
    setIsResizing(panel);
  };
  
  const handleMouseMove = useCallback((e) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const mouseX = e.clientX - containerRect.left;
    
    // Define constraints
    const MIN_LEFT_WIDTH = 280;
    const MAX_LEFT_WIDTH = 800;
    const MIN_CENTER_WIDTH = 400;
    const MIN_RIGHT_WIDTH = 350;
    const MAX_RIGHT_WIDTH = 700;
    
    if (isResizing === 'left') {
      // Resizing left panel
      // Ensure we leave space for center (min 400px) and right panel
      const maxAllowed = Math.min(
        MAX_LEFT_WIDTH,
        containerWidth - MIN_CENTER_WIDTH - panelWidths.right
      );
      const newLeftWidth = Math.min(
        Math.max(mouseX, MIN_LEFT_WIDTH),
        maxAllowed
      );
      setPanelWidths(prev => ({ ...prev, left: Math.round(newLeftWidth) }));
    } else if (isResizing === 'right') {
      // Resizing right panel (from the left edge of right panel)
      // Ensure we leave space for left panel and center (min 400px)
      const maxAllowed = Math.min(
        MAX_RIGHT_WIDTH,
        containerWidth - panelWidths.left - MIN_CENTER_WIDTH
      );
      const newRightWidth = Math.min(
        Math.max(containerWidth - mouseX, MIN_RIGHT_WIDTH),
        maxAllowed
      );
      setPanelWidths(prev => ({ ...prev, right: Math.round(newRightWidth) }));
    }
  }, [isResizing, panelWidths.left, panelWidths.right]);
  
  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);
  
  // Add global mouse event listeners when resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'auto';
        document.body.style.userSelect = 'auto';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleGeneratePaper = async (title, description) => {
    setIsGenerating(true);
    setGenerationStep('Analyzing research topic...');
    
    try {
      // Add initial chat message
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '✨ Starting research paper generation...' }
      ]);
      
      // Generate paper
      setGenerationStep('Writing research paper...');
      const latexContent = await generatePaper(title, description);
      
      // Generate Python code
      setGenerationStep('Creating experiment code...');
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '✅ Paper complete! Now generating code...' }
      ]);
      
      const pythonCode = await generatePythonCode(title, description, latexContent);
      
      setPaperData({
        title,
        description,
        latexContent,
        pythonCode
      });
      
      setGenerationStep('Complete!');
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '✨ All done! Your paper and code are ready.' }
      ]);
      
      // Auto-switch to output view on mobile
      if (isMobile) {
        setActiveSection('output');
      }
      
    } catch (error) {
      console.error('Error generating paper:', error);
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: `❌ Error: ${error.message}` }
      ]);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleChatMessage = async (message) => {
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await chatWithAI(message, paperData.latexContent, paperData.pythonCode);
      
      // Check if response is code or latex
      if (response.includes('\\section') || response.includes('\\subsection')) {
        setPaperData(prev => ({ ...prev, latexContent: response }));
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '✅ Paper updated successfully!' }
        ]);
      } else if (response.includes('import ') || response.includes('def ')) {
        setPaperData(prev => ({ ...prev, pythonCode: response }));
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '✅ Python code updated successfully!' }
        ]);
      } else {
        setChatHistory(prev => [...prev, { role: 'agent', content: response }]);
      }
    } catch (error) {
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: `❌ Error: ${error.message}` }
      ]);
    }
  };

  const handleUpdateLatex = (newLatex) => {
    setPaperData(prev => ({ ...prev, latexContent: newLatex }));
  };

  const handleUpdatePython = (newCode) => {
    setPaperData(prev => ({ ...prev, pythonCode: newCode }));
  };
  
  const resetPanelWidths = () => {
    setPanelWidths({ left: 380, right: 450 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <motion.div 
          className="absolute top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/15 via-primary-600/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-[600px] h-[600px] bg-gradient-to-tl from-primary-600/15 via-primary-500/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-primary-400/8 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Accent colors */}
        <motion.div 
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 40, 0],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        {/* Reset panel widths button - desktop only */}
        {!isMobile && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetPanelWidths}
            className="fixed bottom-6 right-6 p-3 bg-dark-800/80 hover:bg-dark-700 rounded-xl border border-dark-700/50 text-white z-30 backdrop-blur-sm shadow-xl group"
            title="Reset panel sizes"
          >
            <Maximize2 className="w-4 h-4 group-hover:text-primary-400 transition-colors" />
          </motion.button>
        )}
        
        {/* Enhanced loading overlay with steps */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-950/95 backdrop-blur-xl z-50 flex items-center justify-center"
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-[600px] h-[600px] bg-primary-500 rounded-full blur-[120px]"
                />
              </div>
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 20 }}
                className="relative glass-dark rounded-3xl p-12 flex flex-col items-center gap-8 max-w-md w-full mx-4 shadow-2xl"
              >
                {/* Spinner with glow */}
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-4 border-dark-700/50"
                    style={{
                      borderTopColor: '#3b82f6',
                      borderRightColor: '#3b82f6',
                    }}
                  />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl"
                  />
                  {/* Center icon */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-primary-400" />
                  </motion.div>
                </div>
                
                <div className="text-center space-y-4 w-full">
                  <motion.p
                    key={generationStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-lg font-semibold"
                  >
                    {generationStep}
                  </motion.p>
                  
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ 
                        x: ['-100%', '100%'],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary-500 to-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-dark-400 text-sm">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-primary-500"
                    />
                    <span>This may take 30-60 seconds</span>
                  </div>
                </div>
                
                {/* Step indicators */}
                <div className="flex items-center gap-2 pt-2">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary-400 to-primary-600"
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Desktop layout - 3 columns with resizable panels */}
        <div 
          ref={containerRef}
          className="hidden lg:grid flex-1 min-h-0 relative"
          style={{ 
            gridTemplateColumns: `${panelWidths.left}px 1fr ${panelWidths.right}px` 
          }}
        >
          {/* Overlay when resizing to prevent iframe/content interference */}
          {isResizing && (
            <div className="absolute inset-0 z-30" style={{ cursor: 'col-resize' }} />
          )}
          <InputSection
            onGeneratePaper={handleGeneratePaper}
            chatHistory={chatHistory}
            onSendMessage={handleChatMessage}
            isGenerating={isGenerating}
          />
          
          {/* Left resize handle */}
          <div
            className={`absolute top-0 bottom-0 w-1 cursor-col-resize z-20 ${
              isResizing === 'left' ? 'bg-primary-500/50 w-1' : 'bg-transparent hover:bg-primary-500/30'
            }`}
            style={{ left: `${panelWidths.left - 1}px` }}
            onMouseDown={() => handleMouseDown('left')}
            title="Drag to resize (min: 280px, max: 800px)"
          />
          
          <OutputSection
            paperData={paperData}
            currentView={currentView}
            onViewChange={setCurrentView}
            onUpdateLatex={handleUpdateLatex}
          />
          
          {/* Right resize handle */}
          <div
            className={`absolute top-0 bottom-0 w-1 cursor-col-resize z-20 ${
              isResizing === 'right' ? 'bg-primary-500/50 w-1' : 'bg-transparent hover:bg-primary-500/30'
            }`}
            style={{ right: `${panelWidths.right - 1}px` }}
            onMouseDown={() => handleMouseDown('right')}
            title="Drag to resize (min: 350px, max: 900px)"
          />
          
          <CodeSection
            pythonCode={paperData.pythonCode}
            onUpdateCode={handleUpdatePython}
          />
        </div>
        
        {/* Mobile layout - Single section at a time */}
        <div className="lg:hidden flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeSection === 'input' && (
              <motion.div
                key="input"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="h-full"
              >
                <InputSection
                  onGeneratePaper={handleGeneratePaper}
                  chatHistory={chatHistory}
                  onSendMessage={handleChatMessage}
                  isGenerating={isGenerating}
                  isMobile={true}
                />
              </motion.div>
            )}
            
            {activeSection === 'output' && (
              <motion.div
                key="output"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="h-full"
              >
                <OutputSection
                  paperData={paperData}
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  onUpdateLatex={handleUpdateLatex}
                  isMobile={true}
                />
              </motion.div>
            )}
            
            {activeSection === 'code' && (
              <motion.div
                key="code"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="h-full"
              >
                <CodeSection
                  pythonCode={paperData.pythonCode}
                  onUpdateCode={handleUpdatePython}
                  isMobile={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Mobile navigation */}
          {isMobile && (
            <MobileNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              hasContent={!!paperData.latexContent}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
