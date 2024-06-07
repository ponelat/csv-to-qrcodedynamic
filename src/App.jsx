import './App.css'
import {Button} from './ui'
import { useState, useCallback, useMemo } from 'react'
import { useCSVReader } from "react-papaparse";
import DownloadTemplate from './DownloadTemplate.jsx'
import {useLocalStorage} from '@uidotdev/usehooks'
import createApi from './api'
import processLinks from './process-links.js'

function App() {
  const { CSVReader } = useCSVReader();
  const [qrCodeDynamicApiKey, setQrCodeDynamicApiKey] = useLocalStorage("qrCodeDynamicApiKey", '');
  const [proxyBase, setProxyBase] = useLocalStorage("proxyBase", 'https://ponelat-proxy.jponelat.workers.dev/?');
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
              And the developer's one is:  <a href="https://ponelat-proxy.jponelat.workers.dev/?">https://ponelat-proxy.jponelat.workers.dev/?</a>
	    </p>
	    <input
	      value={proxyBase}
	      onChange={e => setProxyBase(e.target.value)}
	      type="text"  id="proxy-base"
	      className="mt-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[400px] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
	  </div>
	</div>
      </div>

      <div className="mt-16 border p-4 border-gray-700">

	<div className="mt-4 flex items-center content-center space-x-4 " >
	  <h2 className="text-2xl" >From List</h2>
	  <Button disabled={!links.length || !!inProgress} onClick={() => { createAndDownload(links) }} className="bg-blue-500"> Create Links/QRs and Download</Button>
	  <Button disabled={!links.length} onClick={() => { clearData() }} className="bg-red-500" >Clear List</Button>
	</div>

	<div className={`mt-4 text-md ${!msg && 'invisible'}`} >
          {msg || '...'}
	</div>

	{ links.length ? (

	  <div className="flex justify-center" >
	    <table className="mt-8 w-full" >
	      <thead>
		<tr className="" >
		  <th className="bg-gray-700 p-1" >Name</th>
		  <th className="bg-gray-700 p-1" >URL</th>
		  <th className="bg-gray-700 p-1" >Status</th>
		</tr>
	      </thead>
	      <tbody  >
		{links.map(({name,link}, i) => (
		  <tr key={i} className={`${statusMap[name].error && 'bg-red-800 text-white'}`} >
		    <td className="pr-4 pt-2" >{name}</td>
		    <td className="pr-4 pt-2" >{link}</td>
		    <td className={`pr-4 pt-2`} >{statusMap[name].status}</td>
		  </tr>
		))}
	      </tbody>
	    </table>

	  </div>
	) :
	  (
	    <div className="mt-8 text-center " >

	      <p className="text-lg text-gray-400" >
		No links uploaded
	      </p>

	      <div className="mt-4 flex justify-center" >
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
	      </div>
	    </div>)
	}
      </div>

    </>
  )
}

export default App
