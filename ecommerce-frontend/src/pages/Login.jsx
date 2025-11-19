import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Min 6 characters").required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const email = values.email.trim();
        const password = values.password.trim();

        let response;
        if (isAdminLogin) {
          // Admin login via admin endpoint
          response = await axiosClient.post("/admin/login", { email, password });
          
          // Admin endpoint returns both token and accessToken
          const token = response.data.token || response.data.accessToken;
          if (!token) {
            throw new Error("No token received from server");
          }
          
          localStorage.setItem("tn16_token", token);
          
          // Get user from response
          const loggedInUser = response.data?.user;
          if (loggedInUser && loggedInUser.role === "admin") {
            // Trigger auth context update
            window.dispatchEvent(new Event("auth-update"));
            // Navigate to admin panel
            navigate("/admin");
            // Small delay then reload to ensure context updates
            setTimeout(() => window.location.reload(), 500);
            return;
          } else {
            throw new Error("Admin access denied");
          }
        } else {
          // Regular user login
          response = await login(email, password);
        }

        // Get user from response
        const loggedInUser = response.data?.user || response?.user || user;

        // Redirect based on role
        if (loggedInUser?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
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
            {isAdminLogin ? "Admin Access" : "Welcome back"}
          </p>
          <h2 className="text-3xl font-display mt-2 text-dark">Login</h2>
        </div>

        <div className="flex gap-2 bg-light rounded-full p-1">
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            className={`flex-1 py-2 rounded-full text-xs uppercase tracking-[0.3em] transition ${
              !isAdminLogin ? "bg-primary text-white" : "text-muted hover:text-dark"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            className={`flex-1 py-2 rounded-full text-xs uppercase tracking-[0.3em] transition ${
              isAdminLogin ? "bg-primary text-white" : "text-muted hover:text-dark"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark/70 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder={isAdminLogin ? "admin@example.com" : "your@email.com"}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.email}</p>
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
              <p className="text-red-700 text-sm font-medium">{formik.errors.general}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {formik.isSubmitting ? "Logging in..." : "Login"}
          </button>

          {!isAdminLogin && (
            <p className="text-center text-sm text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
