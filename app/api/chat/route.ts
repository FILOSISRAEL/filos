import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        temperature: 0.5,
        messages: [
          { role: 'system', content: system },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq error:', err);
      return NextResponse.json({ content: [{ text: 'שגיאה זמנית, נסה שוב.' }] });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'לא קיבלתי תשובה.';
    return NextResponse.json({ content: [{ text }] });
  } catch (e: any) {
    console.error('Route error:', e);
    return NextResponse.json({ content: [{ text: 'שגיאה: ' + e.message }] }, { status: 500 });
  }
}