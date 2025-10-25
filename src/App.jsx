import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import CodeSection from './components/CodeSection';
import Header from './components/Header';
import MobileNavigation from './components/MobileNavigation';
import { generatePaper, generatePythonCode, chatWithAI } from './services/geminiService';
import { Loader2 } from 'lucide-react';

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary-400/5 rounded-full blur-3xl animate-float" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        {/* Loading overlay with steps */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-950/90 backdrop-blur-md z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="glass-dark rounded-2xl p-10 flex flex-col items-center gap-6 max-w-md w-full mx-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500"
                />
                
                <div className="text-center space-y-3">
                  <motion.p
                    key={generationStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-base font-medium"
                  >
                    {generationStep}
                  </motion.p>
                  <div className="flex items-center justify-center gap-2 text-dark-400 text-xs">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-primary-400"
                    />
                    <span>This may take 30-60 seconds</span>
                  </div>
                </div>
                
                {/* Progress steps */}
                <div className="flex items-center gap-3 mt-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-primary-400"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-primary-400"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-primary-400"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Desktop layout - 3 columns */}
        <div className="hidden lg:grid grid-cols-[380px,1fr,450px] flex-1 min-h-0">
          <InputSection
            onGeneratePaper={handleGeneratePaper}
            chatHistory={chatHistory}
            onSendMessage={handleChatMessage}
            isGenerating={isGenerating}
          />
          <OutputSection
            paperData={paperData}
            currentView={currentView}
            onViewChange={setCurrentView}
            onUpdateLatex={handleUpdateLatex}
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
