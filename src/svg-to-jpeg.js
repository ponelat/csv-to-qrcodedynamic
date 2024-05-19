export default async function svgToJpeg(svgText, width, height) {
  // Create an off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Create an image element
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svgText);

  // Wait for the image to load
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Failed to convert SVG to JPEG'))
  });

  // Draw the SVG onto the canvas
  ctx.drawImage(img, 0, 0, width, height);

  // Convert the canvas to a JPEG Blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg');
  });
}
