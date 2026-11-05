const fs=require('fs');
const text=fs.readFileSync('index.html','utf8');
const refs=[...text.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(s=>!s.startsWith('https:'));
const missing=refs.filter(s=>!fs.existsSync(s));
console.log({localReferences:refs.length,missing,cards:(text.match(/class="[^"]* item-card"/g)||[]).length});
if(missing.length)process.exit(1);
const script=fs.readFileSync('work/build-catalog.cjs','utf8');
const audit = script.slice(0,script.indexOf('const escape =')) + `\nconsole.log(Object.entries(items).filter(([k,v]) => !allKeys.has(k) && !k.startsWith('recipe_') && v.cost>0 && v.qual && game['item_'+k] && game['item_'+k].ItemPurchasable !== '0').map(([k])=>k));`;
fs.writeFileSync('work/audit-catalog.cjs',audit);
