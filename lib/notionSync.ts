// ─── Notion Sync Layer (fire-and-forget) ─────────────────────────────────────
// Sends data to Notion API in background. If API is not configured or fails,
// data is still safe in IndexedDB — this never blocks the UI.

const NOTION_API_URL = import.meta.env.VITE_NOTION_API_URL || '';
const NOTION_API_TOKEN = import.meta.env.VITE_NOTION_API_TOKEN || '';

export async function syncToNotion(
  command: string,
  data: Record<string, unknown>
): Promise<boolean> {
  if (!NOTION_API_URL) return false; // API not configured, skip silently

  try {
    const res = await fetch(`${NOTION_API_URL}/api/notion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(NOTION_API_TOKEN ? { Authorization: `Bearer ${NOTION_API_TOKEN}` } : {}),
      },
      body: JSON.stringify({ command, params: data }),
    });
    return res.ok;
  } catch {
    return false; // Failed, but data is already in IndexedDB
  }
}
