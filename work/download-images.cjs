const fs=require('fs');
const {downloads}=require('./catalog.json');
let index=0;
const failures=[];
async function worker(){while(index<downloads.length){const image=downloads[index++];if(fs.existsSync(image.file))continue;let ok=false;for(let attempt=0;attempt<3;attempt++){try{const response=await fetch(image.url,{signal:AbortSignal.timeout(25000)});if(!response.ok)throw Error(response.status);const data=Buffer.from(await response.arrayBuffer());if(!response.headers.get('content-type')?.startsWith('image/'))throw Error('Not image');fs.writeFileSync(image.file,data);ok=true;break;}catch(e){if(attempt===2)failures.push({key:image.key,error:String(e)});}}} }
Promise.all(Array.from({length:6},worker)).then(()=>{fs.writeFileSync('work/image-failures.json',JSON.stringify(failures));console.log('Images:',downloads.length-failures.length,'Failures:',JSON.stringify(failures));});
