const fs=require('fs');
let readme=fs.readFileSync('README.md','utf8').replace('Для карточек генерируются отдельные иллюстрации объявлений:', 'Для всех 246 карточек сгенерированы отдельные иллюстрации объявлений:').replace('Готовые изображения подключаются из img/marketplace.', 'Все новые изображения подключены из img/marketplace.');
readme+='\nГенерация завершена 5 ноября 2026 года: 246 отдельных изображений, 246 подключений в HTML. Все изображения проверены партиями в галерее, поиск и фильтры повторно проверены после подключения. Исходные иконки сохранены отдельно.\n';fs.writeFileSync('README.md',readme);
let sources=fs.readFileSync('SOURCES.md','utf8').replace('Новые товарные иллюстрации создаются встроенным imagegen', 'Все 246 новых товарных иллюстраций созданы встроенным imagegen 4–5 ноября 2026 года');fs.writeFileSync('SOURCES.md',sources);
const jobs=JSON.parse(fs.readFileSync('work/image-jobs.json','utf8'));
jobs[0].prompt='Use case: product-mockup. Create ONE standalone marketplace listing image of an Observer Ward from Dota 2, as though a hero personally photographed their used item for a fantasy Avito marketplace. The Observer Ward is a slender crooked wooden living totem with a large golden-yellow watchful eyeball and reddish organic petals at its top. Show the whole single item laid diagonally on a worn wooden tavern table, casual slightly imperfect three-quarter overhead framing, soft window light, restrained fantasy magical glow, painted/stylized 3D game-art aesthetic faithful to Dota 2, not real-life photorealism. The object must be large and clearly readable at small card size. Landscape 4:3 composition. No text, labels, price, watermark, border, collage, shop UI, characters, or hands. This is the actual product photograph illustration, not a website mockup.';
for(const job of jobs){job.generatedWith='built-in imagegen';if(job.key==='ward_observer')job.reference=null;}
fs.writeFileSync('work/image-jobs.json',JSON.stringify(jobs,null,2));
// Генератор каталога тоже должен сохранять новые цены и подключённые иллюстрации.
const p='work/build-catalog.cjs';let gen=fs.readFileSync(p,'utf8');
gen=gen.replace("const items = require('./items.json');", "const items = require('./items.json');\nconst marketplacePrices = require('./marketplace-prices.json');");
gen=gen.replace("const image = key === 'ward_observer' ?", "const marketplaceImage = 'img/marketplace/' + key + '.png';\n    const image = fs.existsSync(marketplaceImage) ? marketplaceImage : key === 'ward_observer' ?");
gen=gen.replace("notForSale ? 'Not sold in shops' : escape(price) + ' <img", "escape(notForSale ? marketplacePrices[key] : price) + ' <img");
gen=gen.replace('width="120" height="90" loading="lazy"', 'width="320" height="240" loading="lazy"');
gen=gen.replace('<h1>Dota 2 Items</h1>', '<h1>Dota 2 Items</h1>\n        <p>Neutral item and reward prices are fictional hero-to-hero asking prices.</p>');
fs.writeFileSync(p,gen);
