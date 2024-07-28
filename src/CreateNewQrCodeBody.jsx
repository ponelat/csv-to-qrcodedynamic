import {useState, useCallback} from 'react'
import {Button} from './ui'
import DownloadTemplate from './DownloadTemplate.jsx'
import { useCSVReader } from "react-papaparse";
import executeLinks from './execute-create-links.js'

export default function CreateQrCodBody({api}) {
  const { CSVReader } = useCSVReader();
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
    await executeLinks(links, {
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
      <div className="pb-2 flex items-center justify-end space-x-4 " >
	<div className={`flex-1 text-md ${!msg && 'invisible'}`} >
	  {msg || '...'}
	</div>
	<Button disabled={!links.length} onClick={() => { clearData() }} className="border-blue-600 disabled:border-gray-600 border" >Clear List</Button>
	<Button disabled={!links.length || !!inProgress} onClick={() => { createAndDownload(links) }} className="bg-blue-600">Execute</Button>
      </div>

      { links.length ? (

	<div className="flex justify-center" >
	  <table className="mt-8 w-full" >
	    <thead>
	      <tr className="" >
		<th className="bg-gray-700 p-1" >URL</th>
		<th className="bg-gray-700 p-1" >Location URL</th>
		<th className="bg-gray-700 p-1" >Status</th>
	      </tr>
	    </thead>
	    <tbody  >
	      {links.map(({name,link}, i) => (
		<tr key={i} className={`${statusMap[name].error && 'bg-red-800 text-white'}`} >
		  <td className="pr-4 pt-2" >{name}</td>
		  <td className="pr-4 pt-2" >
                    <a target="_blank" href={link}>{link}</a>
                  </td>
		  <td className={`pr-4 pt-2`} >{statusMap[name].status}</td>
		</tr>
	      ))}
	    </tbody>
	  </table>

	</div>
      ) : (
	<div className="mt-8 text-center " >

	  <p className="text-lg text-gray-400" >
	    No links uploaded.{' '} <span className="cursor-pointer" ><DownloadTemplate />.</span>
	  </p>

	  <div className="mt-4 flex justify-center" >

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
			  <Button {...getRootProps()} className="bg-blue-700"  >Upload</Button>
			</div>
		      </div>
		    </>
		  )}}
	      </CSVReader>
	    </div>
	  </div>
	</div>)
      }
    </>
  )
  
}
