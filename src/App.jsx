import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import CodeSection from './components/CodeSection';
import Header from './components/Header';
import MobileNavigation from './components/MobileNavigation';
import { generatePaper, generatePythonCode, chatWithAI, PROVIDERS, getApiKey } from './services/aiService';
import { MOCK_LATEX, MOCK_PYTHON } from './services/geminiService';
import { Maximize2 } from 'lucide-react';

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
  
  // AI Provider settings - Anthropic recommended for best code generation
  const [selectedProvider, setSelectedProvider] = useState('anthropic'); // Default to Anthropic (claude-sonnet-4-5)
  const [selectedModel, setSelectedModel] = useState(PROVIDERS.anthropic.defaultModel); // claude-sonnet-4-5
  
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

  const handleGeneratePaper = async (title, description, isDemo = false) => {
    setIsGenerating(true);
    setGenerationStep('Analyzing research topic...');
    
    try {
      // If demo mode, use mock data
      if (isDemo) {
        // Clear previous chat history for new generation
        setChatHistory([]);
        
        // Step 1: Starting
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '🚀 Initializing AI Research Agent in Demo Mode...' }
        ]);
        
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: `📚 Research Topic: "${title}"` }
        ]);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '⚡ Loading pre-generated demo paper...' }
        ]);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '✅ Research paper loaded successfully!' }
        ]);
        
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '💻 Loading demo Python implementation...' }
        ]);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '✅ Python code loaded successfully!' }
        ]);
        
        // Set the mock data
        setPaperData({
          title,
          description,
          latexContent: MOCK_LATEX,
          pythonCode: MOCK_PYTHON
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setGenerationStep('Complete!');
        setChatHistory(prev => [
          ...prev, 
          { role: 'agent', content: '🎉 Demo paper ready! This is a pre-generated example showing the system capabilities.' },
          { role: 'agent', content: '📄 Paper: View in Preview or LaTeX mode | 💾 Download as PDF' },
          { role: 'agent', content: '🐍 Code: Complete Python implementation with AdaLoRA algorithm' }
        ]);
        
        // Auto-switch to output view on mobile
        if (isMobile) {
          setActiveSection('output');
        }
        
        setIsGenerating(false);
        setGenerationStep('');
        return;
      }
      
      // Normal generation with API
      // Get API key for selected provider
      const apiKey = getApiKey(selectedProvider);
      if (!apiKey) {
        throw new Error(`Please add your ${PROVIDERS[selectedProvider]?.name || selectedProvider} API key in Settings`);
      }
      
      // Clear previous chat history for new generation
      setChatHistory([]);
      
      // Step 1: Starting
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: `🚀 Initializing AI Research Agent with ${PROVIDERS[selectedProvider]?.name}...` }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 2: Analyzing topic
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: `📚 Research Topic: "${title}"` }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '🔍 Analyzing research domain and identifying key concepts...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Step 3: Planning paper structure
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '📋 Planning paper structure: Abstract, Introduction, Methodology, Results...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Progress callback for paper generation
      const paperProgress = (message) => {
        setChatHistory(prev => [...prev, { role: 'agent', content: message }]);
      };
      
      // Step 4: Writing paper sections
      setGenerationStep('Writing research paper...');
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '✍️ Writing Abstract and Introduction...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '🔬 Developing Methodology section with mathematical formulations...' }
      ]);
      
      const latexContent = await generatePaper(
        selectedProvider, 
        selectedModel, 
        apiKey, 
        title, 
        description,
        paperProgress
      );
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '📊 Documenting Results and Analysis sections...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '📝 Finalizing Discussion, Conclusion, and References...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Progress callback for code generation
      const codeProgress = (message) => {
        setChatHistory(prev => [...prev, { role: 'agent', content: message }]);
      };
      
      // Step 5: Starting code generation
      setGenerationStep('Creating experiment code...');
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '💻 Starting Python implementation...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '🏗️ Building model architecture and data pipelines...' }
      ]);
      
      const pythonCode = await generatePythonCode(
        selectedProvider,
        selectedModel,
        apiKey,
        title,
        description,
        latexContent,
        codeProgress
      );
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '🔧 Adding training loops and evaluation metrics...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Step 6: Complete
      setPaperData({
        title,
        description,
        latexContent,
        pythonCode
      });
      
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '✨ Formatting paper for optimal readability...' }
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setGenerationStep('Complete!');
      setChatHistory(prev => [
        ...prev, 
        { role: 'agent', content: '🎉 Success! Your NeurIPS-style research paper and implementation code are ready!' },
        { role: 'agent', content: '📄 Paper: View in Preview or LaTeX mode | 💾 Download as PDF' },
        { role: 'agent', content: '🐍 Code: Complete Python implementation with model and experiments' }
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
      // Get API key for selected provider
      const apiKey = getApiKey(selectedProvider);
      if (!apiKey) {
        throw new Error(`Please add your ${PROVIDERS[selectedProvider]?.name || selectedProvider} API key in Settings`);
      }
      
      const response = await chatWithAI(
        selectedProvider,
        selectedModel,
        apiKey,
        message,
        paperData.latexContent,
        paperData.pythonCode
      );
      
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
  
  // Handler for provider change
  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    // Automatically set the default model for the new provider
    setSelectedModel(PROVIDERS[provider]?.defaultModel || '');
  };
  
  // Handler for model change
  const handleModelChange = (model) => {
    setSelectedModel(model);
  };

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <motion.div 
          className="absolute top-20 -left-20 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(47, 129, 247, 0.08) 0%, rgba(47, 129, 247, 0.04) 50%, transparent 100%)'
          }}
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(47, 129, 247, 0.08) 0%, rgba(37, 99, 235, 0.04) 50%, transparent 100%)'
          }}
          animate={{ 
            x: [0, -40, 0],
            y: [0, -50, 0],
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/3 w-[700px] h-[700px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(47, 129, 247, 0.06) 0%, transparent 70%)'
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Grid overlay with new colors */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'linear-gradient(rgba(48, 54, 61, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(48, 54, 61, 0.4) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)'
          }}
        />
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
            className="fixed bottom-6 right-6 p-3 bg-dark-800 hover:bg-dark-700 rounded-xl border border-dark-500 z-30 backdrop-blur-sm shadow-xl group"
            style={{ color: '#E6EDF3' }}
            title="Reset panel sizes"
          >
            <Maximize2 className="w-4 h-4 group-hover:text-primary-500 transition-colors" />
          </motion.button>
        )}
        
        {/* Loading overlay removed - progress now shows in AI Chat */}
        
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
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={handleProviderChange}
            onModelChange={handleModelChange}
          />
          
          {/* Left resize handle */}
          <div
            className="absolute top-0 bottom-0 w-1 cursor-col-resize z-20 transition-colors"
            style={{ 
              left: `${panelWidths.left - 1}px`,
              background: isResizing === 'left' ? 'rgba(47, 129, 247, 0.6)' : 'transparent'
            }}
            onMouseDown={() => handleMouseDown('left')}
            onMouseEnter={(e) => !isResizing && (e.target.style.background = 'rgba(47, 129, 247, 0.4)')}
            onMouseLeave={(e) => !isResizing && (e.target.style.background = 'transparent')}
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
            className="absolute top-0 bottom-0 w-1 cursor-col-resize z-20 transition-colors"
            style={{ 
              right: `${panelWidths.right - 1}px`,
              background: isResizing === 'right' ? 'rgba(47, 129, 247, 0.6)' : 'transparent'
            }}
            onMouseDown={() => handleMouseDown('right')}
            onMouseEnter={(e) => !isResizing && (e.target.style.background = 'rgba(47, 129, 247, 0.4)')}
            onMouseLeave={(e) => !isResizing && (e.target.style.background = 'transparent')}
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
                  selectedProvider={selectedProvider}
                  selectedModel={selectedModel}
                  onProviderChange={handleProviderChange}
                  onModelChange={handleModelChange}
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
