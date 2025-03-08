import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";

function weatherCodeToText(code) {
  const mapping = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return mapping[code] || "Unknown";
}

const weatherIcons = {
  "Clear sky": "/icons/sunny.svg",
  "Mainly clear": "/icons/sunny.svg",
  "Partly cloudy": "/icons/partly-cloudy.svg",
  Overcast: "/icons/cloudy.svg",
  Fog: "/icons/fog.svg",
  "Depositing rime fog": "/icons/fog.svg",
  "Light drizzle": "/icons/rain.svg",
  "Moderate drizzle": "/icons/rain.svg",
  "Dense drizzle": "/icons/rain.svg",
  "Light freezing drizzle": "/icons/rain.svg",
  "Dense freezing drizzle": "/icons/rain.svg",
  "Slight rain": "/icons/rain.svg",
  "Moderate rain": "/icons/rain.svg",
  "Heavy rain": "/icons/heavy-rain.svg",
  "Light freezing rain": "/icons/heavy-rain.svg",
  "Heavy freezing rain": "/icons/heavy-rain.svg",
  "Slight snow fall": "/icons/snow.svg",
  "Moderate snow fall": "/icons/snow.svg",
  "Heavy snow fall": "/icons/snow.svg",
  "Snow grains": "/icons/snow.svg",
  "Slight rain showers": "/icons/rain.svg",
  "Moderate rain showers": "/icons/rain.svg",
  "Violent rain showers": "/icons/heavy-rain.svg",
  "Slight snow showers": "/icons/snow.svg",
  "Heavy snow showers": "/icons/snow.svg",
  Thunderstorm: "/icons/thunderstorm.svg",
  "Thunderstorm with slight hail": "/icons/thunderstorm.svg",
  "Thunderstorm with heavy hail": "/icons/thunderstorm.svg",
};

export default function NextBetDetails() {
  const [raceData, setRaceData] = useState(null);
  const [qualyData, setQualyData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [canPredict, setCanPredict] = useState(false);
  const [formData, setFormData] = useState({
    sunday_predicted_first: "",
    sunday_predicted_second: "",
    sunday_predicted_third: "",
    sprint_predicted_first: "",
    sprint_predicted_second: "",
    sprint_predicted_third: "",
  });

  useEffect(() => {
    fetch("/api/race-weekends/next")
      .then((res) => res.json())
      .then((data) => {
        if (data.raceWeekend) {
          setRaceData(data.raceWeekend);
        }
      })
      .catch((err) =>
        console.error("Error al obtener la próxima carrera:", err)
      );
  }, []);

  useEffect(() => {
    if (!raceData) return;

    fetch(`/api/qualifying/${raceData.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && data.qualifying) {
          setQualyData(data.qualifying);
        } else {
          setQualyData(null);
        }
      })
      .catch((err) =>
        console.error(
          "Error al obtener la información de la clasificación:",
          err
        )
      );

    const parts = raceData.race_name.split("–");
    if (parts.length < 2) return;
    const country = parts[0].trim();
    const subparts = parts[1].split(",");
    const city = subparts.length > 1 ? subparts[1].trim() : parts[1].trim();
    const locationQuery = `${city}, ${country}`;

    fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        locationQuery
      )}&count=1`
    )
      .then((res) => res.json())
      .then((geoData) => {
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          )
            .then((res) => res.json())
            .then((forecastData) => {
              if (forecastData && forecastData.current_weather) {
                setWeatherData({
                  temp: forecastData.current_weather.temperature,
                  weatherCode: forecastData.current_weather.weathercode,
                  conditionText: weatherCodeToText(
                    forecastData.current_weather.weathercode
                  ),
                });
              }
            })
            .catch((err) =>
              console.error(
                "Error al obtener las previsiones meteorológicas:",
                err
              )
            );
        }
      })
      .catch((err) =>
        console.error("Error al obtener la geolocalización del circuito:", err)
      );

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`/api/predictions?race_weekend_id=${raceData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.predictions && data.predictions.length > 0) {
            const userPrediction = data.predictions[0];
            setPrediction(userPrediction);
            setFormData({
              sunday_predicted_first: userPrediction.sunday_predicted_first,
              sunday_predicted_second: userPrediction.sunday_predicted_second,
              sunday_predicted_third: userPrediction.sunday_predicted_third,
              sprint_predicted_first:
                userPrediction.sprint_predicted_first || "",
              sprint_predicted_second:
                userPrediction.sprint_predicted_second || "",
              sprint_predicted_third:
                userPrediction.sprint_predicted_third || "",
            });
          }
        })
        .catch((err) =>
          console.error("Error al obtener las predicciones:", err)
        );
    }
  }, [raceData]);

  useEffect(() => {
    if (!raceData) return;
    const raceStart = new Date(raceData.race_date);
    const predictionCloseTime = new Date(
      raceStart.getTime() - 12 * 60 * 60 * 1000
    );
    setCanPredict(new Date() < predictionCloseTime && qualyData !== null);
  }, [raceData, qualyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;
    const method = prediction ? "PATCH" : "POST";
    const url = prediction
      ? `/api/predictions/${prediction.id}`
      : "/api/predictions";
    const body = {
      race_weekend_id: raceData.id,
      sunday_predicted_first: formData.sunday_predicted_first,
      sunday_predicted_second: formData.sunday_predicted_second,
      sunday_predicted_third: formData.sunday_predicted_third,
    };
    if (raceData.race_type === "sprint") {
      body.sprint_predicted_first = formData.sprint_predicted_first;
      body.sprint_predicted_second = formData.sprint_predicted_second;
      body.sprint_predicted_third = formData.sprint_predicted_third;
    }
    try {
      const resUpdate = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await resUpdate.json();
      if (resUpdate.ok) {
        window.toast({
          title: "Success",
          message: "Tu predicción ha sido guardada correctamente",
          type: "success",
          dismissible: true,
          icon: true,
        });
      } else {
        window.toast({
          title: "Error",
          message: data.error || "Error al guardar la predicción",
          type: "error",
          dismissible: true,
          icon: true,
        });
      }
    } catch (error) {
      console.error("Error al guardar la predicción:", error);
      window.toast({
        title: "Error",
        message: "Error del servidor",
        type: "error",
        dismissible: true,
        icon: true,
      });
    }
  };

  if (!raceData) {
    return <Spinner />;
  }

  return (
    <div className="p-4 rounded-md shadow-md bg-secondary text-primary">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-center">
          <img
            src={`/circuits/${raceData.id}.png`}
            alt={raceData.race_name}
            className="w-40 h-auto mb-2"
          />
          <h2 className="text-xl font-bold mt-2">{raceData.race_name}</h2>
        </div>
        <div className="mt-4 md:mt-0 text-center">
          <p className="text-lg font-semibold">
            {weatherData
              ? `Temp: ${weatherData.temp} °C`
              : "Sin datos meteorológicos"}
          </p>
          <div className="flex items-center justify-center mt-2">
            {weatherData && weatherIcons[weatherData.conditionText] ? (
              <img
                src={weatherIcons[weatherData.conditionText]}
                alt={weatherData.conditionText}
                title={weatherData.conditionText}
                className="w-12 h-12 cursor-help"
              />
            ) : (
              weatherData && (
                <span className="text-sm text-gray-400">
                  {weatherData.conditionText}
                </span>
              )
            )}
          </div>
          {qualyData ? (
            <div className="mt-6 grid grid-cols-2 gap-2">
              {Array.from({ length: 20 }, (_, index) => {
                const pos = index + 1;
                const pilotId = qualyData[`position${pos}`];
                const pilotName = pilotMapping[pilotId] || `Pilot ${pilotId}`;
                return (
                  <div key={pos} className="flex items-center">
                    <span className="font-bold mr-2">Pos {pos}:</span>
                    <span>{pilotName}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-400">Qualy no publicada aún</p>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-primary pt-4">
        <h3 className="text-lg font-bold mb-2">Tu predicción</h3>
        {canPredict ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">1ª Posición</label>
              <input
                type="text"
                name="sunday_predicted_first"
                value={formData.sunday_predicted_first}
                onChange={handleChange}
                className="w-full border border-primary bg-transparent p-2 rounded text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">2ª Posición</label>
              <input
                type="text"
                name="sunday_predicted_second"
                value={formData.sunday_predicted_second}
                onChange={handleChange}
                className="w-full border border-primary bg-transparent p-2 rounded text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">3ª Pisición</label>
              <input
                type="text"
                name="sunday_predicted_third"
                value={formData.sunday_predicted_third}
                onChange={handleChange}
                className="w-full border border-primary bg-transparent p-2 rounded text-primary"
                required
              />
            </div>
            {raceData.race_type === "sprint" && (
              <>
                <div>
                  <label className="block text-sm font-medium">
                    Sprint - 1ª Posición
                  </label>
                  <input
                    type="text"
                    name="sprint_predicted_first"
                    value={formData.sprint_predicted_first}
                    onChange={handleChange}
                    className="w-full border border-primary bg-transparent p-2 rounded text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Sprint - 2ª Posición
                  </label>
                  <input
                    type="text"
                    name="sprint_predicted_second"
                    value={formData.sprint_predicted_second}
                    onChange={handleChange}
                    className="w-full border border-primary bg-transparent p-2 rounded text-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Sprint - 3ª Posición
                  </label>
                  <input
                    type="text"
                    name="sprint_predicted_third"
                    value={formData.sprint_predicted_third}
                    onChange={handleChange}
                    className="w-full border border-primary bg-transparent p-2 rounded text-primary"
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              className="w-full bg-accent text-primary py-2 rounded hover:bg-opacity-90"
            >
              Guardar predicción
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400">
            {qualyData
              ? "Predicción cerrada (quedan menos de 12 h. para el inicio de la carrera)."
              : "Qualy no publicada aún. No se puede realizar la predicción."}
          </p>
        )}
      </div>
    </div>
  );
}
