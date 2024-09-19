const supabase = require("../../configs/supabase");
const getMonthNumber = require("../../utils/getMonthNumber");

const TxController = {
  hasTx: async (req, res) => {
    const { userId } = req.params;
    try {
      const { data, error } = await supabase
        .from("tx")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (error) throw error;
      const hasData = data.length > 0;
      res.status(200).json(hasData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createTx: async (req, res) => {
    const { user_id, type, status, category, date, value, description } =
      req.body;
    const txData = {
      user_id,
      type,
      status,
      category,
      date,
      value,
      description,
    };
    try {
      const { data, error } = await supabase.from("tx").insert(txData).select();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getTxByStatus: async (req, res) => {
    const { userId, status, year, month } = req.params;
    try {
      let query = supabase
        .from("tx")
        .select("*")
        .eq("user_id", userId)
        .eq("status", status);

      if (year) {
        if (month) {
          const monthNumber = getMonthNumber(month);
          const monthStart = `${year}-${monthNumber}-01`;
          const nextMonthStart = new Date(year, parseInt(monthNumber, 10), 1);
          const monthEnd = new Date(nextMonthStart.getTime() - 1);
          const monthEndISO = monthEnd.toISOString().slice(0, 10);

          query = query.gte("date", monthStart).lte("date", monthEndISO);
        } else {
          query = query
            .gte("date", `${year}-01-01`)
            .lte("date", `${year}-12-31`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ message: "No transactions found" });
      }

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateTxById: async (req, res) => {
    const { txId } = req.params;
    const { type, status, category, date, value, description } = req.body;
    const txData = { type, status, category, date, value, description };
    try {
      const { data, error } = await supabase
        .from("tx")
        .update(txData)
        .eq("id", txId)
        .select();

      if (error) throw error;

      if (!data) {
        res.status(404).json({ message: "No transactions found" });
      } else {
        res.status(200).json(data);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteTxById: async (req, res) => {
    const { txId } = req.params;
    try {
      const { error } = await supabase.from("tx").delete().eq("id", txId);

      if (error) throw error;

      res.status(200).json({ message: "Transaction successfully deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = TxController;
