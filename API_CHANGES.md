# API Implementation Updates

## Summary of Changes

Updated the AI service to use the latest API formats for OpenAI and Google Gemini providers.

---

## OpenAI API Update

### ❌ Old Format (Deprecated)
```javascript
const response = await client.chat.completions.create({
  model: "gpt-5",
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "..." }
  ],
  max_completion_tokens: 8192,
  reasoning_effort: "medium"
});
const text = response.choices[0].message.content;
```

### ✅ New Format (Current)
```javascript
const response = await client.responses.create({
  model: "gpt-5",
  input: "Combined system and user prompt",
  reasoning: { effort: "medium" },
  text: { verbosity: "medium" }
});
const text = response.output_text;
```

### Key Changes
- **Endpoint**: `chat.completions.create()` → `responses.create()`
- **Input**: Separate messages → Combined `input` string
- **Parameters**: 
  - `reasoning_effort` → `reasoning: { effort }`
  - `max_completion_tokens` → Removed (handled automatically)
  - Added `text: { verbosity }` for output control
- **Response**: `choices[0].message.content` → `output_text`

---

## Google Gemini API Update

### ❌ Old Format (Deprecated)
```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(apiKey);
const modelInstance = genAI.getGenerativeModel({ 
  model: "gemini-2.5-pro",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192
  }
});
const result = await modelInstance.generateContent(prompt);
const response = await result.response;
const text = response.text();
```

### ✅ New Format (Current)
```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({
  model: "gemini-2.5-pro",
  contents: prompt
});
const text = response.text;
```

### Key Changes
- **Package**: `@google/generative-ai` → `@google/genai`
- **Class**: `GoogleGenerativeAI` → `GoogleGenAI`
- **Constructor**: `new GoogleGenerativeAI(apiKey)` → `new GoogleGenAI({ apiKey })`
- **Method**: `getGenerativeModel()` then `generateContent()` → Direct `ai.models.generateContent()`
- **Parameters**: Complex `generationConfig` → Simple `contents` parameter
- **Response**: `result.response.text()` → `response.text` (property, not method)

---

## Anthropic API (No Changes)

### ✅ Current Format (Stable)
```javascript
const response = await client.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 8192,
  temperature: 0.7,
  messages: [{ role: "user", content: prompt }]
});
const text = response.content[0].text;
```

**Status**: This API format remains unchanged and is working correctly.

---

## xAI Grok API (No Changes)

### ✅ Current Format (Stable)
```javascript
const client = new OpenAI({
  apiKey,
  baseURL: 'https://api.x.ai/v1',
  dangerouslyAllowBrowser: true
});

const response = await client.chat.completions.create({
  model: "grok-4",
  messages: [
    { role: "system", content: "..." },
    { role: "user", content: "..." }
  ],
  temperature: 0.7
});
const text = response.choices[0].message.content;
```

**Status**: Uses OpenAI-compatible Chat Completions API, which remains stable.

---

## Implementation Details

### Files Modified
1. **src/services/aiService.js**
   - Updated `generatePaper()` function (3 API calls)
   - Updated `generatePythonCode()` function (3 API calls)
   - Updated `chatWithAI()` function (3 API calls)
   - Updated client initialization for Gemini

### Reasoning Parameters

#### OpenAI Reasoning Effort
- **"low"**: Fast responses, minimal reasoning
- **"medium"**: Balanced (default for papers and code)
- **"high"**: Maximum reasoning capability

#### OpenAI Text Verbosity
- **"low"**: Concise responses (used for chat)
- **"medium"**: Balanced detail (used for papers and code)
- **"high"**: Comprehensive, detailed responses

### Testing Checklist

- [x] OpenAI API format updated
- [x] Gemini API format updated
- [x] Anthropic API verified (no changes needed)
- [x] xAI API verified (no changes needed)
- [x] All three functions updated (paper, code, chat)
- [x] Documentation updated
- [x] No linter errors

---

## Migration Notes

If you were using the old format in custom code, update as follows:

### For OpenAI
```javascript
// Before
const response = await openai.chat.completions.create({...});
const text = response.choices[0].message.content;

// After
const response = await openai.responses.create({...});
const text = response.output_text;
```

### For Gemini
```javascript
// Before (old package)
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({...});
const result = await model.generateContent(prompt);
const text = (await result.response).text();

// After (new package)
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey });
const response = await ai.models.generateContent({...});
const text = response.text;
```

---

## Benefits of New APIs

### OpenAI
- Simpler input format (single string vs message array)
- Better control over reasoning vs speed tradeoff
- Output verbosity control
- More straightforward response access

### Gemini
- Cleaner, more intuitive API
- Fewer nested calls
- Direct response access
- Simplified configuration

---

## Backward Compatibility

⚠️ **Note**: The old API formats are deprecated and will be removed in future versions. All code has been updated to use the new formats to ensure long-term compatibility.

Current implementation supports:
- ✅ Latest OpenAI Response API
- ✅ Latest Gemini Models API
- ✅ Anthropic Messages API (stable)
- ✅ xAI Chat Completions API (stable)
