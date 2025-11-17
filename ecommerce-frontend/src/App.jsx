import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import Checkout from "./pages/Checkout";
// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin Pages
import AdminPanel from "./pages/admin/AdminPanel";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import CreateProduct from "./pages/admin/CreateProduct";
import EditProduct from "./pages/admin/EditProduct";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";

// React Query
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            
            {/* Navbar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>

                {/* -------- PUBLIC ROUTES -------- */}
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />


                {/* -------- ADMIN ROUTES -------- */}
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
                
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
