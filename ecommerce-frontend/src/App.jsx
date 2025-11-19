import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Wishlist from "./pages/Wishlist";
import AppLayout from "./components/AppLayout";
import AdminPanel from "./pages/admin/AdminPanel";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import CreateProduct from "./pages/admin/CreateProduct";
import EditProduct from "./pages/admin/EditProduct";
import BannerManagement from "./pages/admin/BannerManagement";
import BrandSettings from "./pages/admin/BrandSettings";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminUsers from "./pages/admin/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-product"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <CreateProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-product/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/banners"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <BannerManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminCustomers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/brand-settings"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <BrandSettings />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
