import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import { AuthContext } from "../context/AuthContext";
import { ToastProvider } from "./Toast";

const product = {
  id: "123",
  name: "TN16 Cotton Shirt",
  price: 1299,
  discount: 200,
  Category: { name: "Men's Shirts" },
  thumbnail: "https://example.com/thumb.jpg",
};

describe("<ProductCard />", () => {
  it("displays price and category", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ user: null }}>
          <ToastProvider>
            <MemoryRouter>
              <ProductCard product={product} />
            </MemoryRouter>
          </ToastProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(screen.getByText(/TN16 Cotton Shirt/)).toBeInTheDocument();
    expect(screen.getByText(/Men's Shirts/i)).toBeInTheDocument();
    expect(screen.getByText("₹1099")).toBeInTheDocument();
  });
});

