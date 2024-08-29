const supabase = require("../../../configs/supabase");

const getYearMonthsTotalsSummary = async (req, res) => {
  const { userId, status, year } = req.params;

  try {
    const { data, error } = await supabase
      .from("tx")
      .select("date, type, value")
      .eq("user_id", userId)
      .eq("status", status)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const monthlyTotals = {
      jan: 0,
      feb: 0,
      mar: 0,
      apr: 0,
      may: 0,
      jun: 0,
      jul: 0,
      aug: 0,
      sep: 0,
      oct: 0,
      nov: 0,
      dec: 0,
    };

    data.forEach((tx) => {
      const month = new Date(tx.date)
        .toLocaleString("default", { month: "short" })
        .toLowerCase();
      monthlyTotals[month] += tx.value;
    });

    const result = Object.entries(monthlyTotals).map(([month, total]) => ({
      month,
      total,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYearMonthsTotalsSummary;
