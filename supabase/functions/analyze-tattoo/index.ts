const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface AnalysisRequest {
  imageBase64?: string;
  imageUrl?: string;
  mediaType?: string;
  style: string;
  sizeCm: number;
  bodyArea: string;
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return Response.json({ error: 'Método no permitido.' }, { status: 405, headers: corsHeaders });
  }

  const authorization = request.headers.get('Authorization') ?? request.headers.get('authorization');
  if (!authorization) {
    return Response.json({ error: 'Inicia sesión para cotizar.' }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!supabaseUrl || !anonKey || !openAiKey) {
    console.error('Missing Supabase/OpenAI env vars for analyze-tattoo');
    return Response.json({ error: 'La función de análisis no está configurada en el servidor.' }, { status: 503, headers: corsHeaders });
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: authorization }
  });
  if (!authResponse.ok) {
    const authError = await authResponse.text();
    console.error('Supabase auth validation failed for analyze-tattoo:', authResponse.status, authError);
    return Response.json({ error: 'La sesión no es válida.' }, { status: 401, headers: corsHeaders });
  }

  let input: AnalysisRequest;
  try {
    input = await request.json() as AnalysisRequest;
  } catch {
    return Response.json({ error: 'La solicitud de análisis no es válida.' }, { status: 400, headers: corsHeaders });
  }

  const hasImage = typeof input.imageBase64 === 'string' || typeof input.imageUrl === 'string';
  if (!hasImage || !Number.isFinite(input.sizeCm) || input.sizeCm < 5 || input.sizeCm > 40) {
    return Response.json({ error: 'Incluye una imagen válida y un tamaño entre 5 y 40 cm.' }, { status: 400, headers: corsHeaders });
  }
  if (input.imageBase64 && input.imageBase64.length > 7_000_000) {
    return Response.json({ error: 'La imagen supera el tamaño admitido para analizar.' }, { status: 413, headers: corsHeaders });
  }
  if (input.imageUrl && !/^https:\/\/(images\.unsplash\.com|[^/]+\.supabase\.co\/storage\/v1\/object\/public\/tattoo-catalog)\//i.test(input.imageUrl)) {
    return Response.json({ error: 'La imagen del catálogo no proviene de una fuente admitida.' }, { status: 400, headers: corsHeaders });
  }

  const imageUrl = input.imageBase64
    ? `data:${input.mediaType || 'image/jpeg'};base64,${input.imageBase64}`
    : input.imageUrl as string;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Analiza solo el diseño de tatuaje de la imagen. Devuelve JSON con: style (texto breve), colors (lista de colores dominantes), lineDetail (simple|medio|alto), shading (ninguno|medio|alto), complexity (simple|media|alta|muy_alta), elements (lista breve de elementos visibles) y explanation (resumen breve). No inventes tamaño corporal ni detalles que no se vean. La cotización es orientativa.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Estilo indicado: ${input.style || 'sin indicar'}. Tamaño: ${input.sizeCm} cm. Zona: ${input.bodyArea}.` },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } }
          ]
        }
      ],
      max_tokens: 350
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('OpenAI tattoo analysis failed:', response.status, detail);
    return Response.json({ error: 'No se pudo analizar la imagen. Inténtalo nuevamente.' }, { status: 502, headers: corsHeaders });
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    return Response.json({ error: 'El servicio de análisis devolvió una respuesta vacía.' }, { status: 502, headers: corsHeaders });
  }

  try {
    const analysis = JSON.parse(content) as Record<string, unknown>;
    const lineDetail = ['simple', 'medio', 'alto'].includes(String(analysis.lineDetail)) ? analysis.lineDetail : 'medio';
    const shading = ['ninguno', 'medio', 'alto'].includes(String(analysis.shading)) ? analysis.shading : 'medio';
    const complexity = ['simple', 'media', 'alta', 'muy_alta'].includes(String(analysis.complexity)) ? analysis.complexity : 'media';
    const colors = Array.isArray(analysis.colors) ? analysis.colors.filter((value): value is string => typeof value === 'string').slice(0, 6) : [];
    const elements = Array.isArray(analysis.elements) ? analysis.elements.filter((value): value is string => typeof value === 'string').slice(0, 6) : [];

    return Response.json({
      style: typeof analysis.style === 'string' ? analysis.style.slice(0, 80) : '',
      colors,
      lineDetail,
      shading,
      complexity,
      elements,
      explanation: typeof analysis.explanation === 'string' ? analysis.explanation.slice(0, 300) : ''
    }, { headers: corsHeaders });
  } catch {
    return Response.json({ error: 'No se pudo interpretar el análisis de la imagen.' }, { status: 502, headers: corsHeaders });
  }
});
