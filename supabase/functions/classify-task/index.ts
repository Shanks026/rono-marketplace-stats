import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { raw_input, goals, portals } = await req.json()

    const goalsText = goals
      .map((g: any, i: number) => `Goal ${i + 1} [id: ${g.id}]: ${g.title} - ${g.description}`)
      .join('\n')

    const portalsText = portals
      .map((p: any) => `[id: ${p.id}] ${p.label}`)
      .join(', ')

    const prompt = `You are a task classifier for a software engineer. Return ONLY a raw JSON object with no markdown, no explanation.

Portals: ${portalsText}

Goals:
${goalsText}

Status rules: use "todo" if the task hasn't started yet (default), "in_progress" if actively being worked on, "completed" if clearly done, "blocked" if waiting on something external, "pending" if deferred. Default to "todo".

Return this exact JSON shape:
{"summary":"string","goal_ids":["uuid"],"confidence":[0.9],"portal_id":"uuid or null","task_type":"bugfix|feature|review|support|process|learning|other","effort_hours":1.0,"jira_ref":"string or null","status":"todo|in_progress|completed|pending|blocked"}

Task: ${raw_input}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Gemini error: ${JSON.stringify(data.error)}`)
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!text) throw new Error(`Empty response: ${JSON.stringify(data)}`)

    const clean = text.replace(/^```json\n?|^```\n?|\n?```$/g, '').trim()

    return new Response(clean, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
