const inputElement = document.getElementById('search-input');
const containerElement = document.getElementById('country-container');
const errorElement = document.getElementById('error-container');

async function fetchCountries(query) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                showError('Країни з такою назвою не знайдені.');
            } else {
                showError('Сталася помилка під час завантаження даних.');
            }
            return;
        }

        const countries = await response.json();
        handleQueryResult(countries);
    } catch (error) {
        showError('Помилка мережі. Перевірте підключення до інтернету.');
    }
}

function handleQueryResult(countries) {
    clearResults();

    if (countries.length > 10) {
        if (typeof PNotify !== 'undefined') {
            PNotify.error({
                text: 'Знайдено занадто багато збігів. Будь ласка, введіть більш специфічний запит!',
                delay: 2000,
            });
        } else {
            showError('Знайдено занадто багато збігів. Введіть більш специфічний запит!');
        }
        return;
    }

    if (countries.length >= 2 && countries.length <= 10) {
        renderCountriesList(countries);
        return;
    }

    if (countries.length === 1) {
        renderCountryCard(countries[0]);
        return;
    }
}

function renderCountriesList(countries) {
    const list = document.createElement('ul');
    list.className = 'country-list';

    countries.forEach(country => {
        const name = country.name.common;
        const capital = country.capital ? country.capital[0] : 'Столицю не вказано';
        const flagSrc = country.flags ? country.flags.png : '';

        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `
            <span><strong>${name}</strong> (${capital})</span>
            <img src="${flagSrc}" alt="Прапор ${name}" width="30">
        `;
        list.appendChild(li);
    });

    containerElement.appendChild(list);
}

function renderCountryCard(country) {
    const name = country.name.common;
    const capital = country.capital ? country.capital[0] : 'Немає даних';
    const population = country.population ? country.population.toLocaleString() : 'Немає даних';
    const flagSrc = country.flags ? country.flags.png : '';
    const languages = country.languages ? Object.values(country.languages) : [];
    const languagesList = languages.map(lang => `<li>${lang}</li>`).join('');

    const card = document.createElement('div');
    card.className = 'country-card';
    card.innerHTML = `
        <h2>${name}</h2>
        <p><strong>Столиця:</strong> ${capital}</p>
        <p><strong>Населення:</strong> ${population}</p>
        <p><strong>Мови:</strong></p>
        <ul>${languagesList || '<li>Немає даних</li>'}</ul>
        <img src="${flagSrc}" alt="Прапор ${name}" width="150">
    `;

    containerElement.appendChild(card);
}

function clearResults() {
    containerElement.innerHTML = '';
    if (errorElement) errorElement.textContent = '';
}

function showError(message) {
    clearResults();
    if (errorElement) {
        errorElement.textContent = message;
    } else if (typeof PNotify !== 'undefined') {
        PNotify.error({ text: message, delay: 2000 });
    }
}

const onSearchInput = _.debounce((e) => {
    const query = e.target.value.trim();

    if (!query) {
        clearResults();
        return;
    }

    fetchCountries(query);
}, 500);

inputElement.addEventListener('input', onSearchInput);
