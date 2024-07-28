const EXAMPLE_SVG = 'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const THROTTLE = 2200

const API_BASE = 'https://qrcodedynamic.com/api'
// const API_BASE = 'https://httpbin.org/anything'

export default function createApi(apiKey, proxyBase) {

  // To (optionally) bypass CORS issues
  const proxyUrl = (url) => {
    if(!proxyBase) {
      return url
    }
    return `${proxyBase}${encodeURIComponent(url)}`
  }
  const apiUrl = (url) => proxyUrl(API_BASE + url)

  const delayedFetch = async (url, config) => {
    const req = fetch(url, config)
    await Promise.all([req, delay(THROTTLE)])
    return req
  }

  const postApi = async function(url, data) {
    const formData  = new FormData();
    for(const name in data) {
      formData.append(name, data[name]);
    }
    return delayedFetch(apiUrl(url), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    }).then(fetchError)
  }

  const getApi = async function(url) {
    return delayedFetch(apiUrl(url), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }).then(fetchError)
  }

  ///// API...

  return {

    async createLink(name, link) {
      const json = await postApi('/links', {
        url: name,
        location_url: link,
      })
      return {id: json.data.id}

      // return new Promise((resolve) => {
      // 	setTimeout(() => resolve({id: 123}), 3000)
      // })
    },

    async createQr(name, link, linkId) {
      const json = await postApi('/qr-codes', {
        name,
        link_id: linkId,
        url: link,
        type: 'url',
        size: 2000
      })
      return {id: json.data.id}
      // return new Promise((resolve) => {
      // 	setTimeout(() => resolve({ id: 345 }), 2000)
      // })
    },

    async updateLink(link_id, link) {
      const json = await postApi(`/links/${link_id}`, {
        ...link
      })
      return {id: json.data.id}

      // return new Promise((resolve) => {
      // 	setTimeout(() => resolve(
      //     { id: link_id, link }), 2000)
      // })
    },

    async getQr(id) {
      const json = await getApi(`/qr-codes/${id}`)
      return {qr_code: json.data.qr_code}
      // return new Promise((resolve) => {
      // 	setTimeout(() => resolve({ qr_code: EXAMPLE_SVG }), 2000)
      // })

    },

    async getLink(id) {
      const json = await getApi(`/links/${id}`)
      return {url: json.data.url}
    },

    async downloadSvg(svgUrl) {
      const response = await delayedFetch(proxyUrl(svgUrl));
      return await response.text();
    }

  }
}

function fetchError(fetchRes) {
  if(fetchRes.ok) {
    return fetchRes.json()
  } else {
    return fetchRes.text().then(text => {
      throw new Error(text.slice(0, 140))
    })
  }
}
