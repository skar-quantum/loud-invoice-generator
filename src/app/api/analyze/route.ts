import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { base64, mediaType } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: `Analyze this receipt image and extract:
1. The total/final amount paid (just the number, no currency symbol)
2. A short description of what was purchased (in English, max 5 words, e.g. "Gas station", "Toll fare", "Restaurant", "Uber ride")

Respond ONLY with a JSON object like: {"value": "149.69", "desc": "Gas station"}
Use a period as decimal separator. If you cannot read the value, use "0".` }
          ]
        }]
      })
    });

    const data = await res.json();
    
    if (!res.ok) {
      console.error('Anthropic API error:', data);
      return NextResponse.json({ error: 'API error', details: data }, { status: res.status });
    }

    const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '{}';
    
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
