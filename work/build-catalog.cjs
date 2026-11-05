const fs = require('fs');
const path = require('path');
const items = require('./items.json');
const marketplacePrices = require('./marketplace-prices.json');
// Разбор исходных игровых данных нужен только этому рабочему скрипту.
function parseKV(text) {
    const tokens = text.replace(/\/\/[^\n\r]*/g, '').match(/"(?:\\.|[^"\\])*"|[{}]/g);
    let i = 0;
    function object() {
        const result = {};
        while (i < tokens.length && tokens[i] !== '}') {
            const key = JSON.parse(tokens[i++]);
            if (tokens[i] === '{') { i++; result[key] = object(); i++; }
            else result[key] = JSON.parse(tokens[i++]);
        }
        return result;
    }
    return object();
}
const game = parseKV(fs.readFileSync('work/game-items.txt', 'utf8')).DOTAAbilities;
const tiers = parseKV(fs.readFileSync('work/neutral-items.txt', 'utf8')).neutral_items.neutral_tiers;
const groups = [
    ['basic-items', 'Basic Items', [
        ['consumables', 'Consumables', 'ward_observer blood_grenade clarity ward_sentry smoke_of_deceit enchanted_mango faerie_fire dust tango flask tpscroll bottle aghanims_shard'],
        ['attributes', 'Attributes', 'branches gauntlets mantle slippers circlet boots_of_elves belt_of_strength crown robe blade_of_alacrity diadem ogre_axe staff_of_wizardry'],
        ['equipment', 'Equipment', 'quelling_blade ring_of_protection infused_raindrop orb_of_venom blight_stone orb_of_frost blades_of_attack gloves chainmail splintmail javelin helm_of_iron_will blitz_knuckles broadsword quarterstaff claymore mithril_hammer'],
        ['miscellaneous', 'Miscellaneous', 'ring_of_regen sobi_mask magic_stick fluffy_hat wind_lace boots ring_of_health void_stone voodoo_mask shawl cloak gem lifesteal shadow_amulet ghost blink chasm_stone'],
        ['secret', 'Secret Shop', 'energy_booster vitality_booster cornucopia point_booster talisman_of_evasion platemail ring_of_tarrasque tiara_of_selemene hyperstone demon_edge eagle mystic_staff reaver ultimate_orb relic']
    ]],
    ['upgraded-items', 'Upgraded Items', [
        ['accessories', 'Accessories', 'bracer null_talisman wraith_band magic_wand soul_ring orb_of_corrosion falcon_blade pers power_treads phase_boots oblivion_staff mask_of_madness hand_of_midas travel_boots travel_boots_2 moon_shard specialists_array'],
        ['support', 'Support', 'buckler headdress ring_of_basilius urn_of_shadows tranquil_boots arcane_boots pavise ancient_janggo mekansm vladmir holy_locket spirit_vessel pipe guardian_greaves boots_of_bearing solar_crest'],
        ['magical', 'Magical', 'veil_of_discord glimmer_cape force_staff aether_lens witch_blade cyclone rod_of_atos dagon dagon_2 dagon_3 dagon_4 dagon_5 orchid ultimate_scepter ultimate_scepter_2 refresher octarine_core sheepstick gungir wind_waker essence_distiller devastator'],
        ['armor', 'Armor', 'vanguard blade_mail aeon_disk soul_booster crimson_guard lotus_orb black_king_bar bloodstone hurricane_pike manta sphere assault shivas_guard heart eternal_shroud helm_of_the_dominator helm_of_the_overlord consecrated_wraps'],
        ['weapons', 'Weapons', 'lesser_crit armlet meteor_hammer basher invis_sword desolator bfury nullifier monkey_king_bar radiance revenants_brooch greater_crit ethereal_blade angels_demise butterfly silver_edge abyssal_blade rapier disperser bloodthorn'],
        ['artifacts', 'Artifacts', 'dragon_lance kaya sange yasha phylactery diffusal_blade echo_sabre mage_slayer maelstrom heavens_halberd yasha_and_kaya kaya_and_sange sange_and_yasha harpoon satanic skadi mjollnir arcane_blink overwhelming_blink swift_blink crellas_crozier hydras_breath']
    ]],
    ['neutral-items', 'Neutral Items', Object.entries(tiers).map(([tier, data]) => ['tier-' + tier, 'Tier ' + tier, Object.keys(data.items).map(k => k.replace('item_', '')).join(' ')])],
    ['other-items', 'Other Items', [

        ['boss-rewards', 'Boss Rewards', 'aegis cheese refresher_shard roshans_banner'],
        ['collectibles', 'Collectibles', 'royale_with_cheese famango great_famango greater_famango']
    ]]
];
// Отсеиваем предметы, которые уже нельзя купить; нейтральные проверены по отдельному файлу.
const allKeys = new Set();
for (const [group,,categories] of groups) for (const cat of categories) {
    cat[2] = cat[2].split(' ').filter(k => {
        if (!items[k]) throw new Error('Нет данных: ' + k);
        if (allKeys.has(k)) throw new Error('Повтор: ' + k);
        const entry = game['item_' + k];
        if ((group === 'basic-items' || group === 'upgraded-items') && (entry?.ItemPurchasable === '0' || entry?.IsObsolete === '1')) return false;
        allKeys.add(k); return true;
    });
}
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const downloads = [];
let count = 0;
function card(key, category, group) {
    const item = items[key];
    const name = key.startsWith('dagon_') ? item.dname + ' ' + key.split('_')[1] : item.dname;
    const price = game['item_' + key]?.ItemCost ?? item.cost;
    const notForSale = group === 'neutral-items' || group === 'other-items';
    const slug = name.toLowerCase().replaceAll("'", '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const tags = (game['item_' + key]?.ItemShopTags || '').split(';').filter(Boolean);
    const marketplaceImage = 'img/marketplace/' + key + '.png';
    const image = fs.existsSync(marketplaceImage) ? marketplaceImage : key === 'ward_observer' ? 'img/Observer_Ward_model.webp' : 'img/items/' + key + '.png';
    if(key !== 'ward_observer') downloads.push({key, url:'https://cdn.cloudflare.steamstatic.com' + item.img.split('?')[0], file:image});
    count++;
    const wikiName = key.startsWith('dagon') ? 'Dagon' : key === 'travel_boots_2' ? 'Boots of Travel' : key === 'ultimate_scepter_roshan' ? "Aghanim's Blessing" : key === 'aghanims_shard_roshan' ? "Aghanim's Shard" : item.dname;
    const wiki = 'https://liquipedia.net/dota2/' + encodeURIComponent(wikiName.replaceAll(' ', '_'));
    return `                <div class="${slug} item-card" data-name="${escape(name)}" data-category="${category}" data-group="${group}" data-tags="${escape(tags.join(' '))}">\n                    <img src="${image}" alt="${escape(name)}" width="320" height="240" loading="lazy">\n                    <h4>${escape(name)}</h4>\n                    <p>${escape(notForSale ? marketplacePrices[key] : price) + ' <img src="img/gold.svg" alt="Gold" width="18" height="18">'}</p>\n                    <a href="${wiki}" class="btn" target="_blank" rel="noopener noreferrer">More</a>\n                </div>`;
}
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rampage shop</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js" defer></script>
</head>
<body>
    <header>
        <div class="logo">
            <a href="index.html">Rampage shop</a>
        </div>
        <form class="search" role="search">
            <label for="search-input">Search by name</label>
            <input type="search" id="search-input" placeholder="For example, Blink Dagger">
            <label for="category-filter">Category</label>
            <select id="category-filter">
                <option value="all">All items</option>
${groups.map(([id,name,cats]) => `                <optgroup label="${name}">\n                    <option value="${id}">All ${name}</option>\n${cats.map(([cid,cname])=>`                    <option value="${cid}">${cname}</option>`).join('\n')}\n                </optgroup>`).join('\n')}
            </select>
            <label for="tag-filter">Tag</label>
            <select id="tag-filter">
                <option value="all">All tags</option>
                <option value="damage">Damage</option>
                <option value="armor">Armor</option>
                <option value="attack_speed">Attack speed</option>
                <option value="str">Strength</option>
                <option value="agi">Agility</option>
                <option value="int">Intelligence</option>
                <option value="regen_health">Health regeneration</option>
                <option value="regen_mana">Mana regeneration</option>
                <option value="mobility">Mobility</option>
                <option value="escape">Escape</option>
            </select>
            <button type="reset">Reset</button>
        </form>
        <nav>
            <a href="profile.html">Profile</a>
            <a href="orders.html">My orders</a>
            <a href="create_order.html">Add order</a>
        </nav>
    </header>
    <main>
        <h1>Dota 2 Items</h1>
        <p>Neutral item and reward prices are fictional hero-to-hero asking prices.</p>
        <p id="results-count" role="status" aria-live="polite"></p>
        <p id="no-results" hidden>No items found. Try another name or reset the filters.</p>
${groups.map(([group,name,categories])=>`        <section class="${group} item-group">\n            <h2>${name}</h2>\n${categories.map(([category,title,keys])=>`            <section class="${category} item-category">\n                <h3>${title}</h3>\n${keys.map(k=>card(k,category,group)).join('\n')}\n            </section>`).join('\n')}\n        </section>`).join('\n')}
    </main>
    <footer>
        <p>Study project. Dota 2 item images belong to Valve.</p>
    </footer>
</body>
</html>
`;
if (!fs.existsSync('work/index.original.html')) fs.copyFileSync('index.html', 'work/index.original.html');
fs.writeFileSync('index.html', html);
fs.mkdirSync('img/items', {recursive:true});
fs.writeFileSync('img/gold.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><ellipse cx="12" cy="15" rx="9" ry="5" fill="#ad7414"/><path d="M3 10v5m18-5v5" stroke="#ad7414" stroke-width="2"/><ellipse cx="12" cy="10" rx="9" ry="5" fill="#f4ce48"/><ellipse cx="12" cy="10" rx="6" ry="3" fill="none" stroke="#c89220"/></svg>');
fs.writeFileSync('work/catalog.json', JSON.stringify({groups,count,downloads},null,2));
console.log('Cards: ' + count + '; Images to download: ' + downloads.length);

