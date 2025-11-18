import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isAdminLogin, setIsAdminLogin] = useState(false);

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
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
          <p className="text-gray-600">
            {isAdminLogin ? "Admin Access" : "Welcome back to TN16"}
          </p>
        </div>

        <div className="mb-6 flex gap-2 bg-gray-100 rounded-full p-1">
          <button
            type="button"
            onClick={() => setIsAdminLogin(false)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition ${
              !isAdminLogin
                ? "bg-pink-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setIsAdminLogin(true)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition ${
              isAdminLogin
                ? "bg-pink-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder={isAdminLogin ? "admin@example.com" : "your@email.com"}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border-2 border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:border-pink-500 transition"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border-2 border-gray-200 rounded-full px-4 py-3 focus:outline-none focus:border-pink-500 transition"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-600 text-sm mt-1">{formik.errors.password}</p>
            )}
          </div>

          {formik.errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">{formik.errors.general}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            {formik.isSubmitting ? "Logging in..." : "Login"}
          </button>

          {!isAdminLogin && (
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-pink-600 font-semibold hover:text-pink-700">
                Register here
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
