import { Baby } from "lucide-react";
import { usePageSettings } from "@/hooks/usePageSettings";
import heroImage from "@/assets/baby-hero.jpg";

export const DashboardHeader = () => {
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
            <div className="mb-6">
              <p className="text-sm text-baby-blue font-medium bg-baby-blue/10 px-4 py-2 rounded-full inline-block">
                {settings.welcome_message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};