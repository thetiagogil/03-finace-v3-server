const supabase = require("../../../configs/supabase");
const getMonthNumber = require("../../../utils/getMonthNumber");

const getYearTopTrackedCategories = async (req, res) => {
  const { userId, year, month } = req.params;

  try {
    let query = supabase
      .from("tx")
      .select("type, category, value, status")
      .eq("user_id", userId)
      .eq("status", "tracked");

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

    const summary = {
      incomes: {},
      expenses: {},
    };

    data.forEach((tx) => {
      const { type, category, value } = tx;
      const summaryType = type === "income" ? "incomes" : "expenses";

      if (!summary[summaryType][category]) {
        summary[summaryType][category] = value;
      } else {
        summary[summaryType][category] += value;
      }
    });

    const getTopCategories = (categoryData) => {
      const sortedCategories = Object.entries(categoryData).sort(
        ([, a], [, b]) => b - a
      );

      const topCategories = sortedCategories.slice(0, 4);
      const otherCategories = sortedCategories.slice(4);

      const topCategoryData = topCategories.reduce((acc, [category, value]) => {
        acc[category] = value;
        return acc;
      }, {});

      const otherValue = otherCategories.reduce(
        (sum, [, value]) => sum + value,
        0
      );
      if (otherValue > 0) {
        topCategoryData["others"] = otherValue;
      }

      return topCategoryData;
    };

    const result = {
      incomes: getTopCategories(summary.incomes),
      expenses: getTopCategories(summary.expenses),
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYearTopTrackedCategories;
