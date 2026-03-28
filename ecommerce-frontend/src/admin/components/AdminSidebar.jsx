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

  const linkInactive =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors";
  const linkActive =
    "flex items-center gap-3 px-4 py-3 rounded-lg bg-neutral-100 text-neutral-900 font-medium border border-neutral-200";

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-neutral-50 text-neutral-900 w-64 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out md:translate-x-0 z-40
        flex flex-col border-r border-neutral-200 shadow-sm`}
    >
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Admin Panel</h2>
          <p className="text-xs text-neutral-500 mt-0.5">TN16 Studio</p>
        </div>
        <button type="button" onClick={onClose} className="md:hidden p-1 rounded hover:bg-neutral-100" aria-label="Close menu">
          <X size={20} className="text-neutral-700" />
        </button>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto bg-neutral-50">
        <ul className="space-y-1">
          <li>
            <Link
              to="/"
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={linkInactive}
            >
              <Home size={20} className="text-neutral-500" />
              <span>Home</span>
            </Link>
          </li>
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path));

            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={isActive ? linkActive : linkInactive}
                >
                  <Icon size={20} className={isActive ? "text-neutral-900" : "text-neutral-500"} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-neutral-200 bg-white">
        <button type="button" onClick={handleLogout} className={`w-full ${linkInactive}`}>
          <LogOut size={20} className="text-neutral-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
