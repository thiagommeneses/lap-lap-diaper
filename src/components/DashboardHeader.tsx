import { Baby, Settings, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePageSettings } from "@/hooks/usePageSettings";
import heroImage from "@/assets/baby-hero.jpg";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { settings, loading } = usePageSettings();
  
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl mb-8">
        <div className="bg-gradient-soft p-8 md:p-12 text-center animate-pulse">
          <div className="h-16 bg-baby-blue/20 rounded-full w-16 mx-auto mb-4"></div>
          <div className="h-8 bg-baby-blue/20 rounded mb-4 max-w-md mx-auto"></div>
          <div className="h-4 bg-baby-blue/20 rounded mb-6 max-w-lg mx-auto"></div>
        </div>
      </div>
    );
  }
  
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
            {settings.title}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            {settings.subtitle}
          </p>

          {settings.welcome_message && (
            <div className="mb-4">
              <p className="text-sm text-baby-blue font-medium bg-baby-blue/10 px-4 py-2 rounded-full inline-block">
                {settings.welcome_message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="btn-baby-pink" onClick={() => navigate('/admin')}>
              Administração
            </Button>
            <Button 
              className="btn-baby-mint" 
              onClick={() => navigate('/usage')}
            >
              <Package className="w-4 h-4 mr-2" />
              Consumir Estoque
            </Button>
            <Button 
              className="btn-baby-blue" 
              onClick={() => navigate("/baby-settings")}
            >
              <Baby className="w-4 h-4 mr-2" />
              Config. Bebê
            </Button>
            <Button 
              className="btn-baby-purple" 
              onClick={() => navigate("/page-settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Config. Textos
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