// OpenWeatherMap API key and base URL

const apiKey = 'da527ce66050f2229930ceb9f02e3c94';
const apiUrl = 'https://api.openweathermap.org/data/2.5/';

// Default city and units for weather data
let city = 'Ottawa'; 
const units = 'metric'; 

// Get current date
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1; // Months are zero-based (0 for January)
const day = currentDate.getDate();
const date =`(${year}/${day}/${month})`;

// HTML elements for displaying weather and forecast information
const weatherInfoElement = document.getElementById('weather-info');
const forecastInfoElement = document.getElementById('forecast-info');

// Function to fetch weather data for today
function fetchTodayWeather(city) {
    return fetch(`${apiUrl}weather?q=${city}&units=${units}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

// Function to fetch 5-day forecast
function fetchForecast(city) {
    return fetch(`${apiUrl}forecast?q=${city}&units=${units}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

// Function to update the HTML with weather information
function updateWeatherInfo(todayWeather, forecast) {
    const todayTemperature = todayWeather.main.temp;
    const todayWind = todayWeather.wind.speed;
    const todayHumidity = todayWeather.main.humidity;
    const todayDescription = todayWeather.weather[0].description;
    const todayIcon = `http://openweathermap.org/img/wn/${todayWeather.weather[0].icon}.png`;

    // Update the HTML with the today's weather information
    weatherInfoElement.innerHTML = `
        <div class="container">
            <h2>${city} ${date}</h2>
            <img src="${todayIcon}" alt="Weather Icon">
            <p>Temp: ${todayTemperature}°C</p>
            <p>Wind: ${todayWind} KM/h</p>
            <p>Humidity: ${todayHumidity}%</p>
            <p>Description: ${todayDescription}</p>
        </div>
    `;
    // Append the forecast information to the HTML
    forecastInfoElement.innerHTML = '';

    // Extract forecast information for the next 5 days
    const forecasts = forecast.list.filter(item => {
        // Filter to get forecasts for every 24 hours
        return item.dt_txt.includes('12:00:00');
    });

    // Append the forecast information to the HTML
    forecastInfoElement.innerHTML += `
        <h2>5-Day Forecast for ${city}</h2>
        <div class="forecast">
        <div class="row">
            ${forecasts.map(forecast => `
            <div class="col-md-4">
            <div class="card forecast-item forecast-card">    
                <div class="forecast-item" class="container" class="list-inline" class="card-body" >
                    <h6>as of ${date}</h6>
                    <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon">
                    <p>Temp: ${forecast.main.temp}°C</p>
                    <p>Wind: ${forecast.wind.speed} KM/h</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                    <p>Description: ${forecast.weather[0].description}</p>
                </div>
                
            </div>
            </div>
            `).join('')}
            </div>
        </div>
    `;
}

// Function to update city and fetch new weather data
function updateCity(cityName) {
    city = cityName;
    Promise.all([fetchTodayWeather(city), fetchForecast(city)])
        .then(([todayWeather, forecast]) => {
            updateWeatherInfo(todayWeather, forecast);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // Display an error message on the page
            weatherInfoElement.innerHTML = `<p>Error fetching weather data. Please try again later.</p>`;
        });
}

// Function to save a city to local storage
function saveCity(cityName) {
    // Generate a unique ID for the city
    const id = Date.now().toString(); 
    // Save the city to local storage with the unique ID
    localStorage.setItem(id,cityName);
    // Add the city to the list of saved cities
    addCityToList(id, cityName);
}

// Function to add a city to the list of saved cities
function addCityToList(id, cityName) {
    const savedCitiesElement = document.getElementById('savedCities');
    const cityElement = document.createElement('div');
    cityElement.innerHTML = `<button id='${id}' class="buttonCity">${cityName}</button>`;
    cityElement.addEventListener('click', function() {
        updateCity(cityName);
    });
    savedCitiesElement.appendChild(cityElement);
}

// Function to remove a city from the list and local storage
function removeCity(id) {
    localStorage.removeItem(id);
    document.getElementById(id).remove();
}


// Attach event listener to the search button
document.getElementById('searchButton').addEventListener('click', function() {
    const cityName = document.getElementById('cityInput').value;
    updateCity(cityName);
    saveCity(cityName);
});


// Fetch weather data for the default city on page load
updateCity(city);