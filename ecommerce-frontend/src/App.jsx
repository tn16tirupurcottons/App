import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { BrandThemeProvider } from "./context/BrandThemeContext";
import { ToastProvider } from "./components/Toast";

// Core pages - loaded immediately
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrdersHub from "./pages/OrdersHub";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

// Lazy loaded pages - code split for better performance
const MultiStepCheckout = lazy(() => import("./pages/MultiStepCheckout"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const About = lazy(() => import("./pages/About"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Membership = lazy(() => import("./pages/Membership"));
const Editions = lazy(() => import("./pages/Editions"));

// Admin pages - lazy loaded (large bundle, only for admins)
const AdminPanel = lazy(() => import("./pages/admin/AdminPanel"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const CreateProduct = lazy(() => import("./pages/admin/CreateProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const BannerManagement = lazy(() => import("./pages/admin/BannerManagement"));
const BrandSettings = lazy(() => import("./pages/admin/BrandSettings"));
const ImageManagement = lazy(() => import("./pages/admin/ImageManagement"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

// Loading component
const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="text-lg font-semibold">Loading...</div>
  </div>
);

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrandThemeProvider>
          <ToastProvider>
            <BrowserRouter>
            <ScrollToTop />
            <Routes>

              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/men" element={<Catalog embeddedSegment="men" />} />
                <Route path="/women" element={<Catalog embeddedSegment="women" />} />
                <Route path="/kids" element={<Catalog embeddedSegment="kids" />} />
                <Route path="/accessories" element={<Catalog embeddedSegment="accessories" />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<OrdersHub />} />

                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <Wishlist />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders/:id"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <OrderTracking />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/forgot-password" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ForgotPassword />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/reset-password" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ResetPassword />
                    </Suspense>
                  } 
                />

                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<LoadingFallback />}>
                        <MultiStepCheckout />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                {/* NEW ROUTES */}
                <Route 
                  path="/about" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <About />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/shipping" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Shipping />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/membership" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Membership />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/editions" 
                  element={
                    <Suspense fallback={<LoadingFallback />}>
                      <Editions />
                    </Suspense>
                  } 
                />

                {/* ADMIN ROUTES - Lazy loaded */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminPanel />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminProducts />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminOrders />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminCategories />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/create-product"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <CreateProduct />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/edit-product/:id"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <EditProduct />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/banners"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <BannerManagement />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/customers"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminCustomers />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <AdminUsers />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/brand-settings"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <BrandSettings />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/images"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <Suspense fallback={<LoadingFallback />}>
                        <ImageManagement />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
              </Route>

            </Routes>
            </BrowserRouter>
          </ToastProvider>
        </BrandThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
