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
  const [step, setStep] = useState(1); // 1: Basic info, 2: OTP verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState("");
  const [otpDeliveryMethod, setOtpDeliveryMethod] = useState(""); // "email" or "mobile"
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { 
      name: "", 
      email: "", 
      mobileNumber: "", 
      password: "",
      otp: ""
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Your name is required"),
      email: Yup.string().email("Enter a valid email").required("Email required"),
      mobileNumber: Yup.string()
        .test("mobile-optional", "Enter valid 10-digit Indian mobile number", (value) => {
          if (!value || value.trim() === "") return true; // Optional
          return /^\+?91[6-9]\d{9}$/.test(value.replace(/^\+91/, "91"));
        }),
      password: Yup.string()
        .min(6, "Min 6 characters")
        .required("Password required"),
      otp: Yup.string()
        .when([], {
          is: () => step === 2,
          then: (schema) => schema.required("OTP is required").length(6, "OTP must be 6 digits"),
        }),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        if (step === 1) {
          // Step 1: Send OTP - Always use email for OTP
          if (!values.email) {
            setErrors({ general: "Email is required for OTP verification" });
            return;
          }
          const identifier = values.email;
          const method = "email";
          await axiosClient.post("/auth/send-otp", { 
            identifier,
            method 
          });
          setOtpSent(true);
          setOtpSentTo(identifier);
          setOtpDeliveryMethod(method);
          setStep(2);
          toast.success(`OTP sent to your email`);
        } else {
          // Step 2: Verify OTP and register
          await axiosClient.post("/auth/verify-otp-register", {
            name: values.name,
            email: values.email,
            mobileNumber: values.mobileNumber && values.mobileNumber.trim() ? values.mobileNumber : null,
            password: values.password,
            otp: values.otp,
            identifier: otpSentTo
          });
          toast.success("Registration successful!");
          navigate("/login");
        }
      } catch (err) {
        setErrors({
          general: err.response?.data?.message || (step === 1 ? "Failed to send OTP" : "Registration failed"),
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

          {/* OTP Verification Step */}
          {step === 2 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  OTP Verification
                </p>
                <p className="text-xs text-blue-700">
                  We've sent a 6-digit OTP to {otpDeliveryMethod === "email" ? "your email" : "your mobile number"}: {otpSentTo}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Enter OTP *</label>
                <input
                  name="otp"
                  type="text"
                  value={formik.values.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    formik.setFieldValue("otp", val);
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark text-center text-2xl tracking-widest focus:outline-none focus:border-primary"
                  placeholder="000000"
                  maxLength={6}
                />
                {formik.touched.otp && formik.errors.otp && (
                  <p className="text-red-600 text-xs mt-1">{formik.errors.otp}</p>
                )}
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const identifier = formik.values.email || formik.values.mobileNumber;
                    await axiosClient.post("/auth/send-otp", { 
                      identifier,
                      method: otpDeliveryMethod 
                    });
                    toast.success("OTP resent successfully");
                  } catch (err) {
                    toast.error("Failed to resend OTP");
                  }
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}

          {formik.errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
              {formik.errors.general}
            </div>
          )}

          <div className="flex gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtpSent(false);
                  formik.setFieldValue("otp", "");
                }}
                className="flex-1 border-2 border-gray-300 text-gray-700 rounded-full py-3 font-semibold hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className={`${step === 2 ? "flex-1" : "w-full"} bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90`}
            >
              {formik.isSubmitting 
                ? (step === 1 ? "Sending OTP..." : "Verifying...") 
                : (step === 1 ? "Send OTP" : "Verify & Create Account")
              }
            </button>
          </div>

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
