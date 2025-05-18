import { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import LoadingOverlay from "@/components/LoadingOverlay";

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
  const [driverMapping, setDriverMapping] = useState({});
  const [qualyData, setQualyData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [canPredict, setCanPredict] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [formData, setFormData] = useState({
    position_predicted_first: "",
    position_predicted_second: "",
    position_predicted_third: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

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
    fetch("/api/drivers")
      .then((res) => res.json())
      .then((data) => {
        if (data.drivers && Array.isArray(data.drivers)) {
          const mapping = {};
          data.drivers.forEach((driver) => {
            mapping[driver.id] = {
              name: driver.name,
              nationality: driver.nationality,
            };
          });
          setDriverMapping(mapping);
        }
      })
      .catch((err) =>
        console.error("Error al obtener la lista de pilotos:", err)
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
    const subparts = parts[1].split(",");
    const city = subparts.length > 1 ? subparts[1].trim() : parts[1].trim();
    const locationQuery = `${city}`;

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

    fetch(`/api/results/${raceData.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result) {
          setHasResults(true);
        } else {
          setHasResults(false);
        }
      })
      .catch((err) =>
        console.error("Error al comprobar los resultados de la carrera:", err)
      );

    const token = sessionStorage.getItem("token");
    if (token) {
      fetch(`/api/predictions/${raceData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.prediction) {
            const userPrediction = data.prediction;

            setPrediction(userPrediction);
            setFormData({
              position_predicted_first: userPrediction.position_predicted_first,
              position_predicted_second:
                userPrediction.position_predicted_second,
              position_predicted_third: userPrediction.position_predicted_third,
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
      raceStart.getTime() - 0.5 * 60 * 60 * 1000
    );

    setCanPredict(
      new Date() < predictionCloseTime && qualyData !== null && !hasResults
    );
  }, [raceData, qualyData, hasResults]);

  useEffect(() => {
    const {
      position_predicted_first,
      position_predicted_second,
      position_predicted_third,
    } = formData;
    if (
      position_predicted_first &&
      position_predicted_second &&
      position_predicted_third &&
      position_predicted_first !== position_predicted_second &&
      position_predicted_first !== position_predicted_third &&
      position_predicted_second !== position_predicted_third
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const method = prediction ? "PATCH" : "POST";
    setLoading(true);

    const url = prediction
      ? `/api/predictions/${raceData.id}`
      : "/api/predictions";
    const body = {
      race_weekend_id: raceData.id,
      position_predicted_first: Number(formData.position_predicted_first),
      position_predicted_second: Number(formData.position_predicted_second),
      position_predicted_third: Number(formData.position_predicted_third),
    };

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

      if (data) {
        setLoading(false);
      }

      if (resUpdate.ok) {
        window.toast({
          title: "Éxito",
          message: "Tu predicción ha sido guardada correctamente",
          type: "success",
          dismissible: true,
          icon: true,
        });
        setInterval(() => {
          window.location.reload();
        }, 1500);
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
    return <Loader />;
  }

  return (
    <div className="p-4 rounded-md shadow-md bg-secondary">
      <div className="flex flex-col">
        <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8">
          <div className="flex flex-col lg:flex-row items-center">
            <img
              src={`/circuits/flags/${raceData.round_number}.png`}
              alt={raceData.race_name}
              className="w-40 h-auto lg:mr-4 mb-4 object-contain border border-gray-300 rounded"
            />
            <h2 className="text-xl text-center lg:text-left font-bold w-75">
              {raceData.race_name}
            </h2>
          </div>
          <div className="text-center border-primary border-2 p-2 rounded bg-gradient-to-br from-secondary via-footer to-secondary">
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
          </div>
        </div>

        <div className="mt-6">
          {qualyData ? (
            <div className="overflow-x-auto px-4 sm:px-6">
              <table className="min-w-full table-auto text-sm text-gray-100 border-collapse">
                <thead>
                  <tr className="border-b border-gray-600 bg-footer">
                    <th className="py-2 px-3 text-center">Posición</th>
                    <th className="py-2 px-3 text-center">Piloto</th>
                    <th className="py-2 px-3 text-center">Nacionalidad</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 20 }, (_, i) => {
                    const pos = i + 1;
                    const driverId = qualyData[`position${pos}`];
                    const driver = driverMapping[driverId];
                    const driverName = driver?.name || `Driver ${driverId}`;
                    const driverNationality = driver?.nationality;

                    return (
                      <tr key={pos} className="border-t border-gray-700">
                        <td className="py-2 px-3 text-center">{pos}</td>
                        <td className="py-2 px-3 text-center">{driverName}</td>
                        <td className="py-2 px-3 text-center">
                          {driverNationality ? (
                            <img
                              src={`/flags/${driverNationality}.png`}
                              alt={driverNationality}
                              className="inline-block w-6 h-4 object-contain border border-gray-300/50 rounded"
                            />
                          ) : (
                            <span className="text-gray-500">–</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-400 text-center">
              Qualy no publicada aún.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-primary pt-4">
        <h3 className="text-lg font-bold mb-2">Tu predicción</h3>
        {canPredict ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2 font-medium">
                1ª Posición
              </label>
              <div className="flex items-center">
                <select
                  name="position_predicted_first"
                  value={formData.position_predicted_first}
                  onChange={handleChange}
                  className="bg-secondary border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                >
                  <option value="">Seleccione piloto</option>
                  {Object.entries(driverMapping).map(([id, driver]) => (
                    <option key={id} value={id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
                {formData.position_predicted_first &&
                  driverMapping[formData.position_predicted_first] && (
                    <img
                      src={`/flags/${
                        driverMapping[formData.position_predicted_first]
                          .nationality
                      }.png`}
                      alt={
                        driverMapping[formData.position_predicted_first]
                          .nationality
                      }
                      className="w-10 h-6 ml-4 object-contain border border-gray-300/50 rounded"
                    />
                  )}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 font-medium">
                2ª Posición
              </label>
              <div className="flex items-center">
                <select
                  name="position_predicted_second"
                  value={formData.position_predicted_second}
                  onChange={handleChange}
                  className="bg-secondary border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                >
                  <option value="">Seleccione piloto</option>
                  {Object.entries(driverMapping).map(([id, driver]) => (
                    <option key={id} value={id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
                {formData.position_predicted_second &&
                  driverMapping[formData.position_predicted_second] && (
                    <img
                      src={`/flags/${
                        driverMapping[formData.position_predicted_second]
                          .nationality
                      }.png`}
                      alt={
                        driverMapping[formData.position_predicted_second]
                          .nationality
                      }
                      className="w-10 h-6 ml-4 object-contain border border-gray-300/50 rounded"
                    />
                  )}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2 font-medium">
                3ª Posición
              </label>
              <div className="flex items-center">
                <select
                  name="position_predicted_third"
                  value={formData.position_predicted_third}
                  onChange={handleChange}
                  className="bg-secondary border border-gray-300 text-sm rounded-lg block w-full p-2.5"
                >
                  <option value="">Seleccione piloto</option>
                  {Object.entries(driverMapping).map(([id, driver]) => (
                    <option key={id} value={id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
                {formData.position_predicted_third &&
                  driverMapping[formData.position_predicted_third] && (
                    <img
                      src={`/flags/${
                        driverMapping[formData.position_predicted_third]
                          .nationality
                      }.png`}
                      alt={
                        driverMapping[formData.position_predicted_third]
                          .nationality
                      }
                      className="w-10 h-6 ml-4 object-contain border border-gray-300/50 rounded"
                    />
                  )}
              </div>
            </div>
            <button
              type="submit"
              className={`w-full bg-accent border border-gray-300 hover:bg-secondary font-regular rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center ${
                isFormValid ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
              }`}
              disabled={!isFormValid}
            >
              {prediction ? "Actualizar predicción" : "Guardar predicción"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400">
            {hasResults
              ? "Resultados publicados. No se puede realizar la predicción."
              : qualyData
              ? "Predicción cerrada (quedan menos de 30 minutos para el inicio de la carrera)."
              : "Qualy no publicada aún. No se puede realizar la predicción."}
          </p>
        )}
      </div>

      <LoadingOverlay loading={loading} />
    </div>
  );
}
