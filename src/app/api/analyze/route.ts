import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64, mediaType } = await request.json();

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

    const data = await res.json();
    
    if (!res.ok) {
      console.error('Gemini API error:', data);
      return NextResponse.json({ error: 'API error', details: data }, { status: res.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const result = JSON.parse(clean);
      return NextResponse.json(result);
    } catch {
      return NextResponse.json({ value: '0', desc: 'Receipt' });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
