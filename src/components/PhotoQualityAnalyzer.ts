export function analyzePhotoQuality(img:HTMLImageElement){

const canvas = document.createElement("canvas")
const ctx = canvas.getContext("2d")

canvas.width = img.width
canvas.height = img.height

ctx.drawImage(img,0,0)

const pixels = ctx.getImageData(0,0,img.width,img.height).data

let brightness = 0

for(let i=0;i<pixels.length;i+=4){
brightness += pixels[i]
}

brightness /= pixels.length

return{
tooDark: brightness < 40,
tooBright: brightness > 200
}
}