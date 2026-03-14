import { QrReader } from "react-qr-reader"
import { useState } from "react"

export default function QRScanner({onResult}:{onResult:(data:string)=>void}){

const [manual,setManual] = useState("")

return(

<div className="space-y-4">

<QrReader
onResult={(result)=>{
if(result){
onResult(result.getText())
}
}}
constraints={{ facingMode:"environment" }}
/>

<input
placeholder="Manual Way ID"
value={manual}
onChange={(e)=>setManual(e.target.value)}
/>

<button onClick={()=>onResult(manual)}>
Submit
</button>

<input type="file"
accept="image/*"
onChange={async(e)=>{

const file = e.target.files?.[0]

/* OCR QR decode backend */
const res = await fetch("/api/scanQR",{method:"POST",body:file})

const data = await res.json()

onResult(data.code)

}}
/>

</div>
)
}