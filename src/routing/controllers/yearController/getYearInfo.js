const supabase = require("../../../configs/supabase");

const getYearInfo = async (req, res) => {
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

    const yearData = {
      year: parseInt(year, 10),
      totalIncome: 0,
      totalExpense: 0,
      trackedCount: 0,
    };

    data.forEach((tx) => {
      if (tx.type === "income") {
        yearData.totalIncome += tx.value;
      } else if (tx.type === "expense") {
        yearData.totalExpense += tx.value;
      }
      yearData.trackedCount += 1;
    });

    res.status(200).json(yearData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYearInfo;
