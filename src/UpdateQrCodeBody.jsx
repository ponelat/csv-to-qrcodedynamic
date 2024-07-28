import {useState, useCallback} from 'react'
import {Button} from './ui'
import { useCSVReader } from "react-papaparse";
import executeUpdate from './execute-update.js'


export default function UpdateQrCodeBody({api}) {
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
    const links = results.data.filter(a => a.link_id) // Basic validation
    setLinks(links)

    setStatusMap(links.reduce((acc, link) => {
      acc[link.link_id] = {status: '', error: false}
      return acc
    },{}))

    setMsg(`Links uploaded: ${links.length}`)
  }, [])

  const updateLinks = useCallback(async (links) => {
    setMsg('Creating and downloading QRs...')
    setInProgress(true)
    await executeUpdate(links, {
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
	<Button disabled={!links.length || !!inProgress} onClick={() => { updateLinks(links) }} className="bg-blue-600">Execute</Button>
      </div>

      { links.length ? (

	<div className="flex justify-center" >
	  <table className="mt-8 w-full" >
	    <thead>
	      <tr className="" >
		<th className="bg-gray-700 p-1" >ID</th>
		<th className="bg-gray-700 p-1" >New URL</th>
		<th className="bg-gray-700 p-1" >New Location URL</th>
		<th className="bg-gray-700 p-1" >Project ID</th>
		<th className="bg-gray-700 p-1" >Status</th>
	      </tr>
	    </thead>
	    <tbody  >
	      {links.map(({link_id,url, location_url, project_id}, i) => (
		<tr key={i} className={`${statusMap[link_id].error && 'bg-red-800 text-white'}`} >
		  <td className="pr-4 pt-2" ><a target="_blank" href={`https://qrcodedynamic.com/link-update/${link_id}`}>{link_id}</a></td>
		  <td className="pr-4 pt-2" >
		    <a target="_blank" href={`https://qrcodedynamic.com/${url}`}>{url}</a>
                  </td>
		  <td className="pr-4 pt-2" ><a target="_blank" href={location_url}>{location_url}</a></td>
		  <td className="pr-4 pt-2" >
                   { project_id ? (
                     <a target="_blank" href={`https://qrcodedynamic.com/links?search=&search_by=url&project_id=${project_id}`}>{project_id}</a>
                    ) : (
                        <span className="text-sm uppercase text-gray-600" >CLEARED</span>
                    )} 
                  </td>
		  <td className={`pr-4 pt-2`} >{statusMap[link_id].status}</td>
		</tr>
	      ))}
	    </tbody>
	  </table>

	</div>
      ) : (
	<div className="mt-8 text-center " >

	  <div className="text-lg text-gray-400" >
            <p>
	      No links uploaded.
            </p>
	    <ol className="list-decimal text-left m-auto w-[500px]" >
	      <b> Steps: </b>
	      <li>Download a CSV export from
		<a target="_blank" href="https://qrcodedynamic.com/links"> qrcodedynamic.com/links </a>
	      </li>
	      <li>Modify the fields in your spreadsheet tool, make sure to save as plain CSV</li>
	      <li>Upload</li>
	      <li>Execute</li>
	    </ol>
	  </div>

	  <div className="mt-4 flex justify-center" >

	    <div className="ml-4" >
	      <CSVReader
		onUploadAccepted={(results) => {
		  csvUploaded(results)
		}}
		config={{ worker: true, header: true }}
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
