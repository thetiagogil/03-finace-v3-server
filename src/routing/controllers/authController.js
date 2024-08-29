const supabase = require("../../configs/supabase");

const AuthController = {
  signupUser: async (req, res) => {
    const { firstname, lastname, email, password } = req.body;
    try {
      // Sign up the user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Get the user details from the signUp response
      const user = data.user;
      if (!user) {
        throw new Error("User sign up failed");
      }

      // Insert the user into the 'users' table
      const { error: usersError } = await supabase
        .from("users")
        .insert([{ id: user.id, firstname: firstname, lastname: lastname }]);

      if (usersError) throw usersError;

      res.status(201).json({ data });
    } catch (error) {
      console.error("Signup error:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  loginUser: async (req, res) => {
    const { email, password } = req.body;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      res.status(200).json({ data });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = AuthController;
