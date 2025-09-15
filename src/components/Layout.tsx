import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  User, 
  Settings, 
  Map, 
  Newspaper, 
  Star,
  Plus
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "My Roadmaps", href: "/roadmaps", icon: Map },
    { name: "My News", href: "/news", icon: Newspaper },
    { name: "Recommendations", href: "/recommendations", icon: Star },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              Skill-Metrics
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={isActive(item.href) ? "bg-primary text-primary-foreground" : ""}
                >
                  <Link to={item.href}>
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/create-roadmap">
                <Plus className="h-4 w-4 mr-2" />
                Create Roadmap
              </Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link to="/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t">
        <div className="grid grid-cols-4 h-16">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center space-y-1 text-xs transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
};