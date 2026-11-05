// Находим поля и карточки, которые уже находятся в HTML.
const searchForm = document.querySelector('.search');
const searchInput = document.querySelector('#search-input');
const categoryFilter = document.querySelector('#category-filter');
const tagFilter = document.querySelector('#tag-filter');
const cards = document.querySelectorAll('.item-card');
const categories = document.querySelectorAll('.item-category');
const groups = document.querySelectorAll('.item-group');
const resultsCount = document.querySelector('#results-count');
const noResults = document.querySelector('#no-results');

// Регистр, ё/е, лишние пробелы и знаки препинания не мешают поиску.
function normalizeText(text) {
    return text.toLowerCase().replaceAll('ё', 'е')
        .replace(/[^a-zа-я0-9]+/g, ' ').trim();
}

// Буквы стоят в порядке одинаковых клавиш русской и английской раскладки.
function changeLayout(text, from, to) {
    return text.split('').map(function (letter) {
        const index = from.indexOf(letter);
        return index === -1 ? letter : to[index];
    }).join('');
}

function getSearchVariants(text) {
    const english = "`qwertyuiop[]asdfghjkl;'zxcvbnm,.";
    const russian = 'ёйцукенгшщзхъфывапролджэячсмитьбю';
    const query = text.toLowerCase();

    // Проверяем исходный ввод и обе возможные ошибки раскладки.
    return [query, changeLayout(query, english, russian), changeLayout(query, russian, english)]
        .filter(function (variant, index) {
            // Исправление не должно обрезать буквы: бкб → ,r, не превращаем в r.
            return index === 0 || /^[a-zа-яё0-9]+(?:['-][a-zа-яё0-9]+)*$/.test(variant);
        }).map(normalizeText).filter(function (variant) {
            return variant.length > 0;
        });
}

function getCardSearchText(card) {
    return normalizeText(card.dataset.name + ' ' + (card.dataset.nameRu || '')
        + ' ' + (card.dataset.aliases || ''));
}

function getSearchWords(query) {
    if (query.trim() === '') {
        return [];
    }

    const names = Array.from(cards, getCardSearchText);
    const knownWords = names.join(' ').split(' ');

    return query.trim().split(/\s+/).map(function (word) {
        const variants = getSearchVariants(word);
        // Сначала ищем известное слово: bkb не должно превращаться в «или».
        const exactWord = variants.find(function (variant) {
            return knownWords.includes(variant);
        });
        if (exactWord) {
            return exactWord;
        }

        // Если введена часть названия, выбираем первый подходящий вариант.
        return variants.find(function (variant) {
            return names.some(function (name) {
                return name.includes(variant);
            });
        }) || variants[0] || null;
    });
}

function matchesSearch(card, words) {
    const names = getCardSearchText(card);
    return words.every(function (word) {
        return word !== null && word.split(' ').every(function (part) {
            return names.includes(part);
        });
    });
}

function filterItems() {
    const searchWords = getSearchWords(searchInput.value);
    const selectedCategory = categoryFilter.value;
    const selectedTag = tagFilter.value;
    let count = 0;

    cards.forEach(function (card) {
        const tags = card.dataset.tags.split(' ');
        const matchesName = matchesSearch(card, searchWords);
        const matchesCategory = selectedCategory === 'all'
            || card.dataset.category === selectedCategory
            || card.dataset.group === selectedCategory;
        const matchesTag = selectedTag === 'all' || tags.includes(selectedTag);

        card.hidden = !(matchesName && matchesCategory && matchesTag);
        if (!card.hidden) {
            count++;
        }
    });

    categories.forEach(function (category) {
        category.hidden = category.querySelector('.item-card:not([hidden])') === null;
    });
    groups.forEach(function (group) {
        group.hidden = group.querySelector('.item-card:not([hidden])') === null;
    });

    resultsCount.textContent = 'Найдено предметов: ' + count;
    noResults.hidden = count !== 0;
}

// При открытии страницы начинаем с пустого поиска и всех предметов/тегов.
searchForm.reset();
searchInput.addEventListener('input', filterItems);
categoryFilter.addEventListener('change', filterItems);
tagFilter.addEventListener('change', filterItems);

searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    filterItems();
});

searchForm.addEventListener('reset', function (event) {
    event.preventDefault();
    searchInput.value = '';
    categoryFilter.value = 'all';
    tagFilter.value = 'all';
    filterItems();
});

filterItems();
