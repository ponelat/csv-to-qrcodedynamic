function corsProxy(url) {
  return `https://corsproxy.io/?${encodeURIComponent(url)}`
}

export default async function downloadSvg(svgUrl) {
  const url = corsProxy(svgUrl)
  const response = await fetch(url);
  return await response.text();
}
