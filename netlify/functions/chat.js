// AI-resepsjonist for norwegianai.pro — kjører som Netlify Function.
// Krever miljøvariabelen OPENAI_API_KEY satt i Netlify (Site settings → Environment variables).

const SYSTEM_PROMPT = `Du er en vennlig og profesjonell AI-resepsjonist for NorwegianAI Pro. Vi hjelper norske småbedrifter med AI-automatisering.

Dine oppgaver:
- Svar alltid på norsk
- Hjelp besøkende med spørsmål om tjenestene våre
- Oppmuntre dem til å booke en gratis strategisamtale
- Hold svarene korte (maks 3 setninger)
- Vær varm og profesjonell

Vi tilbyr: AI-resepsjonist, automatisk tilbudsgenerering, lead-chatbot, e-postautomatisering. Priser fra 15 000 kr. Gratis strategisamtale bookes via knappene på siden, eller på https://cal.com/bjørn-milliam-pedersen-jvalby/strategisamtale`;

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'https://norwegianai.pro',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let message;
  try {
    message = (JSON.parse(event.body || '{}').message || '').trim();
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }
  if (!message || message.length > 1000) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Message missing or too long' }) };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: 'Chatboten er ikke helt klar ennå. Send oss en e-post på hei@norwegianaipro.no, så svarer vi deg raskt!' }),
    };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content
      || 'Takk for meldingen! Book gjerne en gratis strategisamtale via knappen øverst på siden.';

    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };
  } catch (err) {
    console.error('Chat function error:', err);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: 'Beklager, noe gikk galt hos oss. Send oss gjerne en e-post på hei@norwegianaipro.no!' }),
    };
  }
};
