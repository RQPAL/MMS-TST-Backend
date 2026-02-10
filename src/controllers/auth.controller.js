import { pool } from "../db/pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

/*export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, "Email dan password wajib diisi", 400);
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return successResponse(
      res,
      "Login berhasil",
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      }
    );

  } catch (error) {
    next(error);
  }
  await logAudit({
    user_id: user.id,
    action: "LOGIN",
    entity: "users",
    entity_id: user.id,
    payload: null,
    req
    });

};
*/

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ VALIDASI INPUT
    if (!email || !password) {
      return errorResponse(res, "Email dan password wajib diisi", 400);
    }

    // 2️⃣ AMBIL USER
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return errorResponse(res, "Email atau password salah", 401);
    }

    // 🔑 INI WAJIB
    const user = result.rows[0];

    // 3️⃣ CEK PASSWORD
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return errorResponse(res, "Email atau password salah", 401);
    }

    // 4️⃣ GENERATE JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5️⃣ AUDIT LOGIN
    await logAudit({
      user_id: user.id,
      action: "LOGIN",
      entity: "auth",
      entity_id: user.id,
      payload: { email: user.email },
      req
    });

    // 6️⃣ RESPONSE
    return successResponse(
      res,
      "Login berhasil",
      { token },
      200
    );

  } catch (error) {
    next(error);
  }
};