const supabase = require("../../../configs/supabase");
const shortMonths = require("../../../utils/months-array");

const getYearTotals = async (req, res) => {
  const { userId, year } = req.params;
  try {
    const { data, error } = await supabase
      .from("tx")
      .select("date, type, value, status")
      .eq("user_id", userId)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);

    if (error) {
      throw error;
    }

    const monthsStatusTotals = shortMonths.reduce((acc, month) => {
      acc[month] = {
        totalIncomesTracked: 0,
        totalExpensesTracked: 0,
        totalIncomesPlanned: 0,
        totalExpensesPlanned: 0,
      };
      return acc;
    }, {});

    data.forEach((tx) => {
      const { date, type, value, status } = tx;
      const monthIndex = parseInt(date.slice(5, 7), 10) - 1;
      const month = shortMonths[monthIndex];

      if (status === "tracked") {
        if (type === "income") {
          monthsStatusTotals[month].totalIncomesTracked += value;
        } else {
          monthsStatusTotals[month].totalExpensesTracked += value;
        }
      } else if (status === "planned") {
        if (type === "income") {
          monthsStatusTotals[month].totalIncomesPlanned += value;
        } else {
          monthsStatusTotals[month].totalExpensesPlanned += value;
        }
      }
    });

    const sortedMonthsStatusTotals = Object.keys(monthsStatusTotals)
      .map((month) => ({
        month,
        ...monthsStatusTotals[month],
      }))
      .sort(
        (a, b) => shortMonths.indexOf(a.month) - shortMonths.indexOf(b.month)
      );

    res.status(200).json(sortedMonthsStatusTotals);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYearTotals;
