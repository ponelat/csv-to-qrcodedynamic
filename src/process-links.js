// Links = [{name, link}]
export default async function processLinks(links, {
  updateStatus,
  api,
}) {

  return Promise.all(links.map(async (link) => {

    updateStatus(link.name, 'Creating Link...')
    const id = await api.createLink(link.name, link.link)
    updateStatus(link.name, `Link ${id}`)
    updateStatus(link.name, `Creating QR...`)
    const svgUrl = await api.createQr(id)
    updateStatus(link.name, `Created QR`)
    return svgUrl
  }))

}
