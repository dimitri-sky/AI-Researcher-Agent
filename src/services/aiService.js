import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Provider configuration with latest models
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    defaultModel: 'claude-sonnet-4-5',
    recommended: true,
    apiDocs: 'https://docs.anthropic.com/en/api'
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-5',
    apiDocs: 'https://platform.openai.com/docs'
  },
  google: {
    name: 'Google',
    defaultModel: 'gemini-2.5-pro',
    apiDocs: 'https://ai.google.dev/gemini-api/docs'
  },
  xai: {
    name: 'xAI',
    defaultModel: 'grok-4',
    apiDocs: 'https://docs.x.ai/'
  }
};

// API key management
const API_KEYS_STORAGE_KEY = 'ai_research_api_keys';

export function saveApiKey(provider, apiKey) {
  const keys = getApiKeys();
  keys[provider] = apiKey;
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export function getApiKeys() {
  const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function getApiKey(provider) {
  const keys = getApiKeys();
  return keys[provider] || '';
}

export function hasApiKey(provider) {
  return !!getApiKey(provider);
}

export function clearApiKey(provider) {
  const keys = getApiKeys();
  delete keys[provider];
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

// Provider-specific client initialization
function getAnthropicClient(apiKey) {
  if (!apiKey) throw new Error('Anthropic API key is required');
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

function getOpenAIClient(apiKey, provider = 'openai') {
  if (!apiKey) throw new Error(`${provider} API key is required`);
  
  // For xAI, use OpenAI client with custom base URL
  if (provider === 'xai') {
    return new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
      dangerouslyAllowBrowser: true
    });
  }
  
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

function getGeminiClient(apiKey) {
  if (!apiKey) throw new Error('Google API key is required');
  // Use the new GoogleGenAI class with object parameter
  return new GoogleGenAI({ apiKey });
}

// Clean LaTeX content
function cleanLatex(latex) {
  // Remove markdown code blocks
  latex = latex.replace(/```latex\n?/g, '').replace(/```\n?/g, '');
  
  // Remove document preamble commands
  latex = latex.replace(/\\documentclass\{[^}]*\}/g, '');
  latex = latex.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, '');
  latex = latex.replace(/\\geometry\{[^}]*\}/g, '');
  latex = latex.replace(/\\title\{[^}]*\}/g, '');
  latex = latex.replace(/\\author\{[^}]*\}/g, '');
  latex = latex.replace(/\\date\{[^}]*\}/g, '');
  latex = latex.replace(/\\begin\{document\}/g, '');
  latex = latex.replace(/\\end\{document\}/g, '');
  latex = latex.replace(/\\maketitle/g, '');
  latex = latex.replace(/\\noindent/g, '');
  
  return latex.trim();
}

// Clean Python code
function cleanPythonCode(code) {
  // Remove markdown formatting
  code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '');
  return code.trim();
}

// Paper generation prompts
const PAPER_PROMPT_TEMPLATE = (title, description) => `You are an expert academic researcher writing for NeurIPS. Generate a comprehensive, technically rigorous research paper in LaTeX format.

TITLE: ${title}
FOCUS: ${description}

CRITICAL LaTeX FORMAT RULES:

1. NO PREAMBLE: Do NOT include \\documentclass, \\usepackage, \\begin{document}, \\end{document}, \\maketitle
2. START DIRECTLY with the paper content
3. Use ONLY basic LaTeX commands that work without packages

PAPER HEADER (copy exactly):
\\begin{center}
\\textbf{\\Large ${title}}

\\vspace{0.3cm}

\\textbf{Jennifer Chen}$^{1,*}$, \\textbf{Michael Zhang}$^{1}$, \\textbf{Sarah Williams}$^{2}$, \\textbf{David Kumar}$^{1}$

\\vspace{0.2cm}

$^{1}$Department of Computer Science, Stanford University, Stanford, CA 94305

$^{2}$MIT Computer Science and Artificial Intelligence Laboratory, Cambridge, MA 02139

\\vspace{0.2cm}

$^{*}$Corresponding author: jchen@cs.stanford.edu

\\vspace{0.2cm}

\\textit{NeurIPS 2024 Conference Submission}
\\end{center}

\\vspace{0.4cm}

REQUIRED SECTIONS (in order):

\\subsection*{Abstract}
Write a 150-200 word abstract that clearly states:
- The problem being addressed
- Your novel approach/contribution
- Key methodology
- Main results (with specific metrics if applicable)
- Significance of the work

\\textbf{Keywords:} [5-7 relevant technical keywords]

\\section{Introduction}
Write 4-5 paragraphs covering:
- Problem motivation and importance
- Current limitations in existing work
- Your key contributions (use itemized list)
- Paper organization

\\section{Background and Related Work}
Include 2-3 subsections reviewing:
\\subsection{2.1 [Relevant Background Topic]}
\\subsection{2.2 [Related Approaches]}
\\subsection{2.3 [Comparison with Our Method]}

\\section{Methodology}
Detail your approach with:
\\subsection{3.1 Problem Formulation}
- Mathematical problem definition
- Notation and assumptions
\\subsection{3.2 Proposed Algorithm/Method}
- Detailed technical description
- Include 3-4 key equations
\\subsection{3.3 Theoretical Analysis}
- Complexity analysis or theoretical properties

\\section{Experimental Setup}
\\subsection{4.1 Datasets}
- Dataset descriptions and statistics
\\subsection{4.2 Baselines and Metrics}
- Comparison methods and evaluation metrics
\\subsection{4.3 Implementation Details}
- Hyperparameters, hardware, training details

\\section{Results and Analysis}
\\subsection{5.1 Main Results}
- Primary experimental results with specific numbers
- Comparison tables (use \\begin{tabular})
\\subsection{5.2 Ablation Studies}
- Component analysis
\\subsection{5.3 Qualitative Analysis}
- Visual or interpretive results

\\section{Discussion}
- Implications of results
- Limitations and failure cases
- Future directions

\\section{Conclusion}
- Concise summary of contributions
- Impact and potential applications

\\section*{References}
Include 15-20 properly formatted references:
[1] Author, A., Author, B. (2024). Paper Title. In \\textit{Conference/Journal Name}.

MATHEMATICAL EQUATIONS:
- Use $...$ for inline math
- Use $$...$$ for display equations
- Number important equations: $$equation \\quad (1)$$
- Include 8-12 meaningful equations throughout

QUALITY REQUIREMENTS:
- 3000-4000 words
- Technically precise and rigorous
- Use proper scientific writing style
- Include specific metrics and numbers
- Ensure mathematical notation is consistent
- Make contributions clear and novel
- Write in present tense for the paper, past tense for experiments

IMPORTANT LaTeX TIPS:
- Use \\textbf{} for bold, \\textit{} for italics
- Use \\cite{} style for citations: [1], [2]
- For lists: use itemize or enumerate environments
- For code: use verbatim environment
- Tables: \\begin{tabular}{lcr} ... \\end{tabular}
- Keep equations readable and well-formatted

Generate a complete, publication-ready paper that could be submitted to NeurIPS.`;

const CODE_PROMPT_TEMPLATE = (title, description, paperContent) => `You are an expert AI researcher and software engineer. Generate complete, runnable Python code to implement and run the experiment described in this research paper.

PAPER TITLE: ${title}
DESCRIPTION: ${description}

REQUIREMENTS:
- Generate a complete, runnable Python script (not a notebook)
- Use PyTorch for deep learning models
- Include all necessary imports (torch, numpy, matplotlib, sklearn, etc.)
- Implement the complete model architecture described
- Include training loop, evaluation functions, and metrics
- Add proper data loading (use synthetic data or standard datasets)
- Include visualization of results with matplotlib
- Add comprehensive docstrings and comments
- Make it production-ready with proper error handling
- The code should be self-contained and executable
- Include hyperparameter configuration
- Add progress tracking during training
- Generate performance plots

IMPORTANT:
- Start directly with imports
- No markdown code blocks or explanations
- Only Python code
- Target 400-600 lines of well-structured code
- Include main() function and if __name__ == "__main__" block

Generate the complete Python implementation:`;

// Main generation functions
export async function generatePaper(provider, model, apiKey, title, description, onProgress) {
  if (!apiKey) {
    throw new Error(`API key required for ${provider}. Please add it in Settings.`);
  }

  const prompt = PAPER_PROMPT_TEMPLATE(title, description);

  try {
    let latexContent = '';
    
    onProgress?.('🔍 Analyzing research topic and methodology...');
    
    switch (provider) {
      case 'anthropic': {
        const client = getAnthropicClient(apiKey);
        onProgress?.('📋 Structuring paper sections with Claude...');
        
        const response = await client.messages.create({
          model: model || PROVIDERS.anthropic.defaultModel,
          max_tokens: 8192,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        });
        
        latexContent = response.content[0].text;
        break;
      }
      
      case 'openai': {
        const client = getOpenAIClient(apiKey);
        onProgress?.('✍️ Writing paper with GPT...');
        
        const requestParams = {
          model: model || PROVIDERS.openai.defaultModel,
          input: `System: You are an expert academic researcher and technical writer.\n\nUser: ${prompt}`,
          reasoning: { effort: 'medium' },
          text: { verbosity: 'medium' }
        };
        
        const response = await client.responses.create(requestParams);
        latexContent = response.output_text;
        break;
      }
      
      case 'google': {
        const ai = getGeminiClient(apiKey);
        onProgress?.('📝 Generating paper with Gemini...');
        
        const response = await ai.models.generateContent({
          model: model || PROVIDERS.google.defaultModel,
          contents: prompt
        });
        
        latexContent = response.text;
        break;
      }
      
      case 'xai': {
        const client = getOpenAIClient(apiKey, 'xai');
        onProgress?.('🚀 Creating paper with Grok...');
        
        const response = await client.chat.completions.create({
          model: model || PROVIDERS.xai.defaultModel,
          messages: [
            { role: 'system', content: 'You are an expert academic researcher and technical writer.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        });
        
        latexContent = response.choices[0].message.content;
        break;
      }
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    onProgress?.('✅ Research paper completed successfully!');
    return cleanLatex(latexContent);
    
  } catch (error) {
    console.error('Error generating paper:', error);
    throw new Error(`Failed to generate paper: ${error.message}`);
  }
}

export async function generatePythonCode(provider, model, apiKey, title, description, paperContent, onProgress) {
  if (!apiKey) {
    throw new Error(`API key required for ${provider}. Please add it in Settings.`);
  }

  const prompt = CODE_PROMPT_TEMPLATE(title, description, paperContent);

  try {
    let pythonCode = '';
    
    onProgress?.('💻 Generating experiment implementation...');
    
    switch (provider) {
      case 'anthropic': {
        const client = getAnthropicClient(apiKey);
        onProgress?.('⚙️ Implementing with Claude...');
        
        const response = await client.messages.create({
          model: model || PROVIDERS.anthropic.defaultModel,
          max_tokens: 8192,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        });
        
        pythonCode = response.content[0].text;
        break;
      }
      
      case 'openai': {
        const client = getOpenAIClient(apiKey);
        onProgress?.('🔧 Building code with GPT...');
        
        const requestParams = {
          model: model || PROVIDERS.openai.defaultModel,
          input: `System: You are an expert software engineer and AI researcher specializing in production-ready code.\n\nUser: ${prompt}`,
          reasoning: { effort: 'medium' },
          text: { verbosity: 'medium' }
        };
        
        const response = await client.responses.create(requestParams);
        pythonCode = response.output_text;
        break;
      }
      
      case 'google': {
        const ai = getGeminiClient(apiKey);
        onProgress?.('🛠️ Creating code with Gemini...');
        
        const response = await ai.models.generateContent({
          model: model || PROVIDERS.google.defaultModel,
          contents: prompt
        });
        
        pythonCode = response.text;
        break;
      }
      
      case 'xai': {
        const client = getOpenAIClient(apiKey, 'xai');
        onProgress?.('⚡ Implementing with Grok...');
        
        const response = await client.chat.completions.create({
          model: model || PROVIDERS.xai.defaultModel,
          messages: [
            { role: 'system', content: 'You are an expert software engineer and AI researcher specializing in production-ready code.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        });
        
        pythonCode = response.choices[0].message.content;
        break;
      }
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    onProgress?.('✅ Python code generated successfully!');
    return cleanPythonCode(pythonCode);
    
  } catch (error) {
    console.error('Error generating code:', error);
    throw new Error(`Failed to generate code: ${error.message}`);
  }
}

export async function chatWithAI(provider, model, apiKey, message, currentLatex, currentPython) {
  if (!apiKey) {
    throw new Error(`API key required for ${provider}. Please add it in Settings.`);
  }

  // Detect if user wants to edit paper or code
  const isCodeEdit = /code|python|implementation|experiment|script|function|class/i.test(message);
  
  let prompt;
  if (isCodeEdit && currentPython) {
    prompt = `You are an AI Agent helping to edit Python experiment code. The user wants to: "${message}".

Here is the current Python code:
${currentPython}

Respond ONLY with the complete modified Python code (no explanations, no markdown blocks).
Make sure the code is runnable and properly formatted.`;
  } else if (currentLatex) {
    prompt = `You are an AI Agent helping to edit a research paper. The user wants to: "${message}".

Here is the current LaTeX source:
${currentLatex}

If the user wants to modify the paper, respond ONLY with the complete modified LaTeX code (no explanations, no markdown blocks).
If the user asks a question, provide a helpful answer.

Critical formatting rules:
- Use \\section{} for numbered sections, \\section*{} for unnumbered
- Use \\subsection{} and \\subsection*{} appropriately
- Use \\begin{center}...\\end{center} for centering header content
- Use \\vspace{0.Xcm} for spacing between sections
- Use \\textbf{}, \\textit{} for formatting, \\Large for title size
- Use $math$ for inline and $$display math$$ for equations
- Keep the NeurIPS paper style with centered header
- NO \\documentclass, \\usepackage, \\begin{document}, \\maketitle commands`;
  } else {
    prompt = message;
  }

  try {
    let responseText = '';
    
    switch (provider) {
      case 'anthropic': {
        const client = getAnthropicClient(apiKey);
        const response = await client.messages.create({
          model: model || PROVIDERS.anthropic.defaultModel,
          max_tokens: 4096,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        });
        responseText = response.content[0].text;
        break;
      }
      
      case 'openai': {
        const client = getOpenAIClient(apiKey);
        
        const requestParams = {
          model: model || PROVIDERS.openai.defaultModel,
          input: `System: You are a helpful AI assistant for research paper editing.\n\nUser: ${prompt}`,
          reasoning: { effort: 'low' },
          text: { verbosity: 'low' }
        };
        
        const response = await client.responses.create(requestParams);
        responseText = response.output_text;
        break;
      }
      
      case 'google': {
        const ai = getGeminiClient(apiKey);
        
        const response = await ai.models.generateContent({
          model: model || PROVIDERS.google.defaultModel,
          contents: prompt
        });
        
        responseText = response.text;
        break;
      }
      
      case 'xai': {
        const client = getOpenAIClient(apiKey, 'xai');
        const response = await client.chat.completions.create({
          model: model || PROVIDERS.xai.defaultModel,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for research paper editing.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        });
        responseText = response.choices[0].message.content;
        break;
      }
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
    
    // Clean response if it's code or LaTeX
    if (responseText.includes('\\section') || responseText.includes('\\subsection')) {
      responseText = cleanLatex(responseText);
    } else if (responseText.includes('import ') || responseText.includes('def ')) {
      responseText = cleanPythonCode(responseText);
    }
    
    return responseText.trim();
    
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error(`Failed to process request: ${error.message}`);
  }
}

export { PROVIDERS };
