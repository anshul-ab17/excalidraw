import { NextRequest, NextResponse } from "next/server";

const DIAGRAM_SYSTEM = `You are a diagram generator. Given a description, output a JSON array of shape elements.

Each element has this shape:
{
  "type": "rectangle" | "ellipse" | "diamond" | "line" | "arrow" | "text",
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "label": string (optional — adds centered text inside the shape),
  "strokeColor": "#hex" (default "#1e1e1e"),
  "backgroundColor": "#hex" | "transparent" (default "transparent")
}

Rules:
- Start shapes at x=200, y=80 and work downward/rightward with 80px spacing
- Keep the whole diagram within roughly 900×700 px
- arrows/lines: width/height = direction vector (down 80px → width:0, height:80)
- Return ONLY a valid JSON array. No markdown fences, no explanation.`;

const FLOWCHART_SYSTEM = `You are a flowchart generator. Given a process description, output a JSON array of flowchart elements.

Each element has this shape:
{
  "type": "rectangle" | "ellipse" | "diamond" | "arrow",
  "x": number,
  "y": number,
  "width": number,
  "height": number,
  "label": string (the node's label text),
  "strokeColor": "#hex",
  "backgroundColor": "#hex" | "transparent"
}

Flowchart conventions:
- Ellipse for Start and End nodes (green bg #b2f2bb for start, red bg #ffc9c9 for end)
- Rectangle for process steps (light blue bg #a5d8ff)
- Diamond for decisions (yellow bg #ffec99, width:120 height:80)
- Arrow elements to connect nodes (width/height = direction vector)
- Lay the flowchart top-to-bottom starting at x=300, y=60
- Each step ~120px tall, arrows ~40px
- For decisions, add YES/NO text labels as separate text elements on the branch arrows
- Keep within roughly 800×900 px
- Return ONLY a valid JSON array. No markdown fences, no explanation.`;

export async function POST(req: NextRequest) {
  const { prompt, mode, userApiKey } = await req.json();

  const apiKey = (userApiKey as string | undefined)?.trim() || process.env.API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key provided. Enter your OpenRouter key in the AI modal." },
      { status: 500 }
    );
  }
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const systemPrompt = mode === "flowchart" ? FLOWCHART_SYSTEM : DIAGRAM_SYSTEM;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
        "X-Title": "Canvas App",
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4-5",
        max_tokens: 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a ${mode} for: ${prompt}` },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `OpenRouter error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";

    // Strip possible markdown fences
    const raw = text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    try {
      const elements = JSON.parse(raw);
      return NextResponse.json({ elements });
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: text },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "AI request failed" },
      { status: 500 }
    );
  }
}
