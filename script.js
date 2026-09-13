const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const weatherCard = document.getElementById("weatherCard");
const forecastSection = document.getElementById("forecastSection");

const message = document.getElementById("message");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");

const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const rainChance = document.getElementById("rainChance");

const condition = document.getElementById("condition");
const weatherIcon = document.getElementById("weatherIcon");

const forecast = document.getElementById("forecast");

const themeBtn = document.getElementById("themeBtn");


/* =========================
   WEATHER CODE
========================= */

function getWeatherInfo(code) {

    const weather = {

        0: ["Clear Sky", "☀️"],

        1: ["Mainly Clear", "🌤️"],
        2: ["Partly Cloudy", "⛅"],
        3: ["Overcast", "☁️"],

        45: ["Fog", "🌫️"],
        48: ["Fog", "🌫️"],

        51: ["Light Drizzle", "🌦️"],
        53: ["Drizzle", "🌦️"],
        55: ["Heavy Drizzle", "🌧️"],

        61: ["Light Rain", "🌦️"],
        63: ["Rain", "🌧️"],
        65: ["Heavy Rain", "🌧️"],

        71: ["Light Snow", "🌨️"],
        73: ["Snow", "❄️"],
        75: ["Heavy Snow", "❄️"],

        80: ["Rain Showers", "🌦️"],
        81: ["Rain Showers", "🌧️"],
        82: ["Heavy Showers", "⛈️"],

        95: ["Thunderstorm", "⛈️"],
        96: ["Thunderstorm + Hail", "⛈️"],
        99: ["Thunderstorm + Hail", "⛈️"]
    };

    return weather[code] || ["Unknown", "🌍"];
}


/* =========================
   SEARCH CITY
========================= */

async function searchCity() {

    const city = cityInput.value.trim();

    if (!city) {

        showMessage("Please enter a city name.");

        return;
    }

    showMessage("Searching...");

    try {

        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Location search failed.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            showMessage("City not found. Try another city.");

            return;
        }

        const location = data.results[0];

        getWeather(location);

    } catch (error) {

        console.error(error);

        showMessage(
            "Unable to get weather. Check your internet connection."
        );
    }
}


/* =========================
   GET WEATHER
========================= */

async function getWeather(location) {

    try {

        showMessage("Loading weather...");

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather API failed.");
        }

        const data = await response.json();

        displayCurrentWeather(location, data);

        displayForecast(data);

        weatherCard.classList.remove("hidden");

        forecastSection.classList.remove("hidden");

        showMessage("");

    } catch (error) {

        console.error(error);

        showMessage(
            "Weather data could not be loaded."
        );
    }
}


/* =========================
   DISPLAY CURRENT WEATHER
========================= */

function displayCurrentWeather(location, data) {

    const current = data.current;

    const info =
        getWeatherInfo(current.weather_code);

    cityName.textContent =
        location.name;

    countryName.textContent =
        `${location.country} (${location.country_code})`;

    temperature.textContent =
        Math.round(current.temperature_2m);

    feelsLike.textContent =
        `${Math.round(current.apparent_temperature)}°C`;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    wind.textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    condition.textContent =
        info[0];

    weatherIcon.textContent =
        info[1];


    /* Rain probability for current hour */

    const currentTime =
        data.current.time;

    const hourIndex =
        data.hourly.time.indexOf(currentTime);

    if (hourIndex !== -1) {

        rainChance.textContent =
            `${data.hourly.precipitation_probability[hourIndex]}%`;

    } else {

        rainChance.textContent =
            "--%";
    }
}


/* =========================
   7 DAY FORECAST
========================= */

function displayForecast(data) {

    forecast.innerHTML = "";

    const daily = data.daily;

    for (let i = 0; i < daily.time.length; i++) {

        const date =
            new Date(daily.time[i]);

        const day =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday: "short"
                }
            );

        const info =
            getWeatherInfo(
                daily.weather_code[i]
            );

        const card =
            document.createElement("div");

        card.className =
            "forecast-card";

        card.innerHTML = `

            <div class="forecast-day">
                ${day}
            </div>

            <div class="forecast-icon">
                ${info[1]}
            </div>

            <div>
                ${info[0]}
            </div>

            <div class="forecast-temp">
                ${Math.round(daily.temperature_2m_max[i])}° /
                ${Math.round(daily.temperature_2m_min[i])}°
            </div>

            <div class="forecast-rain">
                💧 ${daily.precipitation_probability_max[i]}%
            </div>

        `;

        forecast.appendChild(card);
    }
}


/* =========================
   MESSAGE
========================= */

function showMessage(text) {

    message.textContent = text;
}


/* =========================
   SEARCH BUTTON
========================= */

searchBtn.addEventListener(
    "click",
    searchCity
);


/* ENTER KEY */

cityInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchCity();
        }

    }
);


/* =========================
   DARK MODE
========================= */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");

        themeBtn.textContent =
            document.body.classList.contains("dark")
                ? "☀️"
                : "🌙";
    }
);


/* =========================
   DEFAULT CITY
========================= */

cityInput.value = "Mumbai";

searchCity();