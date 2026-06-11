"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  createdAt: string;
}

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or greater"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["products", id],
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (product) reset(product);
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.put(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated");
      setIsEditing(false);
    },
    onError: () => toast.error("Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      router.push("/dashboard/products");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/products")}
          aria-label="Back to products"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Product details</CardTitle>
          {!isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300"
                onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(); }}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Delete product</span>
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form
              onSubmit={handleSubmit((data) => updateMutation.mutateAsync(data))}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
                {errors.name && <p role="alert" className="text-xs text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" {...register("description")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" step="0.01" aria-invalid={!!errors.price} {...register("price")} />
                  {errors.price && <p role="alert" className="text-xs text-red-400">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" aria-invalid={!!errors.stock} {...register("stock")} />
                  {errors.stock && <p role="alert" className="text-xs text-red-400">{errors.stock.message}</p>}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setIsEditing(false); reset(product); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                  Save changes
                </Button>
              </div>
            </form>
          ) : (
            <dl className="space-y-4 text-sm">
              {[
                { label: "Description", value: product.description ?? "—" },
                { label: "Price", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(product.price) },
                { label: "Added", value: new Date(product.createdAt).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <dt className="w-24 shrink-0 text-muted-foreground">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 text-muted-foreground">Stock</dt>
                <dd>
                  <Badge variant={product.stock === 0 ? "destructive" : "secondary"} className="font-mono">
                    {product.stock}
                  </Badge>
                </dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
