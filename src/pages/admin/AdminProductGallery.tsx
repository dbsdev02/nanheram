import { useEffect, useState, useRef } from "react";
import { X, Upload, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type GalleryProps = {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AdminProductGallery = ({ productId, productName, open, onOpenChange }: GalleryProps) => {
  const { toast } = useToast();
  const [images, setImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });
    setImages(data || []);
  };

  useEffect(() => {
    if (open && productId) load();
  }, [open, productId]);

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    const currentMax = images.length > 0 ? Math.max(...images.map(i => i.sort_order)) : -1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `gallery/${productId}/${Date.now()}-${i}.${ext}`;

      const { error } = await supabase.storage.from("product-media").upload(path, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/product-media/${path}`;
      await supabase.from("product_images").insert({
        product_id: productId,
        image_url: publicUrl,
        sort_order: currentMax + 1 + i,
      });
    }

    setUploading(false);
    toast({ title: "Images uploaded" });
    load();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadImages(e.target.files);
    e.target.value = "";
  };

  const deleteImage = async (id: string) => {
    await supabase.from("product_images").delete().eq("id", id);
    toast({ title: "Image removed" });
    load();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Gallery — {productName}</DialogTitle>
        </DialogHeader>

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map(img => (
            <div key={img.id} className="group relative rounded-lg border border-border overflow-hidden bg-muted">
              <img src={img.image_url} alt="" className="h-28 w-full object-cover" />
              <button
                onClick={() => deleteImage(img.id)}
                className="absolute top-1 right-1 rounded-full bg-background/80 p-1 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex h-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border bg-muted/50 text-muted-foreground hover:border-primary/50 hover:bg-muted transition-colors"
          >
            {uploading ? (
              <span className="text-xs">Uploading...</span>
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="text-xs">Add Images</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">{images.length} image{images.length !== 1 ? "s" : ""} in gallery</p>
      </DialogContent>
    </Dialog>
  );
};

export default AdminProductGallery;
