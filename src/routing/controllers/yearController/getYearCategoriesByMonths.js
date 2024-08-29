const supabase = require("../../../configs/supabase");
const shortMonths = require("../../../utils/months-array");

const getYearCategoriesByMonths = async (req, res) => {
  const { userId, status, year } = req.params;
  try {
    const { data, error } = await supabase
      .from("tx")
      .select("date, type, category, value")
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

    const monthlySummary = { incomes: {}, expenses: {} };

    data.forEach((tx) => {
      const month = new Date(tx.date)
        .toLocaleString("default", { month: "short" })
        .toLowerCase();
      const { type, category, value } = tx;

      const summaryType = type === "income" ? "incomes" : "expenses";

      if (!monthlySummary[summaryType][month]) {
        monthlySummary[summaryType][month] = {};
      }

      if (!monthlySummary[summaryType][month][category]) {
        monthlySummary[summaryType][month][category] = 0;
      }

      monthlySummary[summaryType][month][category] += value;
    });

    const orderedMonthlySummary = { incomes: {}, expenses: {} };

    shortMonths.forEach((month) => {
      if (monthlySummary.incomes[month]) {
        orderedMonthlySummary.incomes[month] = monthlySummary.incomes[month];
      }
      if (monthlySummary.expenses[month]) {
        orderedMonthlySummary.expenses[month] = monthlySummary.expenses[month];
      }
    });

    res.status(200).json(orderedMonthlySummary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYearCategoriesByMonths;
