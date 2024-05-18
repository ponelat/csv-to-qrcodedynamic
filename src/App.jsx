import './App.css'
import {Button} from './ui'
import { useState, useCallback, useMemo } from 'react'
import { useCSVReader } from "react-papaparse";
import DownloadTemplate from './DownloadTemplate.jsx'
import {useLocalStorage} from '@uidotdev/usehooks'
import createApi from './api'
import processLinks from './process-links.js'
// import zipFromBlobs from './zip-from-blobs.js'

// const exampleQr = {
//   name:  'Car01',
//   svgUrl:  'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg'
// }


function App() {
  const { CSVReader } = useCSVReader();
  const [qrCodeDynamicApiKey, setQrCodeDynamicApiKey] = useLocalStorage("qrCodeDynamicApiKey", '');
  const [statusMap, setStatusMap] = useState({})
  const [inProgress, setInProgress] = useState('')
  const [links, setLinks] = useState([]);
  const api = useMemo(() => {
    return createApi(qrCodeDynamicApiKey)
  }, [qrCodeDynamicApiKey])

  // const downloadZip = useCallback(() => {
  //   // Here Next
  //   zipFromBlobs(exampleQr.svgUrl, exampleQr.name).then(console.log, console.error)
  // }, [])

  const csvUploaded = useCallback(async (results) => {
    setInProgress('Processing CSV...')

    const links = results.data.slice(1).map(v => ({
      name: v[0],
      link: v[1]
    }))

    setLinks(links)
    setStatusMap(links.reduce((acc, link) => {
      acc[link.name] = 'waiting'
      return acc
    },{}))
    const updateStatus = (name, status) => {
      console.log(`Status: ${name} => ${status}`)
      setStatusMap(s => ({...s, [name]: status})) 
    }
    const svgUrls = await processLinks(links, {
      api,
      updateStatus
    })
    console.log("svgUrls", svgUrls)
    setInProgress('')
  }, [])

  const clearData = useCallback(() => {
    setStatusMap({})
    setLinks([])
  }, [])
  return (
    <>
      <h1 className="text-4xl mt-4" > 
	CSV to https://qrcodedynamic.com/
      </h1>

      <p className="mt-4 font-em text-gray-500" >
	From CSV file, create QR codes (and their dynamic links) via <a href="https://qrcodedynamic.com">qrcodedynamic.com</a> 
      </p>

      <div className="pt-4" >
	<div>
	  <label htmlFor="apikey" className="block text-md font-medium text-gray-900 dark:text-white">QRCodeDynamic.com API Key</label>
	  <em className="text-sm mb-1" >
	    You can grab your API Key from: <a href="https://qrcodedynamic.com/account-api">https://qrcodedynamic.com/account-api</a>
	  </em>
	  <input
	    value={qrCodeDynamicApiKey}
	    onChange={e => setQrCodeDynamicApiKey(e.target.value)}
	    type="password"  id="apikey" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
	</div>

      </div>

      <div className="mt-4 flex" >


      </div>

      
      <div className="mt-4 border p-4 border-gray-700">

	<div className="mt-4 flex items-center content-center space-x-4 " >
	  <h2 className="text-2xl" >From List</h2>
	  <Button disabled={!links.length} onClick={() => { clearData() }} className="bg-blue-500"> Create Links/QRs and Download</Button>
	  <Button disabled={!links.length} onClick={() => { clearData() }} className="bg-red-500" >Clear List</Button>
	</div>

	<div className={`mt-3 text-md ${!inProgress && 'invisible'}`} >
	  {inProgress || '...'}
	</div>

	{ links.length ? (

	  <table className="mt-8" >
	    <thead>
	      <tr className="" >
		<th className="bg-gray-700 p-1" >Name</th>
		<th className="bg-gray-700 p-1" >URL</th>
		<th className="bg-gray-700 p-1" >Status</th>
	      </tr>
	    </thead>
	    <tbody  >
	      {links.map(({name,link}, i) => (
		<tr key={i}>
		  <td className="pr-4 pt-2" >{name}</td>
		  <td className="pr-4 pt-2" >{link}</td>
		  <td className="pr-4 pt-2" >{statusMap[name]}</td>
		</tr>
	      ))}
	    </tbody>
	  </table>
	) :
	  (
	    <div className="mt-8 flex items-center" >
	      <p className="text-lg text-gray-400" >
		No links uploaded
	      </p>

	      <div className="ml-4">
		<DownloadTemplate />
	      </div>

	      <div className="ml-4" >
		<CSVReader
		  onUploadAccepted={(results) => {
		    csvUploaded(results)
		  }}
		  config={{ worker: true }}
		  noDrag
		>
		  {({
		    getRootProps,
		  }) => {
		    return (
		      <>
			<div >
			  <div>
			    <Button {...getRootProps()} className="bg-blue-800"  >Upload CSV Links</Button>
			  </div>
			</div>
		      </>
		    )}}
		</CSVReader>
	      </div>
	    </div>)
	}
      </div>

    </>
  )
}

export default App
