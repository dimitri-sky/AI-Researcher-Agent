# AI Research Paper Generator - Setup Guide

## 🚀 Features

This application generates comprehensive NeurIPS-style research papers with accompanying Python implementation code using state-of-the-art AI models.

### Supported AI Providers

1. **Anthropic (Claude)** - ⭐ Recommended for best code generation
   - Latest Model: `claude-sonnet-4-5`
   - Pre-filled on selection
   
2. **OpenAI (GPT)**
   - Latest Model: `gpt-5`
   - Supports advanced reasoning with GPT-5 models
   
3. **Google (Gemini)**
   - Latest Model: `gemini-2.5-pro`
   - High performance with long context
   
4. **xAI (Grok)**
   - Latest Model: `grok-4`
   - Compatible with OpenAI SDK format

## 🔑 Getting API Keys

### Anthropic (Claude)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Go to [API Keys](https://console.anthropic.com/settings/keys)
4. Create a new API key
5. Copy the key (starts with `sk-ant-api...`)

### OpenAI (GPT)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Create a new secret key
5. Copy the key (starts with `sk-...`)

### Google (Gemini)
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key"
4. Create a new API key
5. Copy the key

### xAI (Grok)
1. Visit [xAI Platform](https://console.x.ai/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key

## 📝 How to Use

### Initial Setup

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Open Settings**:
   - Click on the "Settings" section in the left panel
   - Expand "Model Selection"

3. **Choose your provider**:
   - Select your preferred AI provider (Anthropic recommended)
   - The latest model will be automatically pre-filled
   - You can customize the model name if needed

4. **Add your API key**:
   - Paste your API key in the API Key field
   - Click "Save" to store it locally in your browser
   - You'll see a green "Saved" indicator

### Latest Model Names (Pre-filled)

When you select a provider, the model field is automatically pre-filled with:
- **Anthropic**: `claude-sonnet-4-5`
- **OpenAI**: `gpt-5`
- **Google**: `gemini-2.5-pro`
- **xAI**: `grok-4`

You can edit these to use any model variant from the provider.

### Generating Papers

1. **Enter Research Topic**:
   - Fill in the research topic/title
   - Add focus and methodology description

2. **Generate Paper**:
   - Click "Generate Paper" or "Demo Paper" for a quick demo
   - If no API key is saved, you'll be prompted to add one

3. **Monitor Progress**:
   - The AI Agent chat will show real-time progress
   - Watch as the AI structures, writes, and implements your paper

4. **View Results**:
   - **Center Panel**: Preview the formatted paper or view LaTeX source
   - **Right Panel**: View and copy the Python implementation code

### Editing Papers

Use the AI Agent chat to:
- Modify specific sections: "Add more detail to the methodology section"
- Update equations: "Add a loss function equation in section 3"
- Enhance code: "Add data visualization to the Python code"
- Ask questions: "What datasets would work best for this approach?"

## 🔒 Security

- API keys are stored locally in your browser's localStorage
- Keys are never sent to any server except the respective AI provider
- Clear your browser data to remove stored keys

## ⚡ Tips

- **Best Results**: Use Anthropic's Claude for superior code generation
- **Demo Mode**: Click "Demo Paper" to see the system in action without entering your own topic
- **Real-time Progress**: Watch the AI Agent panel for step-by-step generation progress
- **Edit on the Fly**: Use the chat to modify papers and code after generation

## 🛠️ Troubleshooting

### "API Key Required" Warning
- Make sure you've entered and saved your API key in Settings
- Check that the key is correct for the selected provider

### Generation Errors
- Verify your API key is valid and has credits
- Check your internet connection
- Try switching to a different model or provider

### Rate Limits
- If you hit rate limits, wait a moment and try again
- Consider upgrading your API plan for higher limits

## 📚 Model Recommendations

- **Research Papers**: `claude-sonnet-4-5` (best overall quality and code generation)
- **Fast Generation**: `gemini-2.5-pro` (excellent speed and quality balance)
- **Advanced Reasoning**: `gpt-5` (superior reasoning capabilities)
- **Creative Content**: `grok-4` (innovative approaches)

## 🔧 Technical Notes

### API Request Specifications

The system uses the latest API formats for each provider:

- **Anthropic**: Messages API (`client.messages.create()`)
- **OpenAI**: Response API (`client.responses.create()`) with reasoning and verbosity controls
- **Google Gemini**: Models API (`ai.models.generateContent()`) with simplified interface
- **xAI Grok**: Chat Completions API (OpenAI-compatible) with custom base URL

### Model Name Format

You can use any valid model identifier:
- Full version names: `claude-sonnet-4-5`, `gpt-5-2025-08-07`
- Shortened names: `gpt-5`, `gemini-2.5-pro`
- Variant models: `gpt-4-turbo`, `claude-3-5-haiku-20241022`

The system will automatically use the correct API parameters for each model.
