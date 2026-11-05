// Находим поля и все карточки, которые уже находятся в HTML.
const searchForm = document.querySelector('.search');
const searchInput = document.querySelector('#search-input');
const categoryFilter = document.querySelector('#category-filter');
const tagFilter = document.querySelector('#tag-filter');
const cards = document.querySelectorAll('.item-card');
const categories = document.querySelectorAll('.item-category');
const groups = document.querySelectorAll('.item-group');
const resultsCount = document.querySelector('#results-count');
const noResults = document.querySelector('#no-results');

function filterItems() {
    // Пробелы по краям и регистр не влияют на поиск.
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedTag = tagFilter.value;
    let count = 0;

    cards.forEach(function (card) {
        const name = card.dataset.name.toLowerCase();
        const tags = card.dataset.tags.split(' ');
        const matchesName = name.includes(searchText);
        const matchesCategory = selectedCategory === 'all'
            || card.dataset.category === selectedCategory
            || card.dataset.group === selectedCategory;
        const matchesTag = selectedTag === 'all' || tags.includes(selectedTag);

        // Карточка показывается, только если совпали все три условия.
        card.hidden = !(matchesName && matchesCategory && matchesTag);

        if (!card.hidden) {
            count++;
        }
    });

    // Скрываем разделы, в которых не осталось подходящих карточек.
    categories.forEach(function (category) {
        category.hidden = category.querySelector('.item-card:not([hidden])') === null;
    });

    groups.forEach(function (group) {
        group.hidden = group.querySelector('.item-card:not([hidden])') === null;
    });

    resultsCount.textContent = 'Items found: ' + count;
    noResults.hidden = count !== 0;
}

// input срабатывает при каждом изменении текста, change — при выборе фильтра.
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
