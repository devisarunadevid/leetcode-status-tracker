import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Download } from "lucide-react";

const API_BASE = "http://localhost:5000";

export default function App() {
  const [incharges, setIncharges] = useState([]);
  const [selected, setSelected] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/incharges`)
      .then((r) => r.json())
      .then(setIncharges)
      .catch(() => setIncharges([]));
  }, []);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!selected) return;

    try {
      setDownloading(true);
      const res = await fetch(`${API_BASE}/api/report/${selected}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "LeetCode_Stats.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col p-6">
      {/* ================= HEADER ================= */}
      <header className="w-full flex items-center justify-between mb-10">
        {/* Left - VCET Logo */}
        <img
          src="/vcet-logo.jpg"
          alt="VCET Logo"
          className="h-16 w-auto object-contain"
        />

        {/* Center - College Name + Dept */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Velammal College of Engineering and Technology
          </h1>
          <p className="text-lg font-medium text-gray-700">
            Department of Computer Science & Engineering
          </p>
        </div>

        {/* Right - CSE Logo */}
        <img
          src="/cse-logo.jpg"
          alt="CSE Logo"
          className="h-16 w-auto object-contain"
        />
      </header>

      {/* ================= CARD ================= */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-xl bg-gradient-to-br from-white to-gray-50 
                     border border-gray-200 rounded-2xl shadow-2xl 
                     p-8 sm:p-10 flex flex-col items-center justify-center"
        >
          <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">
            LeetCode Stats Report
          </h2>

          {/* Form */}
          <form
            onSubmit={handleDownload}
            className="space-y-6 w-full flex flex-col items-center"
          >
            <label className="block w-full">
              <span className="text-base font-semibold text-gray-700">
                Select Class In-Charge
              </span>
              <select
                className="mt-2 w-full rounded-[28px] border border-gray-300 bg-white text-gray-900 
                           focus:border-black focus:ring-black transition 
                           px-4 py-4 text-lg shadow-sm hover:shadow-md"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">-- Choose --</option>
                {incharges.map((ic) => (
                  <option key={ic.id} value={ic.id}>
                    {ic.name} ({ic.class})
                  </option>
                ))}
              </select>
            </label>

            {/* Solid Black Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={!selected || downloading}
              className="w-full sm:w-1/2 mx-auto flex items-center justify-center gap-2 
                rounded-[28px] bg-black text-white py-4 font-semibold 
                hover:bg-gray-900 shadow-md 
                disabled:opacity-50 transition-all duration-300"
            >
              {downloading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Download Excel</span>
                </>
              )}
            </motion.button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Note: Counts are fetched live from LeetCode for each student.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
