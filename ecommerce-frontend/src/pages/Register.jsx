import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: "", email: "", mobileNumber: "", password: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Your name is required"),
      email: Yup.string().email("Enter a valid email").required("Email required"),
      mobileNumber: Yup.string()
        .matches(/^\+?[0-9]{8,15}$/, "Enter a valid mobile number")
        .required("Mobile number required"),
      password: Yup.string()
        .min(6, "Min 6 characters")
        .required("Password required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        await register(values);
        navigate("/");
      } catch (err) {
        setErrors({
          general: err.response?.data?.message || "Registration failed",
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
                Mobile number
              </label>
              <input
                name="mobileNumber"
                value={formik.values.mobileNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
                placeholder="+919876543210"
              />
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
            <input
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
              placeholder="Create a strong password"
            />
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
            {formik.isSubmitting ? "Creating..." : "Create account"}
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
