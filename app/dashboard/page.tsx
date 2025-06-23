"use client";
import Navbar from "@/components/Navbar";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Product, ProductFormInputs } from "../../types/product";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      title: "Sample Product",
      description: "Sample Description",
      cost: 100,
      banner: "#",
    },
  ]);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ProductFormInputs>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: ProductFormInputs) => {
    setIsLoading(true);
    try {
      if (!data.banner || data.banner.length === 0) {
        setError("banner", { type: "manual", message: "At least one image is required" });
        setIsLoading(false);
        return;
      }
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("cost", String(data.cost));
      // Append all images
      Array.from(data.banner).forEach((file) => {
        formData.append("images[]", file);
      });

      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setProducts((prev) => [
        ...prev,
        {
          id: response.data.product.id,
          title: response.data.product.title,
          description: response.data.product.description,
          cost: response.data.product.cost,
          banner: response.data.product.images?.[0]?.image || "#",
        },
      ]);
      toast.success("Product added!");
      reset();
      setBannerPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        toast.error("Failed to add product. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6">
            <div className="card p-4">
              <h4>Add Product</h4>
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
                  {...register("banner", {
                    required: "At least one image is required",
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const previews = Array.from(files).map((file) => URL.createObjectURL(file));
                        setBannerPreviews(previews);
                      } else {
                        setBannerPreviews([]);
                      }
                    }
                  })}
                />
                {errors.banner && <div className="invalid-feedback d-block">{errors.banner.message}</div>}

                <div className="mb-2 d-flex flex-wrap gap-2">
                  {bannerPreviews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      style={{ width: "100px", height: "100px", objectFit: "cover", display: "block" }}
                    />
                  ))}
                </div>

                <button className="btn btn-primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Product"}
                </button>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Banner</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.title}</td>
                    <td>
                      <img
                        src={product.banner}
                        alt="Product"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                      />
                    </td>
                    <td>${product.cost}</td>
                    <td>
                      <button className="btn btn-warning btn-sm me-2" disabled>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" disabled>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
