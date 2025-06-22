"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "../../lib/api";
import { RegisterFormInputs } from "../../types/register";
import toast from 'react-hot-toast';

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);

    try {
      console.log("Making API call to:", '/register');
      const response = await api.post('/register', data);
      console.log("API response:", response.data);
      
      // Show success toast
      toast.success('Registration successful! Redirecting to login...', {
        duration: 3000,
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error("API error:", error);
      console.error("Error response:", error.response);
      
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((field) => {
          const fieldKey = field as keyof RegisterFormInputs;
          setError(fieldKey, {
            type: "server",
            message: validationErrors[field][0],
          });
        });
        // toast.error('Please correct the validation errors below.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const password = watch("password", "");

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: 400 }}>
        <h3 className="text-center">Register</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <input
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              {...register("name", {
                required: "Name is required",
              })}
              placeholder="Name"
            />
            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
          </div>
          <div className="mb-3">
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Email"
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>
          <div className="mb-3">
            <input
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              placeholder="Password"
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>
          <div className="mb-3">
            <input
              className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
              type="password"
              {...register("password_confirmation", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "The passwords do not match",
              })}
              placeholder="Confirm Password"
            />
            {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        <p className="mt-3 text-center">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;