const supabase = require("../../../configs/supabase");

const getAllYearsInfo = async (req, res) => {
  const { userId, status } = req.params;
  try {
    const { data, error } = await supabase
      .from("tx")
      .select("date, type, value")
      .eq("user_id", userId)
      .eq("status", status);

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const yearData = {};

    data.forEach((tx) => {
      const year = new Date(tx.date).getFullYear();
      if (!yearData[year]) {
        yearData[year] = {
          year,
          totalIncome: 0,
          totalExpense: 0,
          trackedCount: 0,
        };
      }

      if (tx.type === "income") {
        yearData[year].totalIncome += tx.value;
      } else if (tx.type === "expense") {
        yearData[year].totalExpense += tx.value;
      }
      yearData[year].trackedCount += 1;
    });

    const result = Object.values(yearData).sort((a, b) => a.year - b.year);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getAllYearsInfo;
