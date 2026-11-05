const fs = require('fs');
const path = require('path');
const items = require('./items.json');
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
        ['boss-rewards', 'Boss Rewards', 'aegis cheese refresher_shard ultimate_scepter_roshan aghanims_shard_roshan roshans_banner'],
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

console.log(Object.entries(items).filter(([k,v]) => !allKeys.has(k) && !k.startsWith('recipe_') && v.cost>0 && v.qual && game['item_'+k] && game['item_'+k].ItemPurchasable !== '0').map(([k])=>k));