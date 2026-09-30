const inputElement = document.getElementById('search-input');
const containerElement = document.getElementById('country-container');
const errorElement = document.getElementById('error-container');

async function fetchCountries(query) {
    try {
        const response = await fetch(`https://restcountries.com/v2/name/${encodeURIComponent(query)}`);
        
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
        PNotify.error({
            text: 'Знайдено занадто багато збігів. Будь ласка, введіть більш специфічний запит!',
            delay: 2000,
        });
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
        const li = document.createElement('li');
        li.className = 'country-item';
        li.innerHTML = `
            <span><strong>${country.name}</strong> (${country.capital || 'Столицю не вказано'})</span>
            <img src="${country.flag}" alt="Прапор ${country.name}">
        `;
        list.appendChild(li);
    });
    containerElement.appendChild(list);
}

function renderCountryCard(country) {
    const languagesList = country.languages ? country.languages.map(lang => `<li>${lang.name}</li>`).join('') : '';
    const card = document.createElement('div');
    card.className = 'country-card';
    card.innerHTML = `
        <h2>${country.name}</h2>
        <p><strong>Столиця:</strong> ${country.capital || 'Немає даних'}</p>
        <p><strong>Населення:</strong> ${country.population ? country.population.toLocaleString() : 'Немає даних'}</p>
        <p><strong>Мови:</strong></p>
        <ul>${languagesList}</ul>
        <img src="${country.flag}" alt="Прапор ${country.name}">
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
    } else {
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
