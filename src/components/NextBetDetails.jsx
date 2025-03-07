import { useEffect, useState } from "react";

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
      .catch((err) => console.error("Error fetching next race data:", err));
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
      .catch((err) => console.error("Error fetching qualifying data:", err));

    fetch(`/api/weather?race_weekend_id=${raceData.id}`)
      .then((res) => res.json())
      .then((data) => setWeatherData(data.weather))
      .catch((err) => console.error("Error fetching weather data:", err));

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
        .catch((err) => console.error("Error fetching prediction:", err));
    }

    const raceStart = new Date(raceData.race_date);
    const predictionCloseTime = new Date(
      raceStart.getTime() - 12 * 60 * 60 * 1000
    );
    setCanPredict(new Date() < predictionCloseTime && qualyData !== null);
  }, [raceData]);

  useEffect(() => {
    if (!raceData) return;
    const raceStart = new Date(raceData.race_date);
    const predictionCloseTime = new Date(
      raceStart.getTime() - 12 * 60 * 60 * 1000
    );
    setCanPredict(new Date() < predictionCloseTime && qualyData !== null);
  }, [qualyData, raceData]);

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
          message: "Prediction saved successfully",
          type: "success",
          dismissible: true,
          icon: true,
        });
      } else {
        window.toast({
          title: "Error",
          message: data.error || "Error saving prediction",
          type: "error",
          dismissible: true,
          icon: true,
        });
      }
    } catch (error) {
      console.error("Error saving prediction:", error);
      window.toast({
        title: "Error",
        message: "Server error",
        type: "error",
        dismissible: true,
        icon: true,
      });
    }
  };

  if (!raceData) {
    return <div>Loading next race data...</div>;
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
        <div className="mt-4 md:mt-0 text-center md:text-right">
          <p className="text-lg font-semibold">
            {weatherData
              ? `Weather: ${weatherData.forecast}`
              : "No weather data available"}
          </p>
          <p className="text-sm text-gray-400">
            Qualy: {qualyData ? "Published" : "Pending"}
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-primary pt-4">
        <h3 className="text-lg font-bold mb-2">Your Prediction</h3>
        {canPredict ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">1st Place</label>
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
              <label className="block text-sm font-medium">2nd Place</label>
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
              <label className="block text-sm font-medium">3rd Place</label>
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
                    Sprint 1st Place
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
                    Sprint 2nd Place
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
                    Sprint 3rd Place
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
              Save Prediction
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-400">
            {qualyData
              ? "Prediction closed (less than 12 hours remaining)."
              : "Qualy not published yet; wait to predict."}
          </p>
        )}
      </div>
    </div>
  );
}
