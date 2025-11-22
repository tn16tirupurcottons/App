import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to home (for both admin and regular users)
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: { identifier: "", password: "" },
    validationSchema: Yup.object({
      identifier: Yup.string()
        .required("Email or mobile number is required")
        .test("email-or-mobile", "Enter a valid email or mobile number", (value) => {
          if (!value) return false;
          const trimmed = value.trim();
          // Check if it's an email
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (emailRegex.test(trimmed)) return true;
          // Check if it's a mobile number (10 digits, optionally with +91)
          const mobileRegex = /^(\+91)?[6-9]\d{9}$/;
          const cleaned = trimmed.replace(/^\+91/, "").replace(/\D/g, "");
          return mobileRegex.test(cleaned) || /^[6-9]\d{9}$/.test(cleaned);
        }),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const identifier = values.identifier.trim();
        const response = await login(identifier, values.password.trim());
        // Always redirect to home page after login (for both admin and regular users)
        navigate("/");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Login failed. Please check your credentials.";
        setErrors({ general: errorMessage });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-dark">
      <div className="max-w-md w-full card p-8 md:p-10 space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            Welcome back
          </p>
          <h2 className="text-3xl font-display mt-2 text-dark">Login</h2>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Email or Mobile
            </label>
            <input
              name="identifier"
              type="text"
              placeholder="you@example.com or +919854xxxxxx"
              value={formik.values.identifier}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
            />
            {formik.touched.identifier && formik.errors.identifier && (
              <p className="text-red-600 text-sm mt-1">
                {formik.errors.identifier}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-border bg-white rounded-full px-4 py-3 pr-12 text-dark focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center text-muted hover:text-dark"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.password}</p>
            )}
          </div>

          {formik.errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm font-medium">
                {formik.errors.general}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {formik.isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted">
            <Link to="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Join TN16
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
