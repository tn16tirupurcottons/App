import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Min 6 characters").required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // Trim inputs
        const email = values.email.trim();
        const password = values.password.trim();

        // Debug: Ensure correct values are sent
        console.log("Login payload (frontend):", { email, password });

        // Call backend login
        await login(email, password);

        // On success → redirect
        navigate("/");
      } catch (err) {
        setErrors({ general: err.response?.data?.message || "Login failed" });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="max-w-md mx-auto p-6 mt-12">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <form onSubmit={formik.handleSubmit} className="space-y-3">

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        {formik.errors.email && <p className="text-red-600 text-sm">{formik.errors.email}</p>}

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formik.values.password}
          onChange={formik.handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        {formik.errors.password && <p className="text-red-600 text-sm">{formik.errors.password}</p>}

        {formik.errors.general && <p className="text-red-600 text-sm">{formik.errors.general}</p>}

        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-orange-500 text-white py-2 rounded"
        >
          {formik.isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
