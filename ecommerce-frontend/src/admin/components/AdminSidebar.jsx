import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  Tags,
  X,
  LogOut,
  Image,
  Settings,
  Users,
  Shield,
  Home,
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function AdminSidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Products", icon: ShoppingBag, path: "/admin/products" },
    { name: "Orders", icon: ListOrdered, path: "/admin/orders" },
    { name: "Categories", icon: Tags, path: "/admin/categories" },
    { name: "Customers", icon: Users, path: "/admin/customers" },
    { name: "Team & Roles", icon: Shield, path: "/admin/users" },
    { name: "Banners", icon: Image, path: "/admin/banners" },
    { name: "Settings", icon: Settings, path: "/admin/brand-settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-white text-dark w-64 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out md:translate-x-0 z-40
        flex flex-col border-r border-border shadow-medium`}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
        <div>
          <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
          <p className="text-xs text-muted mt-1">TN16 Studio</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded hover:bg-gray-100"
          aria-label="Close menu"
        >
          <X size={20} className="text-dark" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto bg-white">
        <ul className="space-y-2">
          {/* Home Link */}
          <li>
            <Link
              to="/"
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark/70 hover:bg-gray-100 hover:text-primary transition-colors"
            >
              <Home size={20} />
              <span className="font-medium">Home</span>
            </Link>
          </li>
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || 
              (item.path !== "/admin" && pathname.startsWith(item.path));
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => {
                    // Close sidebar on mobile when link is clicked
                    if (window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? "bg-primary text-white shadow-soft" 
                      : "text-dark/70 hover:bg-gray-100 hover:text-primary"
                    }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-white">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-dark/70 hover:bg-gray-100 hover:text-primary transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
