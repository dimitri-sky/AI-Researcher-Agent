import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Bot, User, ChevronDown, ChevronUp, Upload, Github, Key } from 'lucide-react';

const InputSection = ({ onGeneratePaper, chatHistory, onSendMessage, isGenerating, isMobile }) => {
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
  
  // Model settings
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState('');
  
  // Latest default models by provider
  const defaultModelsByProvider = {
    google: 'gemini-2.5-pro',
    openai: 'gpt-5',
    xai: 'grok-4',
    anthropic: 'claude-4.5-sonnet',
    meta: 'llama-3.1-405b',
    mistral: 'mistral-large',
    cohere: 'command-r-plus'
  };
  
  // Handle provider change
  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    // Set the default/latest model for the new provider
    setSelectedModel(defaultModelsByProvider[provider] || '');
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
    if (title.trim() && description.trim()) {
      onGeneratePaper(title, description);
      // Collapse research input and open AI Agent after generation starts
      setActiveSection('agent');
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
      className={`flex flex-col min-h-0 h-full border-r border-dark-800/50 bg-dark-900/50 backdrop-blur-xl ${
        isMobile ? '' : ''
      }`}
    >
      {/* Section header */}
      <div className="px-6 py-4 border-b border-dark-800/50 min-h-[76px] flex items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/20">
            <MessageSquare className="w-4 h-4 text-primary-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Research Input</h2>
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/20">
                <MessageSquare className="w-4 h-4 text-primary-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Research Input</h3>
                <p className="text-[10px] text-dark-500">Enter your topic and methodology</p>
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
                    <label htmlFor="title" className="block text-xs font-semibold text-gray-300 mb-2 tracking-wide">
                      Research Topic
                    </label>
            <div className="relative group">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Efficient Fine-Tuning of Large Language Models"
                className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border-2 border-dark-700/50 text-white placeholder-dark-500 focus:border-primary-500/50 focus:bg-dark-800/80 transition-all text-sm group-hover:border-dark-600/50 backdrop-blur-sm shadow-sm"
                disabled={isGenerating}
              />
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="description" className="block text-xs font-semibold text-gray-300 mb-2 tracking-wide">
                      Focus & Methodology
                    </label>
            <div className="relative group">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Fine-tuning large language models (LLMs) for downstream tasks..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-dark-800/60 border-2 border-dark-700/50 text-white placeholder-dark-500 focus:border-primary-500/50 focus:bg-dark-800/80 transition-all resize-none text-sm leading-relaxed group-hover:border-dark-600/50 backdrop-blur-sm shadow-sm"
                disabled={isGenerating}
              />
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSubmit(e);
                    }}
                    disabled={isGenerating || !title.trim() || !description.trim()}
                    className="relative w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white font-semibold hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/30 overflow-hidden group"
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <span className="relative flex items-center justify-center gap-2.5">
                      <Sparkles className="w-4 h-4" />
                      Generate Paper
                    </span>
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Settings Section - Collapsible */}
        <motion.div
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/20">
                <Key className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Settings</h3>
                <p className="text-[10px] text-dark-500">Model, repository, and files</p>
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
                        <div className="p-1.5 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                          <Key className="w-3.5 h-3.5 text-primary-400" />
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
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1.5">
                        Provider
                      </label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => handleProviderChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-white text-xs focus:border-primary-500 focus:bg-dark-800 transition-all"
                        disabled={isGenerating}
                      >
                        <option value="google">Google</option>
                        <option value="openai">OpenAI</option>
                        <option value="xai">xAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="meta">Meta</option>
                        <option value="mistral">Mistral AI</option>
                        <option value="cohere">Cohere</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1.5">
                        Model
                      </label>
                      <input
                        type="text"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        placeholder="Enter model name..."
                        className="w-full px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-white placeholder-dark-500 text-xs focus:border-primary-500 focus:bg-dark-800 transition-all"
                        disabled={isGenerating}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-dark-300 mb-1.5">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your API key..."
                        className="w-full px-3 py-2 rounded-lg bg-dark-800/50 border border-dark-700/50 text-white placeholder-dark-500 text-xs focus:border-primary-500 focus:bg-dark-800 transition-all"
                        disabled={isGenerating}
                      />
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
                        <div className="p-1.5 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                          <Github className="w-3.5 h-3.5 text-primary-400" />
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
                        <div className="p-1.5 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-primary-400" />
                        </div>
                        <span className="text-xs font-semibold text-white">Upload Files</span>
                        {uploadedFiles.length > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded-full text-[10px] font-bold border border-primary-500/30"
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
                      className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-dark-700/50 text-dark-400 text-xs font-medium hover:border-primary-500/50 hover:text-primary-400 transition-all flex items-center justify-center gap-2"
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
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/20">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Agent</h3>
                <p className="text-[10px] text-dark-500">I can edit your paper and code</p>
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
                  <div className="card rounded-xl p-4 mb-3 flex-1 min-h-[150px] overflow-y-auto custom-scrollbar backdrop-blur-sm">
                    {chatHistory.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-dark-500 text-xs text-center">
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
                                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                  <Bot className="w-3 h-3 text-primary-400" />
                                </div>
                              )}
                              <div
                                className={`max-w-[80%] px-2.5 py-1.5 rounded-lg text-xs ${
                                  message.role === 'user'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-700/50 text-dark-200'
                                }`}
                              >
                                {message.content}
                              </div>
                              {message.role === 'user' && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-dark-700 flex items-center justify-center">
                                  <User className="w-3 h-3 text-dark-300" />
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
                      className="p-2.5 rounded-xl bg-dark-800/60 text-dark-400 hover:bg-dark-700/60 hover:text-primary-400 border border-dark-700/50 hover:border-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                        className="w-full px-4 py-2.5 rounded-xl bg-dark-800/60 border-2 border-dark-700/50 text-white placeholder-dark-500 focus:border-primary-500/50 focus:bg-dark-800/80 transition-all text-sm group-hover:border-dark-600/50"
                        disabled={isGenerating}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleChatSubmit(e);
                          }
                        }}
                      />
                      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-600/0 opacity-0 group-focus-within:opacity-100 blur transition-opacity" />
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
                      className="p-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/25"
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
