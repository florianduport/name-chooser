export type ShareImageFormat = 'story' | 'square';

const DIMENSIONS: Record<ShareImageFormat, [number, number]> = {
  story: [1080, 1920],
  square: [1080, 1080],
};

export async function createResultImage(
  winner: string,
  format: ShareImageFormat,
): Promise<File> {
  const [width, height] = DIMENSIONS[format];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');

  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#fff8ed');
  background.addColorStop(0.52, '#f9eee7');
  background.addColorStop(1, '#e4f4fa');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.globalAlpha = 0.65;
  context.fillStyle = '#f7cbd2';
  context.beginPath();
  context.arc(width * 0.9, height * 0.08, width * 0.32, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#ccecf5';
  context.beginPath();
  context.arc(width * 0.08, height * 0.9, width * 0.38, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  const cardWidth = width - 144;
  const cardHeight = format === 'story' ? 900 : 700;
  const cardX = 72;
  const cardY = (height - cardHeight) / 2;
  roundedRect(context, cardX, cardY, cardWidth, cardHeight, 52);
  context.fillStyle = 'rgba(255,255,255,0.88)';
  context.fill();

  context.textAlign = 'center';
  context.fillStyle = '#b45309';
  context.font = '600 88px Arial, sans-serif';
  context.fillText('♕', width / 2, cardY + 155);

  context.fillStyle = '#78716c';
  context.font = '600 30px Arial, sans-serif';
  context.letterSpacing = '6px';
  context.fillText('MON PRÉNOM FAVORI', width / 2, cardY + 245);
  context.letterSpacing = '0px';

  context.fillStyle = '#1c1917';
  const fontSize = winner.length > 18 ? 92 : winner.length > 10 ? 116 : 144;
  context.font = `600 ${fontSize}px Georgia, serif`;
  drawWrappedText(context, winner, width / 2, cardY + 430, cardWidth - 100, fontSize * 1.08);

  context.fillStyle = '#57534e';
  context.font = '400 34px Arial, sans-serif';
  context.fillText('Un tournoi, un favori.', width / 2, cardY + cardHeight - 190);

  context.fillStyle = '#1c1917';
  context.font = '600 30px Arial, sans-serif';
  context.fillText('LeBabyName', width / 2, cardY + cardHeight - 105);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => value ? resolve(value) : reject(new Error('Image generation failed')),
      'image/png',
      1,
    );
  });
  return new File(
    [blob],
    `lebabyname-${winner.toLocaleLowerCase('fr').replace(/[^a-z0-9]+/gi, '-')}-${format}.png`,
    { type: 'image/png' },
  );
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((value, index) => context.fillText(value, x, startY + index * lineHeight));
}
