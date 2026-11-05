const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const script=fs.readFileSync('script.js','utf8');
// Выполняем реальные функции поиска без DOM; карточки берём из готового HTML.
const functions=script.slice(script.indexOf('function normalizeText'),script.indexOf('function filterItems'));
const context={};vm.createContext(context);vm.runInContext(functions,context);
const html=fs.readFileSync('index.html','utf8');
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>');
const cards=[...html.matchAll(/<div class="[^\"]* item-card"([^>]*)>/g)].map(m=>{
 const attr=name=>decode(m[1].match(new RegExp(name+'="([^"]*)"'))[1]);
 return {dataset:{name:attr('data-name'),nameRu:attr('data-name-ru'),aliases:attr('data-aliases')}};
});
context.cards=cards;
const find=query=>{const words=context.getSearchWords(query);return cards.filter(card=>context.matchesSearch(card,words)).map(card=>card.dataset.name).sort();};
const compare=(a,b)=>assert.deepEqual(find(a),find(b),a+' != '+b);
assert.equal(cards.length,244);assert.equal(find('').length,244);assert.equal(find('   ').length,244);
assert.equal(find('blink').length,4);
for(const query of ['блинк','BLINK','БлИнК','  БЛИНК  ','идштл',',kbyr','ИДШТЛ',',KBYR'])compare(query,'blink');
compare('arcane блинк','arcane blink');compare('arcane ,kbyr','arcane blink');assert.equal(find('arcane ,kbyr').length,1);
for(const query of ['бкб','bkb','BKB','илИ','бкбшка'])compare(query,'Black King Bar');
compare('хекс','hex');compare('линка',"Linken's Sphere");compare('бфурик','Battle Fury');
compare('чёрного короля','черного короля');compare('blood thorn','bloodthorn');
assert.equal(find('неттакогопредмета123').length,0);
assert.equal(find('???').length,0);
assert.equal((html.match(/data-name-ru=/g)||[]).length,244);
assert.equal((html.match(/data-aliases=/g)||[]).length,244);
assert(!/>More<|>All items<|>Search by name<|lang="en"/.test(html));
console.log('Пройдено: русский/английский поиск, сленг, обе раскладки, регистр, смешанные запросы, ё/е, пустой ввод и локализация 244 карточек.');
