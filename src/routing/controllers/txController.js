const supabase = require("../../configs/supabase");

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
    const { userId, status } = req.params;
    try {
      const { data, error } = await supabase
        .from("tx")
        .select("*")
        .eq("user_id", userId)
        .eq("status", status);

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
