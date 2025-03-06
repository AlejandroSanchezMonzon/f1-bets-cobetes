import { useEffect, useState } from "react";

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
    const betCloseTime = new Date(raceStart.getTime() - 12 * 60 * 60 * 1000);

    const updateCountdown = () => {
      const now = new Date();
      const diff = betCloseTime - now;

      if (diff <= 0) {
        setCountdown("Votación cerrada");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [race?.raceDate]);

  return race ? (
    <article className="flex flex-row items-center p-6 rounded-lg bg-gradient-to-r from-secondary via-footer to-accent shadow-lg">
      <div className="flex-shrink-0">
        <img
          className="object-cover h-32 rounded-lg"
          src={"/circuits/" + race.id + ".png"}
          alt={race.raceName}
        />
      </div>
      <div className="ml-6 flex flex-col">
        <h2 className="text-2xl font-wide text-white">Próxima carrera</h2>
        <p className="text-xl text-white">{race.raceName}</p>
        <p className="mt-2 text-3xl font-extrabold text-yellow-300">
          {countdown}
        </p>
      </div>
    </article>
  ) : (
    <div></div>
  );
}
