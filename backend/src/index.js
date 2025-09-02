import express from "express";
import cors from "cors";
import axios from "axios";
import ExcelJS from "exceljs";
import incharges from "./data/incharges.json" with { type: "json" };
import students from "./data/students.json" with { type: "json" };

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// 1. Get all in-charges
app.get("/api/incharges", (req, res) => {
  res.json(incharges);
});

// 2. (Optional) Get students for a class in-charge
app.get("/api/incharges/:id/students", (req, res) => {
  const { id } = req.params;
  res.json(students.filter((s) => s.inchargeId === id));
});

// Helper: fetch stats from LeetCode API
async function getLeetCodeStats(username) {
  const url = `https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(
    username
  )}`;
  try {
    const { data } = await axios.get(url, { timeout: 15000 });
    if (data && data.status === "success") {
      const {
        easySolved = 0,
        mediumSolved = 0,
        hardSolved = 0,
        totalSolved = 0,
      } = data;
      return { easySolved, mediumSolved, hardSolved, totalSolved, ok: true };
    }
  } catch (err) {
    // API failed
  }
  return {
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    totalSolved: 0,
    ok: false,
  };
}

// 3. Generate Excel for a given in-charge
app.get("/api/report/:inchargeId", async (req, res) => {
  const { inchargeId } = req.params;
  const incharge = incharges.find((i) => i.id === inchargeId);
  if (!incharge)
    return res.status(404).json({ message: "In-charge not found" });

  const roster = students.filter((s) => s.inchargeId === inchargeId);

  // Fetch stats for each student
  const rows = await Promise.all(
    roster.map(async (stu) => {
      const stats = await getLeetCodeStats(stu.leetcodeUsername);
      return {
        rollNo: stu.rollNo,
        name: stu.name,
        leetcodeUsername: stu.leetcodeUsername,
        easySolved: stats.easySolved,
        mediumSolved: stats.mediumSolved,
        hardSolved: stats.hardSolved,
        totalSolved: stats.totalSolved,
        _ok: stats.ok,
      };
    })
  );

  // Create Excel file
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("LeetCode Stats");

  ws.columns = [
    { header: "Roll No", key: "rollNo", width: 14 },
    { header: "Name", key: "name", width: 24 },
    { header: "LeetCode Username", key: "leetcodeUsername", width: 26 },
    { header: "Easy Solved", key: "easySolved", width: 14 },
    { header: "Medium Solved", key: "mediumSolved", width: 15 },
    { header: "Hard Solved", key: "hardSolved", width: 14 },
    { header: "Total Solved", key: "totalSolved", width: 14 },
    { header: "Status", key: "_status", width: 12 },
  ];

  rows.forEach((r) => {
    ws.addRow({
      ...r,
      _status: r._ok ? "OK" : "ERROR",
    });
  });

  ws.getRow(1).font = { bold: true };

  const safeName = incharge.name.replace(/\s+/g, "_");
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeName}_LeetCode_Stats.xlsx"`
  );

  await wb.xlsx.write(res);
  res.end();
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
