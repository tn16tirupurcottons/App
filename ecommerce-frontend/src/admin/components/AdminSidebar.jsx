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
    { name: "Banners", icon: Image, path: "/admin/banners" },
    { name: "Brand Settings", icon: Settings, path: "/admin/brand-settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    onClose();
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out md:translate-x-0 z-40
        flex flex-col`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <p className="text-xs text-gray-400 mt-1">TN16 Studio</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1 rounded hover:bg-gray-800"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
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
                      ? "bg-pink-600 text-white" 
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
