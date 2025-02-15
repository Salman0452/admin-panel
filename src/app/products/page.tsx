"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";
import Sidebar from "@/components/custom/Sidebar";
import Navbar from "@/components/custom/Navbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import UpdateProductDialog from "@/components/custom/UpdateDialog";
import Image from "next/image";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  // const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null as File | null,
  });

  useEffect(() => {
    NProgress.start();
    fetchProducts();
    refreshProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data);
    }
    setLoading(false);
    NProgress.done();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.image) {
      alert("Please fill all fields and select an image.");
      return;
    }

    setLoading(true);

    // Upload Image to Supabase Storage
    const { data: imageData, error: imageError } = await supabase.storage
      .from("products")
      .upload(`images/${Date.now()}-${formData.image.name}`, formData.image);

    if (imageError) {
      console.error("Error uploading image:", imageError);
      setLoading(false);
      return;
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${imageData.path}`;

    // Insert product into database
    const { error } = await supabase.from("products").insert([
      {
        name: formData.name,
        price: Number(formData.price),
        description: formData.description,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      console.error("Error adding product:", error);
    } else {
      fetchProducts(); // Refresh product list
      setOpen(false); // Close modal
      setFormData({ name: "", price: "", description: "", image: null }); // Reset form
    }

    setLoading(false);

  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error("Error deleting product:", error);
    else setProducts(products.filter((product) => product.id !== id));
};

const refreshProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data);
      }
  };


//   if (loading) return <p>Loading...</p>;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Products</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default">ADD Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <Input name="name" placeholder="Product Name" onChange={handleChange} />
                  <Input name="price" type="number" placeholder="Price" onChange={handleChange} />
                  <Input name="description" placeholder="Description" onChange={handleChange} />
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Product Table */}
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Image</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Description</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border">
                  <td className="p-2 border">{product.id}</td>
                  <td className="p-2 border">
                    <Image src={product.image_url} alt={product.name} className="h-12 w-12 object-cover rounded" />
                  </td>
                  <td className="p-2 border">{product.name}</td>
                  <td className="p-2 border">Rs {product.price}</td>
                  <td className="p-2 border">{product.description}</td>
                  <td>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                            <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => { setSelectedProduct(product); setOpen(true); }}>
                                Update
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  {selectedProduct && (
                    <UpdateProductDialog
                        open={open}
                        setOpen={setOpen}
                        product={selectedProduct}
                        refreshProducts={refreshProducts} // Refresh list after update
                    />
                    )}
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <p>Loading...</p>}
        </div>
      </div>
    </div>
  );
}
