'use client'

import Link from "next/link";

import { RegisterFormInputs } from "../../types/register";
import { useForm } from "react-hook-form";


const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const onSubmit = (data: RegisterFormInputs) => {
    // Handle registration logic here
    // e.g., send data to API
    console.log(data);
  };

  const password = watch("password", "");

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4" style={{ width: 400 }}>
          <h3 className="text-center">Register</h3>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <input
              className={`form-control mb-2 ${errors.name ? "is-invalid" : ""}`}
              {...register("name", {
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              })}
              type="text"
              placeholder="Name"
            />
            {errors.name && (
              <div className="invalid-feedback d-block mb-2">{errors.name.message}</div>
            )}

            <input
              className={`form-control mb-2 ${errors.email ? "is-invalid" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
              type="email"
              placeholder="Email"
            />
            {errors.email && (
              <div className="invalid-feedback d-block mb-2">{errors.email.message}</div>
            )}

            <input
              className={`form-control mb-2 ${errors.password ? "is-invalid" : ""}`}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
              type="password"
              placeholder="Password"
            />
            {errors.password && (
              <div className="invalid-feedback d-block mb-2">{errors.password.message}</div>
            )}

            <input
              className={`form-control mb-2 ${errors.password_confirmation ? "is-invalid" : ""}`}
              {...register("password_confirmation", {
                required: "Please confirm your password",
                validate: (value: string) =>
                  value === password || "Passwords do not match",
              })}
              type="password"
              placeholder="Confirm Password"
            />
            {errors.password_confirmation && (
              <div className="invalid-feedback d-block mb-2">
                {errors.password_confirmation.message}
              </div>
            )}

            <button className="btn btn-primary w-100" type="submit">
              Register
            </button>
          </form>
          <p className="mt-3 text-center">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
