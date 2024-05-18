export default function createApi(apiKey, cache, setCache) {

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
      // return postApi('https://qrcodedynamic.com/api/links', {
      //   url: name,
      //   location_url: link,
      // }).then(json => json.data.id)
      return new Promise((resolve) => {
      	setTimeout(() => resolve(123), 3000)
      })
    },

    async createQr() {
      return new Promise((resolve) => {
	setTimeout(() => resolve({ id: 345, svgUrl: 'https://example.com/fun.svg'}), 3000)
      })
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
