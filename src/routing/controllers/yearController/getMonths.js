const supabase = require("../../../configs/supabase");

const getYearMonths = async (req, res) => {
  const { userId, year } = req.params;
  try {
    const { data, error } = await supabase
      .from("tx")
      .select("date")
      .eq("user_id", userId)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`);

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const monthsWithData = {};

    data.forEach((tx) => {
      const month = new Date(tx.date).getMonth();
      monthsWithData[month] = true;
    });

    const monthsWithDataNames = Object.keys(monthsWithData).map(
      (monthIndex) => {
        const fullMonthName = new Date(year, parseInt(monthIndex), 1)
          .toLocaleString("en-US", { month: "short" })
          .toLowerCase();
        return fullMonthName;
      }
    );

    res.status(200).json(monthsWithDataNames);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYearMonths;
