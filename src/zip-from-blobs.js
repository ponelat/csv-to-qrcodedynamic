import * as zip from '@zip.js/zip.js'
import svgToJpeg from './svg-to-jpeg.js'

function corsProxy(url) {
  return `https://corsproxy.io/?${encodeURIComponent(url)}`
}

export async function downloadSvg(svgUrl) {
  const url = corsProxy(svgUrl)
  const response = await fetch(url);
  return await response.text();
}

// link = {name, svgUrl}
export default async function zipFromBlobs(url, name) {

  // Fetch the SVG content
  const svgText = await downloadSvg(url)

  // Convert SVG to JPEG
  const jpegBlob = await svgToJpeg(svgText, 2000, 2000);

  // Create a zip writer
  const writer = new zip.ZipWriter(new zip.BlobWriter('application/zip'));

  // Add the JPEG to the zip
  await writer.add(`${name}.jpeg`, new zip.BlobReader(jpegBlob));

  // Finalize the zip file and download
  const zipBlob = await writer.close();

  const link = document.createElement('a');

  link.href = URL.createObjectURL(zipBlob);
  link.download = 'images.zip';
  link.click();
}
