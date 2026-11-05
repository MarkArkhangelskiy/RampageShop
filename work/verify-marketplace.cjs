const fs=require('fs'),assert=require('assert/strict');
const jobs=JSON.parse(fs.readFileSync('work/image-jobs.json','utf8'));
const prices=require('./marketplace-prices.json');const html=fs.readFileSync('index.html','utf8');
assert.equal(jobs.length,244);assert.equal(jobs.filter(j=>j.category==='boss-rewards').length,4);assert(!jobs.some(j=>['ultimate_scepter_roshan','aghanims_shard_roshan'].includes(j.key)));for(const key of ['aegis','cheese','refresher_shard','roshans_banner','ultimate_scepter_2','aghanims_shard'])assert(jobs.some(j=>j.key===key));assert.equal(new Set(jobs.map(j=>j.name)).size,244);assert.equal(jobs.filter(j=>j.status==='complete').length,244);
assert.equal((html.match(/src="img\/marketplace\//g)||[]).length,244);
assert.equal((html.match(/Условная цена для торговли между героями/g)||[]).length,57);
assert.ok(!html.includes('Not sold in shops'));
assert.equal(Object.keys(prices).length,57);
const unique=new Set();let bytes=0;
for(const job of jobs){assert(!unique.has(job.file));unique.add(job.file);const data=fs.readFileSync(job.file);assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert(data.readUInt32BE(16)>0);assert(data.readUInt32BE(20)>0);bytes+=data.length;assert(html.includes('src="'+job.file+'"'));}
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(!match[1].startsWith('https:'))assert(fs.existsSync(match[1]),match[1]);}
assert(Object.values(prices).every(p=>Number.isInteger(p)&&p>0));
console.log({generated:jobs.length,customPrices:Object.keys(prices).length,missingFiles:0,imageSizeMB:Math.round(bytes/1024/1024)});
