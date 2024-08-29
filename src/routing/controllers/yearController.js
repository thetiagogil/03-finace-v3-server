const supabase = require("../../configs/supabase");

const TxController = {
  getAllYearsByStatus: async (req, res) => {
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
        res.status(404).json({ message: "No transactions found" });
        return;
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
  },

  getYearByStatus: async (req, res) => {
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

      if (!data || data.length === 0) {
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
  },

  getYearCategorySummaryByStatus: async (req, res) => {
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
        res.status(404).json({ message: "No transactions found" });
        return;
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

      const months = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];
      const orderedMonthlySummary = { incomes: {}, expenses: {} };

      months.forEach((month) => {
        if (monthlySummary.incomes[month]) {
          orderedMonthlySummary.incomes[month] = monthlySummary.incomes[month];
        }
        if (monthlySummary.expenses[month]) {
          orderedMonthlySummary.expenses[month] =
            monthlySummary.expenses[month];
        }
      });

      res.status(200).json(orderedMonthlySummary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getYearTopMonthsByStatus: async (req, res) => {
    const { userId, year, status } = req.params;
    try {
      const { data, error } = await supabase
        .from("tx")
        .select("type, date, value")
        .eq("user_id", userId)
        .eq("status", status)
        .gte("date", `${year}-01-01`)
        .lte("date", `${year}-12-31`);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        res.status(404).json({
          message:
            "No transactions found for the specified user, year, and status",
        });
        return;
      }

      let incomesByMonth = {};
      let expensesByMonth = {};

      data.forEach((tx) => {
        const { type, date, value } = tx;
        const month = new Date(date)
          .toLocaleString("default", { month: "short" })
          .toLowerCase();

        if (type === "income") {
          if (!incomesByMonth[month]) {
            incomesByMonth[month] = 0;
          }
          incomesByMonth[month] += value;
        } else if (type === "expense") {
          if (!expensesByMonth[month]) {
            expensesByMonth[month] = 0;
          }
          expensesByMonth[month] += value;
        }
      });

      const sortedIncomes = Object.entries(incomesByMonth)
        .sort(([, a], [, b]) => b - a)
        .map(([month, value]) => ({ month, value }));

      const sortedExpenses = Object.entries(expensesByMonth)
        .sort(([, a], [, b]) => b - a)
        .map(([month, value]) => ({ month, value }));

      const result = {
        incomes: sortedIncomes,
        expenses: sortedExpenses,
      };

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getYearTopCategoriesByStatus: async (req, res) => {
    const { userId, year, status } = req.params;
    try {
      const { data, error } = await supabase
        .from("tx")
        .select("type, category, value")
        .eq("user_id", userId)
        .eq("status", status)
        .gte("date", `${year}-01-01`)
        .lte("date", `${year}-12-31`);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        res.status(404).json({
          message:
            "No transactions found for the specified user, year, and status",
        });
        return;
      }

      let incomesByCategory = {};
      let expensesByCategory = {};

      data.forEach((tx) => {
        const { type, category, value } = tx;

        if (type === "income") {
          if (!incomesByCategory[category]) {
            incomesByCategory[category] = 0;
          }
          incomesByCategory[category] += value;
        } else if (type === "expense") {
          if (!expensesByCategory[category]) {
            expensesByCategory[category] = 0;
          }
          expensesByCategory[category] += value;
        }
      });

      const sortedIncomes = Object.entries(incomesByCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([category, value]) => ({ category, value }));

      const sortedExpenses = Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([category, value]) => ({ category, value }));

      const result = {
        incomes: sortedIncomes.slice(0, 5),
        expenses: sortedExpenses.slice(0, 5),
      };

      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getYearMonthTotalsByStatus: async (req, res) => {
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

      if (!data || data.length === 0) {
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
  },
};

module.exports = TxController;
