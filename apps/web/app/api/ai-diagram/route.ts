import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

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

  const apiKey = (userApiKey as string | undefined)?.trim() || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No API key provided. Enter your Anthropic API key in the AI modal." },
      { status: 500 }
    );
  }
  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const systemPrompt = mode === "flowchart" ? FLOWCHART_SYSTEM : DIAGRAM_SYSTEM;

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        { role: "user", content: `Generate a ${mode} for: ${prompt}` },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock?.type === "text" ? textBlock.text : "";

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
  } catch (err: unknown) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Invalid Anthropic API key" }, { status: 401 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited — try again shortly" }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI request failed" },
      { status: 500 }
    );
  }
}
