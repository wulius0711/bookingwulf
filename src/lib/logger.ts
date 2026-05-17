const AXIOM_TOKEN = process.env.AXIOM_TOKEN;
const AXIOM_DATASET = 'bookingwulf-logs';
const AXIOM_URL = `https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/ingest`;

export function log(event: string, data: Record<string, unknown> = {}) {
  const entry = { _time: new Date().toISOString(), event, ...data };
  console.log(JSON.stringify(entry));
  if (!AXIOM_TOKEN) return;
  fetch(AXIOM_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${AXIOM_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([entry]),
  }).catch(() => {});
}
