
import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => {
        if (!response.ok) throw new Error("API request failed");
        return response.json();
      })
      .then((data) => {
        setApiStatus(data.message);
      })
      .catch(() => {
        setApiStatus("Backend connection failed");
      });
  }, []);

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <nav className="flex justify-between border-b border-[#30363d] px-8 py-5">
        <h1 className="text-xl font-bold">
          <span className="text-[#3fb950]">◆</span> DeveloperHub
        </h1>
        <span className="text-sm text-[#8b949e]">
          Personal Developer Ecosystem
        </span>
      </nav>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="mb-5 text-sm text-[#3fb950]">
          YOUR DEVELOPER JOURNEY STARTS HERE
        </p>

        <h2 className="text-5xl font-bold">
          Build. Track. <span className="text-[#3fb950]">Grow.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#8b949e]">
          Track coding activity, manage projects, analyze skills
          and showcase your developer journey.
        </p>

        <button className="mt-9 rounded-lg bg-[#238636] px-7 py-3 font-semibold hover:bg-[#2ea043]">
          Get Started
        </button>

        <div className="mt-12 rounded-xl border border-[#30363d] bg-[#161b22] p-5">
          <p className="text-sm text-[#8b949e]">Backend API Status</p>
          <p className="mt-2 font-medium text-[#3fb950]">
            {apiStatus}
          </p>
        </div>
      </section>
    </main>
  );
}

export default App;
