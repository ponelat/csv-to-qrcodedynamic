const EXAMPLE_SVG = 'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg'

export default function createApi(apiKey) {

  const postApi = async function(url, data) {
    const formData  = new FormData();
    for(const name in data) {
      formData.append(name, data[name]);
    }
    return fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    }).then(fetchError)
  }

  const getApi = async function(url) {
    return fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    }).then(fetchError)
  }
  return {

    async createLink(name, link) {
      const json = await postApi('https://qrcodedynamic.com/api/links', {
        url: name,
        location_url: link,
      })
      return {id: json.data.id}

      // return new Promise((resolve) => {
      // 	setTimeout(() => resolve({id: 123}), 3000)
      // })
    },

    async createQr(name, link, linkId) {
      const json = await postApi('https://qrcodedynamic.com/api/qr-codes', {
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

    async getQr(id) {
      const json = await getApi(`https://qrcodedynamic.com/api/qr-codes/${id}`)
      return {qr_code: json.data.qr_code}
      // return new Promise((resolve) => {
      // 	setTimeout(() => resolve({ qr_code: EXAMPLE_SVG }), 2000)
      // })

    },

    async getLink(id) {
      const json = await getApi(`https://qrcodedynamic.com/api/links/${id}`)
      return {url: json.data.url}
    }

  }
}

function fetchError(fetchRes) {
  if(fetchRes.ok) {
    return fetchRes.json()
  } else {
    return fetchRes.text().then(text => {
      throw new Error(text)
    })
  }
}
