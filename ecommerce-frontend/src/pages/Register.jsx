import React, { useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      email: Yup.string().email("Invalid").required("Required"),
      password: Yup.string().min(6, "Min 6").required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        await register(values);
        navigate("/");
      } catch (err) {
        setErrors({ general: err.response?.data?.message || "Register failed" });
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create account</h2>
      <form onSubmit={formik.handleSubmit} className="space-y-3">
        <input name="name" onChange={formik.handleChange} value={formik.values.name} placeholder="Full name" className="w-full border px-3 py-2 rounded" />
        <input name="email" onChange={formik.handleChange} value={formik.values.email} placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <input name="password" type="password" onChange={formik.handleChange} value={formik.values.password} placeholder="Password" className="w-full border px-3 py-2 rounded" />
        {formik.errors.general && <div className="text-sm text-red-600">{formik.errors.general}</div>}
        <button type="submit" disabled={formik.isSubmitting} className="w-full bg-orange-500 text-white py-2 rounded">Sign up</button>
      </form>
    </div>
  );
}
