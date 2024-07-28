import './App.css'
import {Button} from './ui'
import { useState, useCallback, useMemo } from 'react'
import { useCSVReader } from "react-papaparse";
import DownloadTemplate from './DownloadTemplate.jsx'
import {useLocalStorage} from '@uidotdev/usehooks'
import createApi from './api'
import processLinks from './process-links.js'
import CreateQrCodeBody from './CreateNewQrCodeBody.jsx'
import UpdateQrCodeBody from './UpdateQrCodeBody.jsx'

function App() {
  const { CSVReader } = useCSVReader();
  const [qrCodeDynamicApiKey, setQrCodeDynamicApiKey] = useLocalStorage("qrCodeDynamicApiKey", '');
  const [proxyBase, setProxyBase] = useLocalStorage("proxyBase", 'https://proxy.ponelat.workers.dev/?');
  const [statusMap, setStatusMap] = useState({})

  const updateStatus = (name, status, ...consoleStatus) => {
    console.log(`Status: ${name} => ${status}`, ...consoleStatus)
    setStatusMap(s => ({...s, [name]: {status, error: false}})) 
  }
  const updateError = (name, status, ...consoleStatus) => {
    console.log(`Status: ${name} => ${status}`, ...consoleStatus)
    setStatusMap(s => ({...s, [name]: {status, error: true}})) 
  }

  const [inProgress, setInProgress] = useState(false)
  const [msg, setMsg] = useState('')
  const [links, setLinks] = useState([]);

  const api = useMemo(() => {
    return createApi(qrCodeDynamicApiKey, proxyBase)
  }, [qrCodeDynamicApiKey, proxyBase])

  const csvUploaded = useCallback(async (results) => {

  const links = results.data.slice(1)
    .filter(v => v[0] && v[1])
    .map(v => ({
       name: v[0],
       link: v[1]
     }))


    setLinks(links)
    setStatusMap(links.reduce((acc, link) => {
      acc[link.name] = {status: '', error: false}
      return acc
    },{}))

    setMsg(`Links uploaded: ${links.length}`)
  }, [])

  const createAndDownload = useCallback(async (links) => {
    setMsg('Creating and downloading QRs...')
    setInProgress(true)
    await processLinks(links, {
      api,
      updateStatus,
      updateError,
      setProgress: setMsg,
    })
    setInProgress(false)
  }, [api])

  const [tabIndex, setTabIndex] = useState(0)
  const classesTabSelected = 'border-gray-600 border border-b-0'
  const classesTabNotSelected = 'bg-blue-700 border-gray-600 border-b'

  const clearData = useCallback(() => {
    setStatusMap({})
    setInProgress(false)
    setMsg('')
    setLinks([])
  }, [])
  return (
    <>
      <div className="mt-8 flex items-end space-x-8 justify-end" >
	<div className="flex-1" >

	  <h1 className="text-3xl mt-4" > 
	    Batch (CSV) {'->'} QRCodeDynamic.com
	    <small className="ml-4 text-gray-500 font-mono" >v6</small>
	  </h1>

	  <p className="mt-2 font-em italic text-gray-500" >
	    Upload a CSV file of links, to create QR codes (and their dynamic links) via <a href="https://qrcodedynamic.com">qrcodedynamic.com</a> 
	  </p>

	</div>
	<div>

	  <div className="" >
	    <label htmlFor="apikey" className="block text-md font-medium text-gray-900 dark:text-white">QRCodeDynamic.com API Key</label>
	    <p className="text-sm mt-1 text-gray-500 italic" >
	      You can grab your API Key from: <a href="https://qrcodedynamic.com/account-api">https://qrcodedynamic.com/account-api</a>
	    </p>
	    <input
	      value={qrCodeDynamicApiKey}
	      onChange={e => setQrCodeDynamicApiKey(e.target.value)}
	      type="password"  id="apikey"
	      className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[400px] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
	  </div>

	  <div className="mt-2" >
	    <label htmlFor="proxyBase" className="block text-md font-medium text-gray-900 dark:text-white">
              Proxy Base
            </label>
	    <p className="text-sm mt-1 text-gray-500 italic" >
	      Used to bypass CORS issues, a public one is: <a href="https://corsproxy.io/?">https://corsproxy.io/?</a>
              <br/>
              And the developer's one is:  <a href="https://proxy.ponelat.workers.dev/?">https://proxy.ponelat.workers.dev/?</a>
	    </p>
	    <input
	      value={proxyBase}
	      onChange={e => setProxyBase(e.target.value)}
	      type="text"  id="proxy-base"
	      className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[400px] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
	  </div>
	</div>
      </div>

      {/* Tab selectors */}
      <div className="mt-16 flex" >
	<button onClick={() => setTabIndex(0)}
		className={`px-5 py-2 text-xl ${tabIndex === 0 ? classesTabSelected : classesTabNotSelected}`}
        >
          Create new QRs
        </button>
	<button onClick={() => setTabIndex(1)}
		className={`px-5 py-2 text-xl ${tabIndex === 1 ? classesTabSelected : classesTabNotSelected}`}
          >
          Update QRs
        </button>
        <div className="flex-1 border-gray-600 border-b " ></div>
      </div>

      {/* Tabbed body */}
      <div className="relative top--10 border-t-0 border p-4 border-gray-600">

        {tabIndex === 0 ? (
	  <CreateQrCodeBody />
        ): tabIndex === 1 ? (
          <UpdateQrCodeBody />
        ): (
          <div>No tab with index {tabIndex}</div>
        )}

      </div>
    </>
  )
}

export default App
