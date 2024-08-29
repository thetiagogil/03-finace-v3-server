const supabase = require("../../../configs/supabase");

const getYears = async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from("tx")
      .select("date")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: "No transactions found" });
    }

    const years = [...new Set(data.map(tx => new Date(tx.date).getFullYear()))].sort((a, b) => a - b);

    res.status(200).json(years);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = getYears;
