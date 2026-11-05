const fs=require('fs');
const jobs=JSON.parse(fs.readFileSync('work/image-jobs.json','utf8'));
let html=fs.readFileSync('index.html','utf8');
for(const job of jobs){if(!fs.existsSync(job.file))continue;job.status='complete';
 const escaped=job.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replaceAll('&','&amp;').replaceAll('"','&quot;');
 // Сопоставляем карточки по data-name; названия в каталоге уникальны.
 const needle='data-name="'+job.name.replaceAll('&','&amp;').replaceAll('"','&quot;')+'"';
 const start=html.indexOf(needle);if(start<0)throw Error('Missing '+job.name);
 const imgStart=html.indexOf('<img ',start),imgEnd=html.indexOf('>',imgStart)+1;
 html=html.slice(0,imgStart)+`<img src="${job.file}" alt="${job.name.replaceAll('&','&amp;').replaceAll('"','&quot;')} — marketplace listing" width="320" height="240" loading="lazy">`+html.slice(imgEnd);
}
fs.writeFileSync('index.html',html);fs.writeFileSync('work/image-jobs.json',JSON.stringify(jobs,null,2));console.log('Connected images:',jobs.filter(j=>j.status==='complete').length);
