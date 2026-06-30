// AI service - uses Gemini API or local simulator
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const PERSONA_PROMPTS = {
  general: 'You are IntelliChat, a helpful and knowledgeable AI assistant. Be concise, accurate, and friendly.',
  teacher: 'You are an expert teacher. Break down complex concepts into simple explanations with examples.',
  interviewer: 'You are an experienced technical interviewer. Ask DSA, system design, and behavioral questions.',
  debugger: 'You are an expert code reviewer. Analyze code, find bugs, and suggest optimizations.',
  mentor: 'You are a seasoned tech mentor. Give career advice and guide professional growth.'
};

export async function generateAIResponse(message, persona = 'general', history = []) {
  if (GEMINI_API_KEY) {
    try {
      return await callGeminiAPI(message, persona, history);
    } catch (err) {
      console.error('Gemini API error:', err.message);
    }
  }
  return localSimulator(message, persona);
}

async function callGeminiAPI(message, persona, history) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
  const systemPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.general;
  const contents = [
    ...history.slice(-8).map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    { role: 'user', parts: [{ text: message }] }
  ];
  const body = { contents, systemInstruction: { parts: [{ text: systemPrompt }] } };
  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not generate a response.';
}

function localSimulator(message, persona) {
  const lower = message.toLowerCase();
  if (lower.includes('code') || lower.includes('function') || lower.includes('bug')) {
    return `Here is the solution:\n\n\`\`\`javascript\nfunction optimizedSolution(input) {\n  // Validate input\n  if (!Array.isArray(input)) throw new Error('Expected array');\n  \n  // O(n) solution using hash map\n  const seen = new Map();\n  for (const [i, val] of input.entries()) {\n    if (seen.has(val)) return [seen.get(val), i];\n    seen.set(val, i);\n  }\n  return [];\n}\n\`\`\`\n\n**Complexity**: O(n) time, O(n) space — optimal solution!`;
  }
  const responses = [
    `Based on your query about "${message.slice(0, 30)}...", here is my analysis:\n\n1. **Key Insight**: This is a common problem with well-established solutions\n2. **Approach**: Start with the simplest solution, then optimize\n3. **Best Practice**: Always consider edge cases\n\nWould you like me to elaborate?`,
    `Great question! Here is a detailed response:\n\n## Analysis\n\nThe topic you are asking about is fundamental in software engineering.\n\n### Key Points\n- Consider time and space complexity\n- Think about scalability\n- Follow SOLID principles\n\nLet me know if you need more details!`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
