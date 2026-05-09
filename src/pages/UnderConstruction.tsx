import mainlogo from "@/assets/mainlogo.png";
import { Construction } from "lucide-react";

const UnderConstruction = () => {
  return (
    <div className="min-h-screen bg-[#F6F1EA] flex flex-col items-center justify-center px-4 text-center">
      <img src={mainlogo} alt="NanheRam" className="h-16 mb-6 object-contain" />

      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
        <Construction className="h-8 w-8 text-primary" />
      </div>

      <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#2B1D14]">
        Under Construction
      </h1>
      <p className="mt-4 text-lg text-[#5A463B] max-w-md">
        We're working hard to bring you something amazing. Our website will be live very soon!
      </p>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center text-sm text-[#5A463B]">
        <span>For inquiries, reach us at</span>
        <a href="mailto:info@nanheram.com" className="font-medium text-primary hover:underline">
          info@nanheram.com
        </a>
      </div>

      <p className="mt-12 text-xs text-[#5A463B]/60">© {new Date().getFullYear()} NanheRam. All rights reserved.</p>
    </div>
  );
};

export default UnderConstruction;
