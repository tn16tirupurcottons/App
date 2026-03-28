import React, { useContext, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useToast } from "../components/Toast";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP Verification
  const [otpMethod, setOtpMethod] = useState("email"); // email or mobile
  const [otpSent, setOtpSent] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [devOtp, setDevOtp] = useState(null); // For dev mode OTP display

  // Step 1: User Details Form
  const detailsFormik = useFormik({
    initialValues: { 
      name: "", 
      email: "", 
      mobileNumber: "", 
      password: ""
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Your name is required")
        .min(2, "Name must be at least 2 characters"),
      email: Yup.string()
        .email("Enter a valid email address")
        .required("Email is required")
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Please enter a valid email address"
        ),
      mobileNumber: Yup.string()
        .test("mobile-optional", "Enter valid 10-digit Indian mobile number", (value) => {
          if (!value || value.trim() === "") return true; // Optional
          const cleaned = value.replace(/^\+91/, "").replace(/\D/g, "");
          return /^[6-9]\d{9}$/.test(cleaned);
        }),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        // Determine OTP method: prefer email if both provided
        const method = values.email ? "email" : "mobile";
        const identifier = method === "email" ? values.email.trim() : values.mobileNumber.replace(/^\+91/, "").replace(/\D/g, "");
        
        if (!identifier) {
          setErrors({ general: "Email or mobile number is required for OTP verification" });
          setSubmitting(false);
          return;
        }

        setOtpMethod(method);
        setOtpIdentifier(identifier);

        // Send OTP
        setOtpLoading(true);
        const res = await axiosClient.post("/auth/send-otp", {
          identifier,
          method,
        });

        setOtpSent(true);
        setStep(2);
        
        // Show dev OTP if provided (development mode)
        if (res.data.devOtp) {
          setDevOtp(res.data.devOtp);
          toast.info("Check server console for OTP (development mode)");
        } else {
          toast.success(res.data.message || `OTP sent to your ${method === "email" ? "email" : "mobile number"}`);
        }

        // Store form values for final registration
        localStorage.setItem("pendingRegistration", JSON.stringify(values));
      } catch (err) {
        setErrors({
          general: err.response?.data?.message || "Failed to send OTP. Please try again.",
        });
        toast.error(err.response?.data?.message || "Failed to send OTP");
      } finally {
        setOtpLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Step 2: OTP Verification Form
  const otpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required("OTP is required")
        .matches(/^\d{6}$/, "OTP must be 6 digits"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        setVerificationError("");
        const pendingData = JSON.parse(localStorage.getItem("pendingRegistration") || "{}");
        
        if (!pendingData.name || !pendingData.email || !pendingData.password) {
          setErrors({ general: "Registration data missing. Please start over." });
          setSubmitting(false);
          return;
        }

        // Verify OTP and register
        const res = await axiosClient.post("/auth/verify-otp-register", {
          name: pendingData.name,
          email: pendingData.email,
          mobileNumber: pendingData.mobileNumber || null,
          password: pendingData.password,
          otp: values.otp,
          identifier: otpIdentifier,
        });

        // Clear pending registration
        localStorage.removeItem("pendingRegistration");
        
        // Store token if provided
        const token = res.data.accessToken || res.data.token;
        if (token) {
          localStorage.setItem("tn16_token", token);
          // Trigger auth update
          window.dispatchEvent(new Event("auth-update"));
        }

        toast.success(res.data.message || "Registration successful!");
        
        // Redirect to home
        setTimeout(() => {
          navigate("/");
          window.location.reload(); // Reload to update auth state
        }, 1000);
      } catch (err) {
        setVerificationError(err.response?.data?.message || "Invalid OTP. Please try again.");
        setErrors({
          general: err.response?.data?.message || "Invalid or expired OTP. Please try again.",
        });
        toast.error(err.response?.data?.message || "Invalid OTP");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResendOtp = async () => {
    try {
      setOtpLoading(true);
      setVerificationError("");
      const res = await axiosClient.post("/auth/send-otp", {
        identifier: otpIdentifier,
        method: otpMethod,
      });

      // Update dev OTP if provided
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
        toast.info("OTP resent. Check server console (development mode)");
      } else {
        toast.success("OTP resent successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBackToDetails = () => {
    setStep(1);
    setOtpSent(false);
    setDevOtp(null);
    setVerificationError("");
    otpFormik.resetForm();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 text-dark">
      <div className="max-w-lg w-full card p-8 md:p-10 space-y-6">
        {step === 1 ? (
          <>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.4em] text-muted">
                Create Account
              </p>
              <h2 className="text-3xl font-display">Join TNEXT™</h2>
              <p className="text-sm text-muted">
                Create a secure account to unlock wishlists, exclusive drops, and
                priority support.
              </p>
            </div>

            <form onSubmit={detailsFormik.handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Name *</label>
                  <input
                    name="name"
                    value={detailsFormik.values.name}
                    onChange={detailsFormik.handleChange}
                    onBlur={detailsFormik.handleBlur}
                    className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
                    placeholder="Your full name"
                  />
                  {detailsFormik.touched.name && detailsFormik.errors.name && (
                    <p className="text-red-600 text-xs mt-1">{detailsFormik.errors.name}</p>
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
                      value={detailsFormik.values.mobileNumber.replace(/^\+91/, "")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        detailsFormik.setFieldValue("mobileNumber", val ? `+91${val}` : "");
                      }}
                      onBlur={detailsFormik.handleBlur}
                      className="flex-1 border border-border bg-white rounded-r-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
                      placeholder="9876543210"
                      maxLength={10}
                    />
                  </div>
                  {detailsFormik.touched.mobileNumber && detailsFormik.errors.mobileNumber && (
                    <p className="text-red-600 text-xs mt-1">
                      {detailsFormik.errors.mobileNumber}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={detailsFormik.values.email}
                  onChange={detailsFormik.handleChange}
                  onBlur={detailsFormik.handleBlur}
                  className="w-full border border-border bg-white rounded-full px-4 py-3 text-dark focus:outline-none focus:border-primary"
                  placeholder="you@example.com"
                />
                {detailsFormik.touched.email && detailsFormik.errors.email && (
                  <p className="text-red-600 text-xs mt-1">{detailsFormik.errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Password *
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={detailsFormik.values.password}
                    onChange={detailsFormik.handleChange}
                    onBlur={detailsFormik.handleBlur}
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
                {detailsFormik.touched.password && detailsFormik.errors.password && (
                  <p className="text-red-600 text-xs mt-1">
                    {detailsFormik.errors.password}
                  </p>
                )}
              </div>

              {detailsFormik.errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
                  {detailsFormik.errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={detailsFormik.isSubmitting || otpLoading}
                className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
              >
                {otpLoading ? "Sending OTP..." : detailsFormik.isSubmitting ? "Processing..." : "Send OTP"}
              </button>

              <p className="text-center text-sm text-muted">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <button
                onClick={handleBackToDetails}
                className="flex items-center gap-2 text-muted hover:text-dark mb-4 transition"
              >
                <FaArrowLeft size={14} />
                <span className="text-sm">Back</span>
              </button>
              <p className="text-xs uppercase tracking-[0.4em] text-muted">
                Verify OTP
              </p>
              <h2 className="text-3xl font-display">Enter Verification Code</h2>
              <p className="text-sm text-muted">
                We've sent a 6-digit OTP to your {otpMethod === "email" ? "email" : "mobile number"}
                {otpMethod === "email" ? ` (${otpIdentifier})` : ` (+91${otpIdentifier})`}
              </p>
            </div>

            {/* Dev Mode OTP Display */}
            {devOtp && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl px-4 py-3">
                <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Development Mode</p>
                <p className="text-xs text-yellow-700 mb-2">Email/SMS service not configured. Use this OTP:</p>
                <p className="text-2xl font-mono font-bold text-yellow-900 text-center tracking-widest">{devOtp}</p>
              </div>
            )}

            <form onSubmit={otpFormik.handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Enter 6-digit OTP *
                </label>
                <input
                  name="otp"
                  type="text"
                  value={otpFormik.values.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                    otpFormik.setFieldValue("otp", val);
                  }}
                  onBlur={otpFormik.handleBlur}
                  className="w-full border border-border bg-white rounded-full px-4 py-3 text-center text-2xl font-mono tracking-widest text-dark focus:outline-none focus:border-primary"
                  placeholder="000000"
                  maxLength={6}
                />
                {otpFormik.touched.otp && otpFormik.errors.otp && (
                  <p className="text-red-600 text-xs mt-1">{otpFormik.errors.otp}</p>
                )}
                {verificationError && (
                  <p className="text-red-600 text-xs mt-1">{verificationError}</p>
                )}
              </div>

              {otpFormik.errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
                  {otpFormik.errors.general}
                </div>
              )}

              <button
                type="submit"
                disabled={otpFormik.isSubmitting}
                className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.3em] uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
              >
                {otpFormik.isSubmitting ? "Verifying..." : "Verify & Create Account"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Sending..." : "Resend OTP"}
                </button>
                <p className="text-xs text-muted mt-2">
                  OTP is valid for 10 minutes
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
