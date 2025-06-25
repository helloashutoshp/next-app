"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../lib/api";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { ProductFormInputs } from "../../../../types/product";

const EditProduct = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [product, setProduct] = useState<any>(null);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ProductFormInputs>();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await api.get(`/products/${id}/edit`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        setProduct(response.data);
        reset({
          title: response.data.title,
          description: response.data.description,
          cost: response.data.cost,
        });
        setBannerPreviews(response.data.images?.map((img: any) => img.image) || []);
      } catch (error: any) {
        toast.error("Failed to fetch product data.");
      } finally {
        setIsFetching(false);
      }
    };
    if (id) fetchProduct();
  }, [id, reset]);

  const handleRemoveBannerImage = (idxToRemove: number) => {
    setBannerPreviews((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    setBannerFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      bannerFiles.forEach((file, idx) => {
        if (idx !== idxToRemove) {
          dt.items.add(file);
        }
      });
      fileInputRef.current.files = dt.files;
    }
  };

  const onSubmit = async (data: ProductFormInputs) => {
    setIsLoading(true);
    try {
      if ((bannerPreviews.length === 0) && (!bannerFiles || bannerFiles.length === 0)) {
        setError("banner", { type: "manual", message: "At least one image is required" });
        setIsLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("cost", String(data.cost));
      bannerFiles.forEach((file) => {
        formData.append("images[]", file);
      });
      console.log([...formData.entries()]);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      await api.post(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      toast.success("Product updated!");
      router.push("/dashboard");
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.entries(validationErrors).forEach(([field, messages]) => {
          setError(field as keyof ProductFormInputs, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        toast.error("Server validation failed.");
      } else {
        toast.error("Failed to update product. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <div className="spinner-border text-primary" role="status" aria-label="Loading">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card p-4">
              <h4>Edit Product</h4>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <input
                  className={`form-control mb-2 ${errors.title ? "is-invalid" : ""}`}
                  placeholder="Title"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}

                <input
                  className={`form-control mb-2 ${errors.description ? "is-invalid" : ""}`}
                  placeholder="Description"
                  {...register("description", { required: "Description is required" })}
                />
                {errors.description && (
                  <div className="invalid-feedback d-block">{errors.description.message}</div>
                )}

                <input
                  className={`form-control mb-2 ${errors.cost ? "is-invalid" : ""}`}
                  placeholder="Cost"
                  type="number"
                  step="0.01"
                  {...register("cost", {
                    required: "Cost is required",
                    valueAsNumber: true,
                    min: { value: 0, message: "Cost must be positive" },
                  })}
                />
                {errors.cost && <div className="invalid-feedback d-block">{errors.cost.message}</div>}

                <input
                  className={`form-control mb-2 ${errors.banner ? "is-invalid" : ""}`}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const previews = Array.from(files).map((file) => URL.createObjectURL(file));
                      setBannerPreviews([...bannerPreviews, ...previews]);
                      setBannerFiles([...bannerFiles, ...Array.from(files)]);
                      clearErrors("banner");
                    }
                  }}
                  ref={fileInputRef}
                />
                {errors.banner && <div className="invalid-feedback d-block">{errors.banner.message}</div>}

                <div className="mb-2 d-flex flex-wrap gap-2">
                  {bannerPreviews.map((src, idx) => (
                    <div key={idx} style={{ position: "relative", display: "inline-block" }}>
                      <img
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        style={{ width: "100px", height: "100px", objectFit: "cover", display: "block", borderRadius: "4px" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBannerImage(idx)}
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          background: "rgba(0,0,0,0.6)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "16px",
                          lineHeight: "1"
                        }}
                        aria-label={`Remove image ${idx + 1}`}
                        tabIndex={0}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Product"}
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct; 