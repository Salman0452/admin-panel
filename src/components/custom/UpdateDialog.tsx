"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: number;
  name: string;
  price: number;
}

interface UpdateProductDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  product: Product | null;
  refreshProducts: () => void;
}

export default function UpdateProductDialog({ open, setOpen, product, refreshProducts }:UpdateProductDialogProps) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setPrice(product.price ? product.price.toString() : "");
    }
  }, [product]);

  const handleUpdate = async () => {
    if (!product || !product.id) return;

    setLoading(true);
    const { error } = await supabase
      .from("products")
      .update({ name, price: Number(price) }) // Convert price to a number
      .eq("id", product.id);
    setLoading(false);

    if (error) {
      console.error("Error updating product:", error.message);
      return;
    }

    setOpen(false);
    refreshProducts(); // Refresh the product list after updating
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" />
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">Cancel</Button>
          <Button onClick={handleUpdate} disabled={loading || !name || !price}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
