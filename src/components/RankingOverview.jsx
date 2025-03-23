import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

function getBarColor(rank, totalEntries) {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";

  const baseColor = [41, 70, 67];
  const darkColor = [26, 43, 43];
  const factor = Math.min((rank - 3) / (totalEntries - 3), 1);
  const r = Math.round(baseColor[0] - factor * (baseColor[0] - darkColor[0]));
  const g = Math.round(baseColor[1] - factor * (baseColor[1] - darkColor[1]));
  const b = Math.round(baseColor[2] - factor * (baseColor[2] - darkColor[2]));
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export default function RankingOverview() {
  const [ranking, setRanking] = useState([]);
  const [userMapping, setUserMapping] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking")
      .then((res) => res.json())
      .then((data) => {
        if (data.ranking) {
          setRanking(data.ranking);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching ranking:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (ranking.length === 0) return;
    const userIds = Array.from(new Set(ranking.map((item) => item.user_id)));
    const idsToFetch = userIds.filter((id) => !userMapping[id]);
    if (idsToFetch.length === 0) return;
    idsToFetch.forEach((id) => {
      fetch(`/api/users/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.username) {
            setUserMapping((prev) => ({ ...prev, [id]: data.username }));
          }
        })
        .catch((err) => console.error(`Error fetching user ${id}:`, err));
    });
  }, [ranking, userMapping]);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 bg-secondary rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">
        Clasificación Global de la Temporada
      </h2>
      <div className="space-y-4">
        {ranking.map((item, index) => {
          const rank = index + 1;
          const username = userMapping[item.user_id] || "";
          const seasonPoints = Number(item.season_points) || 0;
          const lastPoints = Number(item.last_points) || 0;

          const maxPoints = ranking.reduce(
            (max, item) => Math.max(max, Number(item.season_points) || 0),
            0
          );
          const totalPercent =
            maxPoints > 0 ? (seasonPoints / maxPoints) * 100 : 0;
          const lastPercent =
            maxPoints > 0 ? (lastPoints / maxPoints) * 100 : 0;
          const oldPercent = totalPercent - lastPercent;
          const barColor = getBarColor(rank, ranking.length);

          return (
            <div key={item.user_id} className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {rank}. {username}
                </span>
                <span className="text-sm">{seasonPoints} pts</span>
              </div>

              <div className="flex relative h-4 border-b-1 border-b-gray-200 rounded">
                <div
                  style={{
                    width: `${oldPercent}%`,
                    backgroundColor: barColor,
                  }}
                />
                <div
                  style={{
                    width: `${lastPercent}%`,
                  }}
                  className="lastPattern"
                />
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .lastPattern {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(74, 144, 226, 0.5),
            rgba(74, 144, 226, 0.5) 5px,
            rgba(74, 144, 226, 0.2) 5px,
            rgba(74, 144, 226, 0.2) 10px
          );
        }
      `}</style>

      <p className="text-sm mt-4">
        La barra muestra los puntos acumulados globalmente; la sección a rayas
        indica los puntos obtenidos en la última predicción.
      </p>
    </div>
  );
}
