const db = require("../config/db");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async (req, res) => {
  try {
    const { rows } = await db.query("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.createUser = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    // Check if user exists
    const userRes = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userRes.rows.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { rows } = await db.query(
      "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role",
      [username, password_hash, role]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role",
      [role, id]
    );
    if (rows.length === 0) return res.status(404).json({ msg: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    if (rows.length === 0) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
