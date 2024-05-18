import { useCSVDownloader } from "react-papaparse";
const TEMPLATE = [
  {"Name": "Some_Name01", "URL": "https://example.com/some-destination01"},
  {"Name": "Some_Name02", "URL": "https://example.com/some-destination02"},
] 

export default function DownloadTemplate() {
  const { CSVDownloader, Type } = useCSVDownloader();

  return (
    <>
	<CSVDownloader
	  type={Type.Button}
	  bom={true}
	  filename={"qr-template"}
	  delimiter={","}
	  data={TEMPLATE}
	>
	  Download CSV Template
	</CSVDownloader>
    </>
  )
  
}
