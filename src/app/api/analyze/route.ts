import { NextRequest, NextResponse } from 'next/server';

// Multiple API keys for rotation (each project has its own quota)
const API_KEYS = [
  process.env.GOOGLE_API_KEY,
  process.env.GOOGLE_API_KEY_2,
  process.env.GOOGLE_API_KEY_3,
].filter(Boolean) as string[];

async function tryAnalyze(apiKey: string, base64: string, mediaType: string) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inlineData: {
              mimeType: mediaType,
              data: base64
            }
          },
          {
            text: `Analyze this receipt image and extract:
1. The total/final amount paid (just the number, no currency symbol)
2. A short description of what was purchased (in English, max 5 words, e.g. "Gas station", "Toll fare", "Restaurant", "Uber ride")

Respond ONLY with a JSON object like: {"value": "149.69", "desc": "Gas station"}
Use a period as decimal separator. If you cannot read the value, use "0".`
          }
        ]
      }]
    })
  });

  return res;
}

export async function POST(request: NextRequest) {
  try {
    const { base64, mediaType } = await request.json();

    if (API_KEYS.length === 0) {
      return NextResponse.json({ error: 'No API keys configured' }, { status: 500 });
    }

    let lastError = null;

    // Try each API key until one works
    for (const apiKey of API_KEYS) {
      try {
        const res = await tryAnalyze(apiKey, base64, mediaType);
        const data = await res.json();

        // If quota exceeded (429), try next key
        if (res.status === 429) {
          console.log('Quota exceeded, trying next key...');
          lastError = data;
          continue;
        }

        if (!res.ok) {
          console.error('Gemini API error:', data);
          lastError = data;
          continue;
        }

        // Success! Parse the response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        
        try {
          const clean = text.replace(/```json|```/g, '').trim();
          const result = JSON.parse(clean);
          return NextResponse.json(result);
        } catch {
          return NextResponse.json({ value: '0', desc: 'Receipt' });
        }
      } catch (err) {
        console.error('Error with key:', err);
        lastError = err;
        continue;
      }
    }

    // All keys failed
    return NextResponse.json({ 
      error: 'All API keys exhausted', 
      details: lastError 
    }, { status: 429 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
