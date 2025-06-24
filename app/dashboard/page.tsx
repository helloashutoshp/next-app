"use client";
import Navbar from "@/components/Navbar";
import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Product, ProductFormInputs } from "../../types/product";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<ProductFormInputs>();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    setIsProductLoading(true);
    try {
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await api.get('/showproducts', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // The response may be paginated, so check for .data or .data.data
      let productList: Product[] = [];
      if (Array.isArray(response.data)) {
        productList = response.data;
      } else if (Array.isArray(response.data.data)) {
        productList = response.data.data;
      } else if (Array.isArray(response.data.products)) {
        productList = response.data.products;
      }
      // Map to include banner as first image if available
      setProducts(
        productList.map((p: any) => ({
          ...p,
          banner: p.images?.[0]?.image || "#",
        }))
      );
    } catch (error: any) {
      toast.error("Failed to fetch products.");
    } finally {
      setIsProductLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper to update both previews and files when removing an image
  const handleRemoveBannerImage = (idxToRemove: number) => {
    setBannerPreviews((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    setBannerFiles((prev) => prev.filter((_, idx) => idx !== idxToRemove));
    // Also update the file input's files (not possible directly, so clear and re-add)
    if (fileInputRef.current) {
      // Create a new DataTransfer to hold the remaining files
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
      // Use bannerFiles instead of data.banner for upload
      if (!bannerFiles || bannerFiles.length === 0) {
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
      bannerFiles.forEach((file) => {
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

      // Add the new product to the list
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
      setBannerFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchProducts(); // Refetch the list to get fresh images
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const previews = Array.from(files).map((file) => URL.createObjectURL(file));
                      setBannerPreviews(previews);
                      setBannerFiles(Array.from(files));
                      clearErrors("banner");
                    } else {
                      setBannerPreviews([]);
                      setBannerFiles([]);
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
                  {isLoading ? "Adding..." : "Add Product"}
                </button>
              </form>
            </div>
          </div>
          <div className="col-md-6">
            {isProductLoading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                <div className="spinner-border text-primary" role="status" aria-label="Loading">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
