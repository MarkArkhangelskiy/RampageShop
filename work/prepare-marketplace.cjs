const fs=require('fs'),path=require('path');
const catalog=require('./catalog.json'),items=require('./items.json');
const special={aegis:9000,cheese:2500,refresher_shard:3500,ultimate_scepter_roshan:5800,aghanims_shard_roshan:1800,roshans_banner:2500,royale_with_cheese:6500,famango:150,great_famango:400,greater_famango:900};
const prices={};const jobs=[];
for(const [group,,categories] of catalog.groups)for(const [category,,keys] of categories)for(const key of keys){
 const item=items[key]; const name=key.startsWith('dagon_')?item.dname+' '+key.split('_')[1]:item.dname;
 if(group==='neutral-items'){const tier=Number(category.slice(-1));const base=[0,650,1300,2200,3300,5000][tier];const variation=Array.from(key).reduce((sum,c)=>sum+c.charCodeAt(0),0)%7;prices[key]=base+variation*[0,50,100,150,200,300][tier];}
 if(group==='other-items')prices[key]=special[key];
 const identity=(item.lore||'').slice(0,400);
 const abilities=(item.abilities||[]).map(a=>a.title).join(', ');
 const prompt=`Use case: product-mockup. Create ONE standalone landscape 4:3 product-listing illustration for a fantasy peer-to-peer marketplace like Avito used by Dota 2 heroes. Subject: ${name} from Dota 2${key.startsWith('dagon_')?' (upgrade level '+key.split('_')[1]+')':''}. Keep the distinctive silhouette, materials and colors recognizable as the Dota 2 item, not a generic unrelated object. Game lore context for visual identity: ${identity}. Item ability names for identity only, do not write them in the image: ${abilities}. Show the actual full item, large and clearly readable, casually arranged on a worn wooden tavern table or simple stone counter, as though its owner took an attractive listing photograph before selling it. Stylized painted 3D fantasy game art in the visual spirit of Dota 2, not real-world photorealism, not a flat inventory icon. Three-quarter slightly overhead perspective, soft natural window light, tactile surfaces and minor wear; restrained magical glow when appropriate. Leave modest breathing room around the object. Only the item or its natural matching pair/set; no unrelated goods. No text, labels, words, logos, price tags, watermarks, frames, collage, inventory UI, characters, hands or website mockup. Reference image when supplied is ONLY an identity reference for the product; reinvent the setting and composition as an in-world marketplace listing.`;
 jobs.push({key,name,category,group,prompt,file:'img/marketplace/'+key+'.png',reference:key==='ward_observer'?'img/Observer_Ward_model.webp':'img/items/'+key+'.png',status:'pending'});
}
fs.mkdirSync('img/marketplace',{recursive:true});
fs.writeFileSync('work/marketplace-prices.json',JSON.stringify(prices,null,2));
fs.writeFileSync('work/image-jobs.json',JSON.stringify(jobs,null,2));
if(!fs.existsSync('work/index.before-marketplace.html'))fs.copyFileSync('index.html','work/index.before-marketplace.html');
let html=fs.readFileSync('index.html','utf8');let n=0;
html=html.replace(/(<div class="[^\"]* item-card"[^>]*>)([\s\S]*?)(<\/div>)/g,(whole,start,body,end)=>{const job=jobs[n++];if(prices[job.key]!==undefined)body=body.replace('<p>Not sold in shops</p>',`<p title="Fictional hero-to-hero asking price">${prices[job.key]} <img src="img/gold.svg" alt="Gold" width="18" height="18"></p>`);return start+body+end;});
if(n!==jobs.length)throw Error('Card mismatch');
html=html.replace('<h1>Dota 2 Items</h1>','<h1>Dota 2 Items</h1>\n        <p>Neutral item and reward prices are fictional hero-to-hero asking prices.</p>');
fs.writeFileSync('index.html',html);
console.log('Jobs:',jobs.length,'Custom prices:',Object.keys(prices).length);
