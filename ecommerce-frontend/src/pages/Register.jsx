import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useToast } from "../components/Toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { 
      name: "", 
      email: "", 
      mobileNumber: "", 
      password: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Your name is required"),
      email: Yup.string().email("Enter a valid email address").required("Email is required"),
      mobileNumber: Yup.string()
        .test("mobile-optional", "Enter valid 10-digit Indian mobile number", (value) => {
          if (!value || value.trim() === "") return true; // Optional
          return /^\+?91[6-9]\d{9}$/.test(value.replace(/^\+91/, "91"));
        }),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // Direct registration without OTP - just email validation
        await register({
          name: values.name,
          email: values.email,
          mobileNumber: values.mobileNumber && values.mobileNumber.trim() ? values.mobileNumber : null,
          password: values.password,
        });
        toast.success("Registration successful!");
        navigate("/");
      } catch (err) {
        setErrors({
          general: err.response?.data?.message || "Registration failed. Please try again.",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-dark">
      <div className="max-w-lg w-full card p-8 md:p-10 space-y-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            Insider access
          </p>
          <h2 className="text-3xl font-display">Join TN16 Studio</h2>
          <p className="text-sm text-muted">
            Create a secure account to unlock wishlists, insider drops, and
            priority support.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Name</label>
              <input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
                placeholder="Your full name"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-600 text-xs mt-1">{formik.errors.name}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Mobile number <span className="text-muted text-xs">(Optional)</span>
              </label>
              <div className="flex items-stretch gap-2">
                <span className="text-muted font-medium px-3 py-3 border border-border bg-gray-50 rounded-l-full flex items-center text-sm">+91</span>
                <input
                  name="mobileNumber"
                  value={formik.values.mobileNumber.replace(/^\+91/, "")}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    formik.setFieldValue("mobileNumber", val ? `+91${val}` : "");
                  }}
                  onBlur={formik.handleBlur}
                  className="flex-1 border border-border bg-white rounded-r-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                <p className="text-red-600 text-xs mt-1">
                  {formik.errors.mobileNumber}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Email</label>
            <input
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
              placeholder="you@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-600 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-border bg-white rounded-full px-4 py-3 pr-12 text-dark focus:outline-none focus:border-primary"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-4 flex items-center text-muted hover:text-dark"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-600 text-xs mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {formik.errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
              {formik.errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
          >
            {formik.isSubmitting ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
