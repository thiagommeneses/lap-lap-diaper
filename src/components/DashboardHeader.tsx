import { Baby, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/baby-hero.jpg";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden rounded-3xl mb-8">
      <div 
        className="bg-gradient-soft p-8 md:p-12 text-center relative"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-baby-blue p-4 rounded-full animate-float">
              <Baby className="w-8 h-8 text-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-foreground mb-4">
            Lap Lap Diaper
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Acompanhe o estoque e o consumo de fraldas do seu bebê de forma simples e organizada
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-baby-pink" onClick={() => navigate('/admin')}>
              Administração
            </Button>
            <Button 
              variant="outline" 
              className="bg-baby-white/80 border-border hover:bg-baby-white"
              onClick={() => navigate('/auth')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};