import SignatureCanvas from "react-signature-canvas"
import { useRef } from "react"

export default function SignaturePad({onSave}){

const ref = useRef(null)

return(

<div>

<SignatureCanvas
ref={ref}
penColor="black"
canvasProps={{width:400,height:200}}
/>

<button onClick={()=>{

const data = ref.current.getTrimmedCanvas().toDataURL()

onSave(data)

}}>
Save Signature
</button>

</div>

)
}