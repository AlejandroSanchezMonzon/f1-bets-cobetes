import { useEffect, useState } from "react";
import Loader from "@/components/Loader";

export default function NextRaceCountdown() {
  const [raceData, setRaceData] = useState(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetch("/api/race-weekends/next")
      .then((res) => res.json())
      .then((data) => setRaceData(data))
      .catch((err) =>
        console.error("Error al obtener los datos de la próxima carrera:", err)
      );
  }, []);

  const race = raceData?.raceWeekend
    ? {
        id: raceData.raceWeekend.id,
        roundNumber: raceData.raceWeekend.round_number,
        raceDate: raceData.raceWeekend.race_date,
        raceName: raceData.raceWeekend.race_name,
        raceType: raceData.raceWeekend.race_type,
        createdAt: raceData.raceWeekend.created_at,
      }
    : null;

  useEffect(() => {
    if (!race?.raceDate) return;

    const raceStart = new Date(race.raceDate);
    const betCloseTime = new Date(raceStart.getTime() - 0.5 * 60 * 60 * 1000);

    const updateCountdown = () => {
      const now = new Date();
      const diff = betCloseTime - now;

      if (diff <= 0) {
        setCountdown("Votación cerrada");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [race?.raceDate]);

  return race ? (
    <article className="flex flex-col items-center p-6 rounded-lg bg-gradient-to-r from-secondary via-footer to-accent shadow-lg sm:flex-row">
      <div className="flex-shrink-0">
        <img
          className="object-cover h-32 rounded-lg"
          src={`/circuits/tracks/${race.id}.png`}
          alt={race.raceName}
        />
      </div>
      <div className="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <h2 className="text-2xl font-wide">Próxima carrera</h2>
          <p className="text-center w-fit border-primary border-2 p-2 mb-2 rounded bg-gradient-to-br from-secondary via-footer to-secondary">
            {race.raceType.toUpperCase()}
          </p>
        </div>
        <p className="text-xl">
          <span className="font-wide mr-2 md:mr-4"># {race.roundNumber}</span>{" "}
          {race.raceName}
        </p>
        <p className="mt-2 text-3xl font-extrabold text-yellow-300">
          {countdown}
        </p>
      </div>
    </article>
  ) : (
    <div>
      <Loader />
    </div>
  );
}
