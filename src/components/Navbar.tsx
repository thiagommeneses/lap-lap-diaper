import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Baby, 
  Menu, 
  Settings, 
  Package, 
  Minus, 
  Type, 
  LogOut,
  User,
  Gift,
  ShoppingCart,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

export const Navbar = () => {
  const { user, session } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { name: "Dashboard", path: "/", icon: Baby },
    { name: "Admin", path: "/admin", icon: Settings },
    { name: "Consumir", path: "/usage", icon: Minus },
    { name: "Registrar Doação", path: "/register-donation", icon: Gift },
    { name: "Registrar Compra", path: "/register-purchase", icon: ShoppingCart }
  ];

  // Add super admin item if user is super admin
  const allNavigationItems = isSuperAdmin 
    ? [
        ...navigationItems,
        { name: "Super Admin", path: "/supreme-control-panel", icon: Crown }
      ]
    : navigationItems;

  const NavLink = ({ item, mobile = false }: { item: typeof allNavigationItems[0], mobile?: boolean }) => (
    <Link
      to={item.path}
      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(item.path)
          ? item.name === "Super Admin" 
            ? "bg-yellow-100 text-yellow-800"
            : "bg-baby-blue/20 text-baby-blue"
          : item.name === "Super Admin"
            ? "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
      } ${mobile ? "w-full" : ""}`}
      onClick={() => mobile && setIsOpen(false)}
    >
      <item.icon className="w-4 h-4" />
      {item.name}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-xl font-heading text-foreground hover:text-baby-blue transition-colors"
          >
            <div className="bg-gradient-baby-blue p-2 rounded-lg">
              <Baby className="w-6 h-6 text-foreground" />
            </div>
            Lap Lap Diaper
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user && session ? (
              <>
                <div className="flex items-center gap-1">
                  {allNavigationItems.map((item) => (
                    <NavLink key={item.path} item={item} />
                  ))}
                </div>
                
                <div className="flex items-center gap-2 border-l border-border pl-4">
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </div>
              </>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="btn-baby-blue"
              >
                LOGIN
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            {user && session ? (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex items-center gap-2 pb-4 border-b border-border">
                      <div className="bg-gradient-baby-blue p-2 rounded-lg">
                        <User className="w-4 h-4 text-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          Usuário
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {allNavigationItems.map((item) => (
                        <NavLink key={item.path} item={item} mobile />
                      ))}
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button 
                size="sm"
                onClick={() => navigate("/auth")}
                className="btn-baby-blue"
              >
                LOGIN
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};