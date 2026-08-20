import html2canvas from 'html2canvas';

export async function generateShareCard(element: HTMLElement): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#050508',
    useCORS: true,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = 'my-chronos.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function formatToday(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
