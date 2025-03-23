import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

export default function BetsOverview() {
  const [races, setRaces] = useState([]);
  const [predictionsByRace, setPredictionsByRace] = useState({});
  const [resultsByRace, setResultsByRace] = useState({});
  const [userMapping, setUserMapping] = useState({});
  const [pilotMapping, setPilotMapping] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/race-weekends/with-results")
      .then((res) => res.json())
      .then((data) => {
        if (data.raceWeekends) {
          setRaces(data.raceWeekends);
        }
      })
      .catch((err) => console.error("Error fetching races with results:", err));
  }, []);

  useEffect(() => {
    if (races.length === 0) return;
    Promise.all(
      races.map((race) =>
        fetch(`/api/predictions/race/${race.id}`)
          .then((res) => res.json())
          .then((data) => ({
            raceId: race.id,
            predictions: data.predictions || [],
          }))
      )
    )
      .then((results) => {
        const mapping = {};
        results.forEach((result) => {
          mapping[result.raceId] = result.predictions;
        });

        setPredictionsByRace(mapping);
      })
      .catch((err) =>
        console.error("Error fetching predictions for races:", err)
      );
  }, [races]);

  useEffect(() => {
    if (races.length === 0) return;
    Promise.all(
      races.map((race) =>
        fetch(`/api/results/${race.id}`)
          .then((res) => res.json())
          .then((data) => ({
            raceId: race.id,
            result: data.result,
          }))
      )
    )
      .then((results) => {
        const mapping = {};
        results.forEach((r) => {
          mapping[r.raceId] = r.result;
        });
        setResultsByRace(mapping);
      })
      .catch((err) => console.error("Error fetching results for races:", err));
  }, [races]);

  useEffect(() => {
    fetch("/api/users/usernames")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          const mapping = {};
          data.users.forEach((user) => {
            mapping[user.id] = user.username;
          });
          setUserMapping(mapping);
        }
      })
      .catch((err) => console.error("Error fetching user usernames:", err));
  }, []);

  useEffect(() => {
    fetch("/api/pilots")
      .then((res) => res.json())
      .then((data) => {
        if (data.pilots && Array.isArray(data.pilots)) {
          const mapping = {};
          data.pilots.forEach((pilot) => {
            mapping[pilot.id] = pilot.name;
          });
          setPilotMapping(mapping);
        }
      })
      .catch((err) => console.error("Error fetching pilots:", err));
  }, []);

  useEffect(() => {
    if (
      races.length > 0 &&
      Object.keys(predictionsByRace).length > 0 &&
      Object.keys(resultsByRace).length > 0 &&
      Object.keys(userMapping).length > 0 &&
      Object.keys(pilotMapping).length > 0
    ) {
      setLoading(false);
    }
  }, [races, predictionsByRace, resultsByRace, userMapping, pilotMapping]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-wide mb-8 text-primary">
        Historial de Predicciones y Resultados
      </h1>
      {races.map((race) => {
        const result = resultsByRace[race.id];
        const predictions = predictionsByRace[race.id] || [];
        const flagSrc = `/circuits/flags/${race.round_number}.png`;

        return (
          <div
            key={race.id}
            className="bg-secondary rounded-md shadow-md p-4 mb-8 text-primary"
          >
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <img
                src={flagSrc}
                alt={`Bandera del circuito ${race.round_number}`}
                className="w-16 md:w-20 h-auto object-contain border border-gray-300 rounded"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{race.race_name}</h2>
                <p className="text-sm text-yellow-300">
                  Ronda {race.round_number}· Fecha:{" "}
                  {new Date(race.race_date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-center w-fit border-primary border-2 p-2 mb-2 rounded bg-gradient-to-br from-secondary via-footer to-secondary">
                {race.race_type.toUpperCase()}
              </p>
            </div>

            <div className="mt-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">Resultado Real</h3>
              {result ? (
                <div className="overflow-x-auto">
                  <table className="table-fixed text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="text-center py-2 px-3 bg-footer text-gray-100">
                          2º
                        </th>
                        <th className="text-center py-2 px-3 bg-footer text-gray-100">
                          1º
                        </th>
                        <th className="text-center py-2 px-3 bg-footer text-gray-100">
                          3º
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          className="py-2 px-3 text-center"
                          style={{ backgroundColor: "#C0C0C0" }}
                        >
                          {pilotMapping[result.position_second] ||
                            result.position_second}
                        </td>
                        <td
                          className="py-2 px-3 text-center"
                          style={{ backgroundColor: "#FFD700" }}
                        >
                          {pilotMapping[result.position_first] ||
                            result.position_first}
                        </td>
                        <td
                          className="py-2 px-3 text-center"
                          style={{ backgroundColor: "#CD7F32" }}
                        >
                          {pilotMapping[result.position_third] ||
                            result.position_third}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  Resultados no publicados.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Predicciones</h3>
              {predictions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-gray-100 border-collapse">
                    <thead>
                      <tr className="border-b border-gray-600 bg-footer">
                        <th className="text-left py-2 px-2">Usuario</th>
                        <th className="text-left py-2 px-2">1ª Posición</th>
                        <th className="text-left py-2 px-2">2ª Posición</th>
                        <th className="text-left py-2 px-2">3ª Posición</th>
                        <th className="text-right py-2 px-2">Puntos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map((pred) => (
                        <tr key={pred.id} className="border-b border-gray-700">
                          <td className="py-2 px-2">
                            {userMapping[pred.user_id]?.username ||
                              `User ${pred.user_id}`}
                          </td>
                          <td className="py-2 px-2">
                            {pilotMapping[pred.position_predicted_first] ||
                              pred.position_predicted_first}
                          </td>
                          <td className="py-2 px-2">
                            {pilotMapping[pred.position_predicted_second] ||
                              pred.position_predicted_second}
                          </td>
                          <td className="py-2 px-2">
                            {pilotMapping[pred.position_predicted_third] ||
                              pred.position_predicted_third}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {pred.total_points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No hay predicciones para esta carrera.
                </p>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-sm mt-4 text-gray-300">
        Los puntos muestran el total obtenido por cada jugador en cada carrera.
      </p>
    </div>
  );
}
