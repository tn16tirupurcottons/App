import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";

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
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>
    );

    expect(screen.getByText(/TN16 Cotton Shirt/)).toBeInTheDocument();
    expect(screen.getByText(/Men's Shirts/i)).toBeInTheDocument();
    expect(screen.getByText("₹1099")).toBeInTheDocument();
  });
});

