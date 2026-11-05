const fs = require('fs');
const jobs = JSON.parse(fs.readFileSync('work/image-jobs.json', 'utf8'));
const translations = new Map(fs.readFileSync('work/item-localization.txt', 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim()).map(line => {
    const [key, name, aliases] = line.split('|').map(part => part.trim());
    return [key, { name, aliases }];
}));
const byName = new Map(jobs.map(job => [job.name, translations.get(job.key)]));
for (const job of jobs) if (!translations.get(job.key)) throw new Error('Нет перевода: ' + job.key);
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('lang="en"', 'lang="ru"');
html = html.replace(/<div class="[^\"]* item-card"[^>]*>[\s\S]*?<\/div>/g, card => {
    const englishName = card.match(/data-name="([^"]+)"/)[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&');
    const item = byName.get(englishName);
    if (!item) throw new Error('Нет данных для карточки ' + englishName);
    card = card.replace(/ data-name-ru="[^"]*"| data-aliases="[^"]*"/g, '');
    card = card.replace(/(data-name="[^"]*")/, '$1 data-name-ru="' + escape(item.name) + '" data-aliases="' + escape(item.aliases) + '"');
    card = card.replace(/<h4>[\s\S]*?<\/h4>/, '<h4>' + escape(item.name) + '</h4>');
    card = card.replace(/(<img src="img\/marketplace\/[^\"]*" alt=")[^"]*(")/, '$1' + escape(item.name) + ' — фото объявления$2');
    return card;
});
const labels = {
    'All items': 'Все предметы', 'All Basic Items': 'Все базовые предметы', 'All Upgraded Items': 'Все улучшенные предметы',
    'All Neutral Items': 'Все нейтральные предметы', 'All Other Items': 'Все остальные предметы',
    'Basic Items': 'Базовые предметы', 'Upgraded Items': 'Улучшенные предметы', 'Neutral Items': 'Нейтральные предметы', 'Other Items': 'Остальные предметы',
    'Consumables': 'Расходники', 'Attributes': 'Характеристики', 'Equipment': 'Снаряжение', 'Miscellaneous': 'Разное', 'Secret Shop': 'Потайная лавка',
    'Accessories': 'Аксессуары', 'Support': 'Поддержка', 'Magical': 'Магия', 'Armor': 'Броня', 'Weapons': 'Оружие', 'Artifacts': 'Артефакты',
    'Boss Rewards': 'Награды Рошана', 'Collectibles': 'Собираемые предметы', 'All tags': 'Все теги',
    'Damage': 'Урон', 'Attack speed': 'Скорость атаки', 'Strength': 'Сила', 'Agility': 'Ловкость', 'Intelligence': 'Интеллект',
    'Health regeneration': 'Восстановление здоровья', 'Mana regeneration': 'Восстановление маны', 'Mobility': 'Мобильность', 'Escape': 'Побег',
    'Search by name': 'Поиск по названию', 'Category': 'Категория', 'Tag': 'Тег', 'Reset': 'Сбросить',
    'Profile': 'Профиль', 'My orders': 'Мои объявления', 'Add order': 'Разместить объявление', 'Dota 2 Items': 'Предметы Dota 2', 'More': 'Подробнее'
};
for (let tier = 1; tier <= 5; tier++) labels['Tier ' + tier] = 'Уровень ' + tier;
// Меняем только текст и подписи групп; внутренние ключи категорий остаются прежними.
for (const [english, russian] of Object.entries(labels)) {
    html = html.replaceAll('>' + english + '<', '>' + russian + '<');
    html = html.replaceAll('label="' + english + '"', 'label="' + russian + '"');
}
html = html.replace('placeholder="For example, Blink Dagger"', 'placeholder="Например: блинк, blink, бкб"');
html = html.replace('Neutral item and reward prices are fictional hero-to-hero asking prices.', 'Цены нейтральных предметов и наград условные — для торговли между героями.');
html = html.replace('No items found. Try another name or reset the filters.', 'Ничего не найдено. Попробуйте другое название или сбросьте фильтры.');
html = html.replaceAll('title="Fictional hero-to-hero asking price"', 'title="Условная цена для торговли между героями"');
html = html.replaceAll('alt="Gold"', 'alt="Золото"');
html = html.replace('Study project. Dota 2 item images belong to Valve.', 'Учебный проект. Dota 2 принадлежит Valve. Иллюстрации объявлений сгенерированы.');
html = html.replace('<form class="search" role="search">', '<form class="search" role="search" autocomplete="off">');
html = html.replace('<option value="all">Все предметы</option>', '<option value="all" selected>Все предметы</option>');
html = html.replace('<option value="all">Все теги</option>', '<option value="all" selected>Все теги</option>');
fs.writeFileSync('index.html', html);
console.log('Русифицировано карточек:', jobs.length);
