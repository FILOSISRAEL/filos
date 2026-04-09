import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json();

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const body = {
      system_instruction: {
        parts: [{ text: system }]
      },
      contents,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return NextResponse.json({ content: [{ text: 'שגיאה זמנית, נסה שוב בעוד רגע.' }] });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'לא קיבלתי תשובה.';

    return NextResponse.json({ content: [{ text }] });
  } catch (e: any) {
    console.error('Route error:', e);
    return NextResponse.json({ content: [{ text: 'שגיאה: ' + e.message }] }, { status: 500 });
  }
}