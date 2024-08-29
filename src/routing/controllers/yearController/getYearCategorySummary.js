const supabase = require("../../../configs/supabase");
const getMonthNumber = require("../../../utils/getMonthNumber");

const getYearCategorySummary = async (req, res) => {
  const { userId, year, month } = req.params;
  try {
    let query = supabase
      .from("tx")
      .select("date, category, value, type, status")
      .eq("user_id", userId);

    if (month) {
      const monthNumber = getMonthNumber(month);
      const monthStart = `${year}-${monthNumber}-01`;
      const nextMonthStart = new Date(year, parseInt(monthNumber, 10), 1);
      const monthEnd = new Date(nextMonthStart.getTime() - 1);
      const monthEndISO = monthEnd.toISOString().slice(0, 10);

      query = query.gte("date", monthStart).lte("date", monthEndISO);
    } else {
      query = query.gte("date", `${year}-01-01`).lte("date", `${year}-12-31`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const categorySummary = {
      incomes: {},
      expenses: {},
    };

    data.forEach((tx) => {
      const { category, value, type, status } = tx;
      const summaryType = type === "income" ? "incomes" : "expenses";

      if (!categorySummary[summaryType][category]) {
        categorySummary[summaryType][category] = { tracked: 0, planned: 0 };
      }

      if (status === "tracked") {
        categorySummary[summaryType][category].tracked += value;
      } else if (status === "planned") {
        categorySummary[summaryType][category].planned += value;
      }
    });

    res.status(200).json(categorySummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYearCategorySummary;
