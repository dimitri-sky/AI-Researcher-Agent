# AI Model Reference Guide

## Latest Model Configurations

### Anthropic (Claude) ⭐ Recommended

**Latest Model**: `claude-sonnet-4-5`

**API Configuration**:
```javascript
{
  model: "claude-sonnet-4-5",
  max_tokens: 8192,
  temperature: 0.7,
  messages: [{ role: "user", content: "..." }]
}
```

**Features**:
- Superior code generation
- Excellent reasoning
- Long context window
- Fast response times

**Use Cases**: Research papers, code implementation, technical writing

---

### OpenAI (GPT)

**Latest Model**: `gpt-5`

**API Configuration** (New Response API):
```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5",
  input: "Your prompt here...",
  reasoning: { effort: "medium" },
  text: { verbosity: "medium" }
});

console.log(response.output_text);
```

**Parameters**:
- `input`: Combined system + user prompt
- `reasoning.effort`: "low" | "medium" | "high"
- `text.verbosity`: "low" | "medium" | "high"

**Features**:
- Advanced reasoning (GPT-5)
- Versatile capabilities
- Strong at following instructions

**Use Cases**: Complex reasoning, creative writing, general research

---

### Google (Gemini)

**Latest Model**: `gemini-2.5-pro`

**API Configuration** (New Models API):
```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "your-api-key" });

const response = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: "Your prompt here..."
});

console.log(response.text);
```

**Parameters**:
- `model`: Model identifier
- `contents`: Prompt text (string)

**Features**:
- Excellent speed/quality balance
- Long context support
- Efficient token usage

**Use Cases**: Fast generation, large documents, cost-effective research

---

### xAI (Grok)

**Latest Model**: `grok-4`

**API Configuration**:
```javascript
// Uses OpenAI-compatible format with custom base URL
{
  baseURL: "https://api.x.ai/v1",
  model: "grok-4",
  max_tokens: 8192,
  temperature: 0.7,
  messages: [...]
}
```

**Features**:
- Innovative reasoning
- Real-time knowledge
- Creative approaches

**Use Cases**: Creative content, innovative solutions, exploratory research

---

## Model Selection Tips

### For Academic Papers
1. **First Choice**: `claude-sonnet-4-5` - Best overall quality
2. **Alternative**: `gpt-5` - Strong reasoning
3. **Fast Option**: `gemini-2.5-pro` - Speed + quality

### For Code Implementation
1. **First Choice**: `claude-sonnet-4-5` - Superior code generation
2. **Alternative**: `gpt-5` - Good architectural decisions
3. **Fast Option**: `gemini-2.5-pro` - Quick prototyping

### For Editing/Refinement
- Any model works well
- Use the same model that generated the original content for consistency
- `claude-sonnet-4-5` for technical accuracy

### For Creative/Exploratory Work
1. **First Choice**: `grok-4` - Innovative approaches
2. **Alternative**: `gpt-5` - Creative reasoning
3. **Balanced**: `claude-sonnet-4-5` - Quality + creativity

---

## Parameter Optimization

### Temperature Settings

- **0.3-0.5**: Highly focused, deterministic outputs (technical accuracy)
- **0.7**: Balanced creativity and consistency (default, recommended)
- **0.8-1.0**: More creative and varied outputs (exploratory work)

### Token Limits

- **Research Papers**: 8192 tokens (comprehensive content)
- **Code Implementation**: 8192 tokens (complete implementations)
- **Chat/Editing**: 4096 tokens (sufficient for modifications)

---

## Model Name Variants

### Anthropic
- `claude-sonnet-4-5` (latest)
- `claude-3-5-sonnet-20241022` (dated version)
- `claude-3-5-haiku-20241022` (faster, lighter)

### OpenAI
- `gpt-5` (latest GPT-5)
- `gpt-5-2025-08-07` (specific dated version)
- `gpt-4o` (GPT-4 optimized)
- `gpt-4-turbo` (GPT-4 turbo)
- `gpt-4o-mini` (smaller, faster)

### Google
- `gemini-2.5-pro` (latest pro)
- `gemini-2.0-flash-exp` (experimental flash)
- `gemini-1.5-pro` (previous generation)

### xAI
- `grok-4` (latest)
- `grok-2` (previous generation)
- `grok-2-mini` (lighter version)

---

## API Key Permissions

Make sure your API keys have the following permissions:

- **Anthropic**: Messages API access
- **OpenAI**: Chat Completions API access
- **Google**: Generative AI API enabled
- **xAI**: API access enabled

---

## Rate Limits & Pricing

Contact each provider for current rate limits and pricing:

- **Anthropic**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/
- **Google**: https://aistudio.google.com/
- **xAI**: https://console.x.ai/

---

## Troubleshooting Model Issues

### "Invalid model name" Error
- Check the exact model identifier
- Verify the model is available in your region
- Ensure your API key has access to the model

### "Rate limit exceeded" Error
- Wait and retry
- Upgrade your API plan
- Switch to a different provider temporarily

### "Context length exceeded" Error
- Reduce input text length
- Use a model with larger context window
- Break content into smaller chunks

---

## System Requirements

All models require:
- Valid API key
- Active internet connection
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled

No additional software installation required!

---

## 🔧 Implementation Details

### API Formats Used

The application uses the latest API formats for each provider:

#### OpenAI - Response API
```javascript
const response = await client.responses.create({
  model: "gpt-5",
  input: "Combined system and user prompt",
  reasoning: { effort: "medium" },
  text: { verbosity: "medium" }
});
// Access: response.output_text
```

#### Anthropic - Messages API
```javascript
const response = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 8192,
  messages: [{ role: "user", content: "prompt" }]
});
// Access: response.content[0].text
```

#### Google - Models API
```javascript
const response = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: "prompt"
});
// Access: response.text
```

#### xAI - Chat Completions API
```javascript
const response = await client.chat.completions.create({
  model: "grok-4",
  messages: [
    { role: "system", content: "system prompt" },
    { role: "user", content: "user prompt" }
  ]
});
// Access: response.choices[0].message.content
```
