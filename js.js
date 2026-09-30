const inputElement = document.getElementById('search-input');
        const listElement = document.getElementById('country-list');
        const errorElement = document.getElementById('error-container');

        let debounceTimer = null;

        async function fetchCountries(query) {
            if (!query.trim()) {
                clearResults();
                return;
            }

            try {
                const response = await fetch(`https://restcountries.com/v2/name/${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        showError('Страны с таким названием не найдены.');
                    } else {
                        showError('Произошла ошибка при загрузке данных.');
                    }
                    return;
                }

                const countries = await response.json();
                renderCountries(countries);
            } catch (error) {
                showError('Ошибка сети. Проверьте подключение.');
            }
        }

        function renderCountries(countries) {
            clearResults();
            countries.forEach(country => {
                const li = document.createElement('li');
                li.className = 'country-item';
                li.innerHTML = `
                    <span><strong>${country.name}</strong> (${country.capital || 'Столица не указана'})</span>
                    <img src="${country.flag}" alt="Флаг ${country.name}">
                `;
                listElement.appendChild(li);
            });
        }

        function clearResults() {
            listElement.innerHTML = '';
            errorElement.textContent = '';
        }

        function showError(message) {
            clearResults();
            errorElement.textContent = message;
        }

        inputElement.addEventListener('input', (e) => {
            const query = e.target.value;

            clearTimeout(debounceTimer);

            if (!query.trim()) {
                clearResults();
                return;
            }

            debounceTimer = setTimeout(() => {
                fetchCountries(query);
            }, 500);
        }); 
