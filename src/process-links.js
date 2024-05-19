import svgToJpeg from './svg-to-jpeg.js'
import * as zip from '@zip.js/zip.js'
import promiseBatch from './promise-batch.js'

const BATCH_SIZE = 5

// const exampleQr = {
//   name:  'Car01',
//   svgUrl:  'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg'
// }

// Links = [{name, link}]

function triggerDownloadFromBlob(blob, name) {
  const link = document.createElement('a');
  let objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl
  link.download = name;
  link.click();
  URL.revokeObjectURL(objectUrl)
}

export default async function processLinks(links, {
  updateStatus,
  updateError,
  api,
}) {

  // Create a zip writer
  const writer = new zip.ZipWriter(new zip.BlobWriter('application/zip'));
  let numberOfFiles = 0

  await promiseBatch(links, (async (link) => {
    try {
      
      updateStatus(link.name, 'Creating Link...', link.link)
      const linkId = (await api.createLink(link.name, link.link)).id

      updateStatus(link.name, `Getting Link...`, `Link ID: ${linkId}`)
      const linkUrlAlias = (await api.getLink(linkId)).url // This should be the same as `link.name`. But doing this for completness.
      const dynamicUrl = `https://qrcodedynamic.com/${linkUrlAlias}`

      updateStatus(link.name, `Creating QR...`, `Link ID: ${linkId}`, dynamicUrl)
      const qrId = (await api.createQr(link.name, dynamicUrl, linkId)).id

      updateStatus(link.name, `Getting QR SVG...`, `QR ID: ${qrId}`)
      const svgUrl = (await api.getQr(qrId)).qr_code

      updateStatus(link.name, `Downloading SVG`, `SVG URL: ${svgUrl}`)
      const svgText = await api.downloadSvg(svgUrl)

      updateStatus(link.name, `Converting to JPG`, `SVG Length: $}svgText.length}`)
      const jpegBlob = await svgToJpeg(svgText, 2000, 2000);

      const filename = `${link.name}.jpeg`
      updateStatus(link.name, `Adding to .zip`, filename, `Size: ${jpegBlob.size}`)
      await writer.add(filename, new zip.BlobReader(jpegBlob));
      numberOfFiles++

      updateStatus(link.name, `Added to .zip`)
    } catch(error) {
      updateError(link.name, error.message, error)
    }
  }), BATCH_SIZE)

  // Finalize the zip file and download
  const zipBlob = await writer.close();
  const qrFilename = `QRCodes__${currentDateStr()}__${numberOfFiles}xQRs.zip`
  if(numberOfFiles > 0) {
    triggerDownloadFromBlob(zipBlob, qrFilename)
  } else {
    alert('No files were zipped')
  }
}

function currentDateStr() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const z = date.toTimeString().split(' ')[1];

    return `${yyyy}_${mm}_${dd}_T_${hh}_${min}_${z}`;
}
