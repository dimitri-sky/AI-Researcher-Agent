import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Bot, User, ChevronDown, ChevronUp, Upload, Github, Key, Rocket, AlertCircle, Check } from 'lucide-react';
import { PROVIDERS, saveApiKey, getApiKey, hasApiKey } from '../services/aiService';

const InputSection = ({ onGeneratePaper, chatHistory, onSendMessage, isGenerating, isMobile, selectedProvider, selectedModel, onProviderChange, onModelChange }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  
  // Main sections state - only one can be open at a time
  const [activeSection, setActiveSection] = useState('research'); // 'research', 'settings', or 'agent'
  
  // Settings subsections state
  const [modelExpanded, setModelExpanded] = useState(false);
  const [githubExpanded, setGithubExpanded] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);
  
  // API Key state and management
  const [apiKey, setApiKey] = useState('');
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  
  // Load API key for selected provider on mount and provider change
  useEffect(() => {
    const savedKey = getApiKey(selectedProvider);
    setApiKey(savedKey);
    setApiKeySaved(!!savedKey);
  }, [selectedProvider]);
  
  // Handle provider change
  const handleProviderChange = (provider) => {
    onProviderChange(provider);
    const savedKey = getApiKey(provider);
    setApiKey(savedKey);
    setApiKeySaved(!!savedKey);
  };
  
  // Handle API key save
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveApiKey(selectedProvider, apiKey.trim());
      setApiKeySaved(true);
      // Flash success animation
      setTimeout(() => {
        setApiKeySaved(false);
        setTimeout(() => setApiKeySaved(true), 100);
      }, 100);
    }
  };
  
  // GitHub settings
  const [githubRepo, setGithubRepo] = useState('');
  
  // File uploads
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const chatFileInputRef = useRef(null);
  
  useEffect(() => {
    // Only scroll the chat container, not the entire page
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chatHistory]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if API key is available
    if (!hasApiKey(selectedProvider)) {
      setShowApiKeyWarning(true);
      setActiveSection('settings');
      setModelExpanded(true);
      // Scroll to settings if needed
      setTimeout(() => {
        const settingsElement = document.querySelector('#settings-section');
        if (settingsElement) {
          settingsElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return;
    }
    
    if (title.trim() && description.trim()) {
      // Open AI Agent section to show loading progress
      setActiveSection('agent');
      onGeneratePaper(title, description);
      setShowApiKeyWarning(false);
    }
    // Prevent any scrolling
    if (e.target) {
      e.target.blur();
    }
  };
  
  const handleChatSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (chatInput.trim()) {
      onSendMessage(chatInput);
      setChatInput('');
    }
    // Prevent any scrolling
    if (e.target) {
      e.target.blur();
    }
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };
  
  const handleChatFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // Handle file upload in chat - you can extend this to send files with messages
    console.log('Chat files uploaded:', files);
  };
  
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className={`flex flex-col min-h-0 h-full backdrop-blur-xl ${
        isMobile ? '' : ''
      }`}
      style={{
        borderRight: '1px solid rgba(30, 36, 44, 0.8)',
        background: 'rgba(13, 17, 23, 0.6)'
      }}
    >
      {/* Section header */}
      <div className="px-6 py-4 min-h-[76px] flex items-center"
        style={{
          borderBottom: '1px solid rgba(30, 36, 44, 0.8)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl"
            style={{
              background: '#000000',
              border: '1px solid #000000',
              boxShadow: '0 0 12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <MessageSquare className="w-4 h-4" style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Research Input</h2>
          </div>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4 min-h-0">
        
        {/* Research Input Section - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card rounded-2xl overflow-hidden flex-shrink-0"
        >
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'research' ? null : 'research')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-dark-800/60 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl"
                style={{
                  background: '#000000',
                  border: '1px solid #000000',
                  boxShadow: '0 0 12px rgba(0, 0, 0, 0.5)'
                }}
              >
                <MessageSquare className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Research Input</h3>
                <p className="text-[10px]" style={{ color: '#6E7681' }}>Enter your topic and methodology</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: activeSection === 'research' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-dark-400 group-hover:text-white transition-colors" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {activeSection === 'research' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-dark-700/50"
              >
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="title" className="block text-xs font-semibold mb-2 tracking-wide"
                      style={{ color: '#9BA3AF' }}
                    >
                      Research Topic
                    </label>
            <div className="relative group">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Efficient Fine-Tuning of Large Language Models"
                className="w-full px-4 py-3 rounded-xl border-2 transition-all text-sm backdrop-blur-sm shadow-sm"
                style={{
                  background: 'rgba(22, 27, 34, 0.6)',
                  borderColor: '#21262D',
                  color: '#E6EDF3'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2F81F7'}
                onBlur={(e) => e.target.style.borderColor = '#21262D'}
                disabled={isGenerating}
              />
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="description" className="block text-xs font-semibold mb-2 tracking-wide"
                      style={{ color: '#9BA3AF' }}
                    >
                      Focus & Methodology
                    </label>
            <div className="relative group">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fine-tuning large language models (LLMs) for downstream tasks..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 transition-all resize-none text-sm leading-relaxed backdrop-blur-sm shadow-sm"
                style={{
                  background: 'rgba(22, 27, 34, 0.6)',
                  borderColor: '#21262D',
                  color: '#E6EDF3'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2F81F7'}
                onBlur={(e) => e.target.style.borderColor = '#21262D'}
                disabled={isGenerating}
              />
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit(e);
                      }}
                      disabled={isGenerating || !title.trim() || !description.trim()}
                      className="relative flex-1 py-2 px-4 rounded-xl font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden group"
                      style={{
                        background: '#000000',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 8px -1px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {/* Shine effect - left to right on hover */}
                      <div
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-out"
                        style={{
                          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent)'
                        }}
                      />
                      <span className="relative flex items-center justify-center gap-1.5">
                        <Rocket className="w-3 h-5" />
                        <span className="whitespace-nowrap">Generate Paper</span>
                      </span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        
                        // Load demo paper with mock data - no API key needed
                        const demoTitle = "Efficient Fine-Tuning of Large Language Models via Adaptive Low-Rank Decomposition";
                        const demoDescription = "Fine-tuning large language models (LLMs) for downstream tasks remains computationally expensive due to the massive number of parameters requiring optimization. We introduce AdaLoRA (Adaptive Low-Rank Adaptation), a parameter-efficient fine-tuning method that dynamically allocates parameter budgets across weight matrices based on their importance to the task.";
                        // Open AI Agent section to show loading progress
                        setActiveSection('agent');
                        onGeneratePaper(demoTitle, demoDescription, true); // Pass true for demo mode
                        setShowApiKeyWarning(false);
                      }}
                      disabled={isGenerating}
                      className="relative flex-1 py-2 px-4 rounded-xl font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden group"
                      style={{
                        background: '#000000',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 8px -1px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                        style={{
                          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.15), transparent)'
                        }}
                      />
                      <span className="relative flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">Demo Paper</span>
                      </span>
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Settings Section - Collapsible */}
        <motion.div
          id="settings-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card rounded-2xl overflow-hidden flex-shrink-0"
        >
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'settings' ? null : 'settings')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-dark-800/60 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl"
                style={{
                  background: '#000000',
                  border: '1px solid #000000',
                  boxShadow: '0 0 12px rgba(0, 0, 0, 0.5)'
                }}
              >
                <Key className="w-4 h-4" style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Settings</h3>
                <p className="text-[10px]" style={{ color: '#6E7681' }}>Model, repository, and files</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: activeSection === 'settings' ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-dark-400 group-hover:text-white transition-colors" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {activeSection === 'settings' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-dark-700/50"
              >
                <div className="p-4 space-y-3">
                  {/* Model Selection */}
                  <div className="bg-dark-800/30 rounded-xl overflow-hidden border border-dark-700/30">
                    <button
                      type="button"
                      onClick={() => setModelExpanded(!modelExpanded)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-800/50 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-black/80 group-hover:bg-black transition-colors">
                          <Key className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white">Model Selection</span>
                      </div>
                      <motion.div
                        animate={{ rotate: modelExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-dark-400 group-hover:text-white transition-colors" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {modelExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-dark-700/30"
                        >
                          <div className="p-4 space-y-3">
                    {/* API Key Warning */}
                    {showApiKeyWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-yellow-200 font-medium">
                              API Key Required
                            </p>
                            <p className="text-xs text-yellow-300/70 mt-0.5">
                              Please add your {PROVIDERS[selectedProvider]?.name || selectedProvider} API key below to generate papers.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1.5">
                        Provider
                        {PROVIDERS[selectedProvider]?.recommended && (
                          <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-semibold">
                            Recommended
                          </span>
                        )}
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-white text-xs focus:border-primary-500 focus:bg-dark-800 transition-all"
                        disabled={isGenerating}
                      >
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="openai">OpenAI (GPT)</option>
                        <option value="google">Google (Gemini)</option>
                        <option value="xai">xAI (Grok)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1.5">
                        Model
                        <span className="ml-1 text-dark-500">(Latest: {PROVIDERS[selectedProvider]?.defaultModel})</span>
                      </label>
                      <input
                        type="text"
                        value={selectedModel}
                        onChange={(e) => onModelChange(e.target.value)}
                        placeholder={`e.g., ${PROVIDERS[selectedProvider]?.defaultModel}`}
                        className="w-full px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-white placeholder-dark-500 text-xs focus:border-primary-500 focus:bg-dark-800 transition-all"
                        disabled={isGenerating}
                      />
                      <p className="mt-1 text-[10px] text-dark-500">
                        Enter any {PROVIDERS[selectedProvider]?.name} model identifier
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1.5">
                        API Key
                        {apiKeySaved && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px]"
                          >
                            <Check className="w-3 h-3" />
                            Saved
                          </motion.span>
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => {
                            setApiKey(e.target.value);
                            setApiKeySaved(false);
                          }}
                          placeholder={`Enter your ${PROVIDERS[selectedProvider]?.name || selectedProvider} API key...`}
                          className="flex-1 px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-white placeholder-dark-500 text-xs focus:border-primary-500 focus:bg-dark-800 transition-all"
                          disabled={isGenerating}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handleSaveApiKey}
                          disabled={isGenerating || !apiKey.trim() || apiKeySaved}
                          className="px-3 py-2 rounded-lg bg-dark-700/50 text-white text-xs font-medium hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Save
                        </motion.button>
                      </div>
                      <p className="mt-1 text-[10px] text-dark-500">
                        Your API key is stored locally in your browser
                      </p>
                    </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* GitHub Repository */}
                  <div className="bg-dark-800/30 rounded-xl overflow-hidden border border-dark-700/30">
                    <button
                      type="button"
                      onClick={() => setGithubExpanded(!githubExpanded)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-800/50 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-black/80 group-hover:bg-black transition-colors">
                          <Github className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white">GitHub Repository</span>
                      </div>
                      <motion.div
                        animate={{ rotate: githubExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-dark-400 group-hover:text-white transition-colors" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {githubExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-dark-700/30"
                        >
                          <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1.5">
                        Repository URL
                      </label>
                      <input
                        type="text"
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className="w-full px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-white placeholder-dark-500 text-xs focus:border-primary-500 focus:bg-dark-800 transition-all"
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t border-dark-700/50"></div>
                      <span className="text-xs text-dark-500">or</span>
                      <div className="flex-1 border-t border-dark-700/50"></div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      className="w-full py-2 px-4 rounded-lg bg-dark-700/50 text-white text-xs font-medium hover:bg-dark-700 transition-all flex items-center justify-center gap-2"
                      disabled={isGenerating}
                    >
                      <Github className="w-3.5 h-3.5" />
                      Login with GitHub
                    </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Upload Files */}
                  <div className="bg-dark-800/30 rounded-xl overflow-hidden border border-dark-700/30">
                    <button
                      type="button"
                      onClick={() => setFilesExpanded(!filesExpanded)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-800/50 transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-black/80 group-hover:bg-black transition-colors">
                          <Upload className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-white">Upload Files</span>
                        {uploadedFiles.length > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 bg-black/60 text-white rounded-full text-[10px] font-bold border border-black"
                          >
                            {uploadedFiles.length}
                          </motion.span>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: filesExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4 text-dark-400 group-hover:text-white transition-colors" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {filesExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-dark-700/30"
                        >
                          <div className="p-4 space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isGenerating}
                    />
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-dark-700/50 text-dark-400 text-xs font-medium hover:border-black hover:text-white transition-all flex items-center justify-center gap-2"
                      disabled={isGenerating}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Choose Files
                    </motion.button>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-1.5">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-2 bg-dark-800/50 rounded-lg"
                          >
                            <span className="text-xs text-white truncate flex-1">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="ml-2 text-dark-500 hover:text-red-400 transition-colors text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* AI Agent Section - Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`card rounded-2xl overflow-hidden ${activeSection === 'agent' ? 'flex-1 flex flex-col min-h-0' : 'flex-shrink-0'}`}
        >
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'agent' ? null : 'agent')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-dark-800/60 transition-all group flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl"
                style={{
                  background: '#000000',
                  border: '1px solid #000000',
                  boxShadow: '0 0 12px rgba(0, 0, 0, 0.5)'
                }}
              >
                <Bot className="w-5 h-5" style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>AI Agent</h3>
                <p className="text-[10px]" style={{ color: '#6E7681' }}>I can edit your paper and code</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: activeSection === 'agent' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-dark-400 group-hover:text-white transition-colors" />
              </motion.div>
            </div>
          </button>
          
          <AnimatePresence>
            {activeSection === 'agent' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-dark-700/50 flex flex-col flex-1 min-h-0"
              >
                <div className="p-5 flex flex-col flex-1 min-h-0">
                  {/* Chat messages - dynamic height */}
                    <div className="card rounded-xl p-4 mb-3 flex-1 min-h-[150px] overflow-y-auto scrollbar-black backdrop-blur-sm">
                    {chatHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-xs text-center" style={{ color: '#6E7681' }}>
                          I can edit the paper and code...
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <AnimatePresence>
                          {chatHistory.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`flex gap-2 ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {message.role === 'agent' && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ 
                                    background: '#000000',
                                    boxShadow: '0 0 8px rgba(0, 0, 0, 0.5)'
                                  }}
                                >
                                  <Bot className="w-3 h-3" style={{ color: '#FFFFFF' }} />
                                </div>
                              )}
                              <div
                                className="max-w-[80%] px-2.5 py-1.5 rounded-lg text-xs"
                                style={
                                  message.role === 'user'
                                    ? { background: '#2F81F7', color: '#E6EDF3' }
                                    : { background: 'rgba(30, 36, 44, 0.6)', color: '#9BA3AF' }
                                }
                              >
                                {message.content}
                              </div>
                              {message.role === 'user' && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                                  style={{ background: '#1E242C' }}
                                >
                                  <User className="w-3 h-3" style={{ color: '#6E7681' }} />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div ref={chatEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Chat input */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2 flex-shrink-0">
                    <input
                      ref={chatFileInputRef}
                      type="file"
                      multiple
                      onChange={handleChatFileUpload}
                      className="hidden"
                      disabled={isGenerating}
                    />
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => chatFileInputRef.current?.click()}
                      disabled={isGenerating}
                      className="p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: '#000000',
                        border: '1px solid #000000',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 8px -1px rgba(0, 0, 0, 0.5)'
                      }}
                      title="Upload files"
                    >
                      <Upload className="w-4 h-4" />
                    </motion.button>
                    
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="w-full px-4 py-2.5 rounded-xl border-2 transition-all text-sm"
                        style={{
                          background: 'rgba(22, 27, 34, 0.6)',
                          borderColor: '#21262D',
                          color: '#E6EDF3'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2F81F7'}
                        onBlur={(e) => e.target.style.borderColor = '#21262D'}
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleChatSubmit(e);
                          }
                        }}
                      />
                      <div className="absolute inset-0 -z-10 rounded-xl opacity-0 group-focus-within:opacity-100 blur transition-opacity"
                        style={{
                          background: 'linear-gradient(to right, transparent, rgba(47, 129, 247, 0.1), transparent)'
                        }}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleChatSubmit(e);
                      }}
                      disabled={isGenerating || !chatInput.trim()}
                      className="p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      style={{
                        background: '#000000',
                        color: '#FFFFFF',
                        boxShadow: '0 2px 8px -1px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InputSection;
