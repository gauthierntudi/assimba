export function downloadCardFromUrl(url: string, filename = 'carte-simba.png'): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function fetchAndDownloadCard(
  params: { token?: string; order?: string; fanId?: string },
  filename = 'carte-simba.png',
): Promise<void> {
  if (params.fanId) {
    const response = await fetch('/api/cards/download-by-fan-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fanId: params.fanId }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      throw new Error(payload?.message ?? 'Impossible de télécharger la carte.');
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    downloadCardFromUrl(objectUrl, filename);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return;
  }

  const search = new URLSearchParams();
  if (params.token) {
    search.set('token', params.token);
  }
  if (params.order) {
    search.set('order', params.order);
  }

  const response = await fetch(`/api/cards/download?${search.toString()}`);
  if (!response.ok) {
    throw new Error('Impossible de télécharger la carte.');
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  downloadCardFromUrl(objectUrl, filename);

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function buildCardDownloadUrl(params: { token?: string; order?: string }): string {
  const search = new URLSearchParams();
  if (params.token) {
    search.set('token', params.token);
  }
  if (params.order) {
    search.set('order', params.order);
  }

  return `/api/cards/download?${search.toString()}`;
}
