import { useState, useCallback } from 'react'
import { useCSVReader } from "react-papaparse";
import DownloadTemplate from './DownloadTemplate.jsx'
import {useSessionStorage} from '@uidotdev/usehooks'
import './App.css'
import zipFromBlobs from './zip-from-blobs.js'

const exampleQr = {
  name:  'Car01',
  svgUrl:  'https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/car.svg'
}

function App() {
  const { CSVReader } = useCSVReader();
  const [col, setCol] = useState([]);
  const [val, setVal] = useState([]);
  const downloadZip = useCallback(() => {
    // Start Here
    zipFromBlobs(exampleQr.svgUrl, exampleQr.name).then(console.log, console.error)
  }, [])

  const [qrCodeDynamicApiKey, setQrCodeDynamicApiKey] = useSessionStorage("qrCodeDynamicApiKey", '');
  const clearData = useCallback(() => {
    setCol([])
    setVal([])
  }, [])
  return (
    <>
      <h1>
	CSV to https://qrcodedynamic.com/
      </h1>
      <p>
	From CSV creates QR codes (and their dynamic links). 
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

      <div className="mt-4 flex space-x-4" >
	<DownloadTemplate />

	<CSVReader
	  onUploadAccepted={(results) => {
	    const value = results.data;
	    const filtered = value.filter((_, i) => i !== 0);
	    setCol(value[0]);
	    setVal(filtered);
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
		    <button {...getRootProps()} >Upload CSV Links</button>
		  </div>
		</div>
	      </>
	    )}}
	</CSVReader>

      </div>

      <hr className="my-4" />

	
	<div className="mt-8">

	  <div className="flex items-center content-center space-x-4 " >
	    <h2 className="text-2xl" >Links</h2>
	    <button disabled={!val.length} onClick={() => { downloadZip() }} className="" >Download QRs</button>
	    <button disabled={!val.length} onClick={() => { clearData() }} className="bg-red-800" >Clear</button>
	  </div>

      { val.length ? (

	  <table className="mt-8" >
	    <thead>
	      <tr>
		{col.length > 0 &&
		 col.map((col, i) => <th key={i}>{col}</th>)}
	      </tr>
	    </thead>
	    <tbody>
	      {val.map((val, i) => (
		<tr key={i}>
		  {val.map((v, i) => (
		    <td key={i}>{v}</td>
		  ))}
		</tr>
	      ))}
	    </tbody>
	  </table>
      ) :
        (
          <p className="mt-8 text-lg text-gray-500" >
           No links uploaded
           </p>)
      }
	</div>




    </>
  )
}

export default App
