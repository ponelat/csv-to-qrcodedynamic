import promiseBatch from './promise-batch.js'

const BATCH_SIZE = 1

// const exampleQr = {
//   name:  'Car01',
//   svgUrl:  'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg'
// }

// Links = [{name, link}]

export default async function executeUpdate(links, {
  updateStatus,
  updateError,
  setProgress,
  api,
}) {

  // Create a zip writer
  let linksUpdated = 0
  const totalLinks = links.length
  let failedLinks = 0
  const updateProgress = () => {
    setProgress(`Progress: ${linksUpdated + failedLinks}/${totalLinks} processed. Failed: ${failedLinks}`)
  }

  updateProgress()
  await promiseBatch(links, (async (link) => {
    try {
      
      updateStatus(link.link_id, 'Updating Link...', link)
      const res = await api.updateLink(link.link_id, link)
      updateStatus(link.link_id, `Link updated`)

      updateProgress()
    } catch(error) {
      failedLinks++
      updateProgress()
      updateError(link.link_id, error.message, error)
    }
  }), BATCH_SIZE)


  updateProgress()
}
