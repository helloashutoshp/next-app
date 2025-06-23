"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { LoginFormInputs } from "../../types/login";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Login = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const response = await api.post("/login", data);
      if (response.data && response.data.status === true) {
        // Set authToken cookie
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          Cookies.set("authToken", response.data.token, { expires: 7 });
        }
        toast.success("Login successful! Redirecting to dashboard...", {
          duration: 3000,
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((field) => {
          const fieldKey = field as keyof LoginFormInputs;
          setError(fieldKey, {
            type: "server",
            message: validationErrors[field][0],
          });
        });
      } else if (error.response && error.response.status === 401) {
        toast.error("Invalid credentials.");
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: 400 }}>
        <h3 className="text-center">Login</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <input
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              type="email"
              placeholder="Email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>
          <div className="mb-3">
            <input
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              type="password"
              placeholder="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
            )}
          </div>
          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="mt-3 text-center">
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
