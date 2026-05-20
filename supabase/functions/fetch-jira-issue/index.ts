import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { issueKey } = await req.json()
    if (!issueKey) {
      return new Response(JSON.stringify({ error: 'issueKey is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const email = Deno.env.get('JIRA_EMAIL')
    const token = Deno.env.get('JIRA_API_TOKEN')
    const baseUrl = Deno.env.get('JIRA_BASE_URL')

    const credentials = btoa(`${email}:${token}`)
    const url = `${baseUrl}/rest/api/3/issue/${issueKey}?fields=summary,issuetype,status,assignee,description`

    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return new Response(JSON.stringify({ error: `Jira API error: ${res.status}`, detail: text }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({
        key: data.key,
        summary: data.fields?.summary ?? '',
        issueType: data.fields?.issuetype?.name ?? '',
        status: data.fields?.status?.name ?? '',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}, { verify_jwt: false })
