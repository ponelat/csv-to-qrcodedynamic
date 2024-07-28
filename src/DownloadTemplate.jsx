import { useCSVDownloader } from "react-papaparse";
import {Button} from './ui'
const TEMPLATE = [
  {"Name": "Some_Name01", "URL": "https://example.com/some-destination-01"},
  {"Name": "Some_Name02", "URL": "https://example.com/some-destination-02"},
] 

function but({...props}) {
  return (
    <button className="font-bold" {...props} />
  )
}

export default function DownloadTemplate() {
  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <>
	<CSVDownloader
	  bom={true}
	  filename={"create-qrcodedynamic-links"}
	  delimiter={","}
	  data={TEMPLATE}
	>
          <a href="#">
	    Download example
          </a>
	</CSVDownloader>
    </>
  )
  
}
