import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import axiosClient from "../api/axiosClient";
import LocationSelect from "../components/LocationSelect";
import { useToast } from "../components/Toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement } from "@stripe/react-stripe-js";

const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";
const stripePromise = publicKey ? loadStripe(publicKey) : null;

const STEPS = {
  ADDRESS: 1,
  PAYMENT: 2,
  VERIFICATION: 3,
  CONFIRMATION: 4,
};

export default function MultiStepCheckout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(STEPS.ADDRESS);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState(() => localStorage.getItem("tn16_applied_coupon") || "");

  // Step 1: Shipping Address
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  // Step 2: Payment Method
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [clientSecret, setClientSecret] = useState("");

  // Step 3: Verification
  const [verification, setVerification] = useState({
    mobile: "",
    email: "",
  });

  // Step 4: Order Processing
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axiosClient.post("/orders/checkout", {
          couponCode: couponCode || undefined,
        });
        setOrderData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to start checkout");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [couponCode]);

  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  const shippingValid = () => {
    const required = {
      name: shipping.name.trim(),
      phone: shipping.phone.trim(),
      address: shipping.address.trim(),
      city: shipping.city.trim(),
      state: shipping.state.trim(),
      zip: shipping.zip.trim(),
    };
    return Object.values(required).every(Boolean);
  };

  const handleAddressNext = async () => {
    if (!shippingValid()) {
      toast.error("Please fill all required shipping fields");
      return;
    }

    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shipping.phone.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setCurrentStep(STEPS.PAYMENT);
    
    // Initialize payment based on selected method
    try {
      const res = await axiosClient.post("/orders/checkout", {
        paymentMethod: paymentMethod,
        couponCode: couponCode || undefined,
      });
      setClientSecret(res.data.clientSecret || "");
      if (res.data.razorpayOrderId) {
        setOrderData((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error("Payment initialization error:", err);
    }
  };

  const handlePaymentNext = async () => {
    // Initialize Razorpay if selected
    if (paymentMethod === "razorpay") {
      try {
        const res = await axiosClient.post("/orders/checkout", {
          paymentMethod: "razorpay",
          couponCode: couponCode || undefined,
        });
        if (res.data.razorpayOrderId) {
          setOrderData((prev) => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error("Razorpay initialization error:", err);
        toast.error("Failed to initialize payment. Please try again.");
        return;
      }
    }
    setCurrentStep(STEPS.VERIFICATION);
  };

  const verificationValid = () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const mobile = verification.mobile.replace(/\D/g, "");
    
    if (!mobile || !phoneRegex.test(mobile)) {
      return false;
    }
    
    // Email is optional but if provided, should be valid
    if (verification.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verification.email)) {
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async (updatedOrderData = null) => {
    if (!verificationValid()) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const shippingPayload = {
        ...shipping,
        address: shipping.address2
          ? `${shipping.address}\n${shipping.address2}`
          : shipping.address,
      };
      delete shippingPayload.address2;

      // Use updated order data if provided (from Razorpay callback)
      const finalOrderData = updatedOrderData || orderData;

      const orderPayload = {
        paymentIntentId: finalOrderData?.paymentIntentId || `cod_${Date.now()}`,
        paymentMethod: paymentMethod,
        shipping: shippingPayload,
        mobile: verification.mobile.replace(/\D/g, ""),
        email: verification.email || undefined,
        razorpayOrderId: finalOrderData?.razorpayOrderId,
        razorpayPaymentId: finalOrderData?.razorpayPaymentId,
        razorpaySignature: finalOrderData?.razorpaySignature,
        couponCode: couponCode || undefined,
      };

      const res = await axiosClient.post("/orders", orderPayload);
      
      setOrderId(res.data.order?.id);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      setCurrentStep(STEPS.CONFIRMATION);
      toast.success("Order placed successfully!");
      if (couponCode) {
        localStorage.removeItem("tn16_applied_coupon");
        setCouponCode("");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to place order");
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className="card p-8 text-center">
          <p className="text-muted">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className="card p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-dark mb-2">Checkout Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-transform text-xs sm:text-sm"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className="card p-6 sm:p-8 text-center">
          <h2 className="text-lg sm:text-xl font-semibold text-dark mb-2">No Items to Checkout</h2>
          <p className="text-muted">Your cart is empty. Add items to proceed.</p>
          <button
            onClick={() => navigate("/catalog")}
            className="mt-4 bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-transform text-xs sm:text-sm"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 pb-24 sm:pb-6 md:pb-0">
      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { step: STEPS.ADDRESS, label: "Address", icon: "📍" },
            { step: STEPS.PAYMENT, label: "Payment", icon: "💳" },
            { step: STEPS.VERIFICATION, label: "Verify", icon: "✓" },
            { step: STEPS.CONFIRMATION, label: "Confirm", icon: "🎉" },
          ].map(({ step, label, icon }, idx) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-semibold transition ${
                    currentStep >= step
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step ? "✓" : icon}
                </div>
                <span className="text-xs sm:text-sm mt-2 text-center font-medium hidden sm:block">
                  {label}
                </span>
              </div>
              {idx < 3 && (
                <div
                  className={`h-1 flex-1 mx-2 sm:mx-4 transition ${
                    currentStep > step ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === STEPS.ADDRESS && (
            <AddressStep
              shipping={shipping}
              onChange={handleShippingChange}
              onNext={handleAddressNext}
            />
          )}

          {currentStep === STEPS.PAYMENT && (
            <PaymentStep
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              orderData={orderData}
              clientSecret={clientSecret}
              onNext={handlePaymentNext}
              onBack={() => setCurrentStep(STEPS.ADDRESS)}
            />
          )}

          {currentStep === STEPS.VERIFICATION && (
            <VerificationStep
              verification={verification}
              onChange={setVerification}
              paymentMethod={paymentMethod}
              orderData={orderData}
              clientSecret={clientSecret}
              onPlaceOrder={(updatedData) => {
                if (updatedData) {
                  setOrderData(updatedData);
                  // Call handlePlaceOrder with updated data
                  setTimeout(() => handlePlaceOrder(updatedData), 100);
                } else {
                  handlePlaceOrder();
                }
              }}
              processing={processing}
              error={error}
              onBack={() => setCurrentStep(STEPS.PAYMENT)}
            />
          )}

          {currentStep === STEPS.CONFIRMATION && (
            <ConfirmationStep
              orderId={orderId}
              orderData={orderData}
              shipping={shipping}
              paymentMethod={paymentMethod}
              onViewOrder={() => navigate(`/orders/${orderId}`)}
              onContinueShopping={() => navigate("/")}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary orderData={orderData} />
        </div>
      </div>
    </div>
  );
}

// Step 1: Address
function AddressStep({ shipping, onChange, onNext }) {
  return (
    <div className="card p-4 sm:p-6 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-dark">Shipping Address</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Full name *"
          value={shipping.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Enter your full name"
        />
        <Input
          label="Phone *"
          value={shipping.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          inputMode="tel"
          maxLength={12}
          placeholder="10-digit mobile number"
        />
        <Input
          label="Address *"
          value={shipping.address}
          onChange={(e) => onChange("address", e.target.value)}
          className="col-span-1 sm:col-span-2"
          placeholder="Street address"
        />
        <Input
          label="Apartment / Suite (optional)"
          value={shipping.address2}
          onChange={(e) => onChange("address2", e.target.value)}
          className="col-span-1 sm:col-span-2"
          placeholder="Apartment, suite, etc."
        />
        <div className="col-span-1 sm:col-span-2">
          <LocationSelect
            country={shipping.country}
            state={shipping.state}
            city={shipping.city}
            onStateChange={(val) => onChange("state", val)}
            onCityChange={(val) => onChange("city", val)}
            required
          />
        </div>
        <Input
          label="Postal code *"
          value={shipping.zip}
          onChange={(e) => onChange("zip", e.target.value)}
          className="col-span-1 sm:col-span-2"
          placeholder="PIN code"
        />
      </div>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 sm:py-3.5 rounded-full font-semibold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs hover:bg-primary/90 active:scale-95 transition-transform mt-4"
      >
        Proceed to Payment
      </button>
    </div>
  );
}

// Step 2: Payment Method
function PaymentStep({ paymentMethod, onPaymentMethodChange, orderData, clientSecret, onNext, onBack }) {
  return (
    <div className="card p-4 sm:p-6 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-dark">Select Payment Method</h2>

      <div className="space-y-3">
        {/* Cash on Delivery */}
        <button
          onClick={() => onPaymentMethodChange("cod")}
          className={`w-full p-4 rounded-2xl border-2 transition text-left ${
            paymentMethod === "cod"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === "cod" ? "border-primary bg-primary" : "border-gray-300"
            }`}>
              {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="font-semibold text-dark">Cash on Delivery</span>
              </div>
              <p className="text-sm text-muted mt-1">Pay when you receive your order</p>
            </div>
          </div>
        </button>

        {/* Online Payment */}
        <button
          onClick={() => onPaymentMethodChange("razorpay")}
          className={`w-full p-4 rounded-2xl border-2 transition text-left ${
            paymentMethod === "razorpay"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === "razorpay" ? "border-primary bg-primary" : "border-gray-300"
            }`}>
              {paymentMethod === "razorpay" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                <span className="font-semibold text-dark">Online Payment</span>
              </div>
              <p className="text-sm text-muted mt-1">GPay, PhonePe, UPI, Cards, Netbanking</p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-border text-dark py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-primary text-white py-3 rounded-full font-semibold tracking-[0.2em] uppercase text-xs hover:bg-primary/90 active:scale-95 transition-transform"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Step 3: Verification
function VerificationStep({ verification, onChange, paymentMethod, orderData, clientSecret, onPlaceOrder, processing, error, onBack }) {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const phoneRegex = /^[6-9]\d{9}$/;
  const mobile = verification.mobile.replace(/\D/g, "");
  const isValidMobile = mobile && phoneRegex.test(mobile);
  const isValidEmail = !verification.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verification.email);

  // Load Razorpay script
  useEffect(() => {
    if (paymentMethod === "razorpay" && orderData?.razorpayKeyId && !razorpayLoaded) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        setRazorpayLoaded(false);
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [paymentMethod, orderData?.razorpayKeyId, razorpayLoaded]);

  const handleRazorpayPayment = () => {
    if (!window.Razorpay || !orderData?.razorpayOrderId || !orderData?.razorpayKeyId) {
      onPlaceOrder(); // Fallback to direct order placement
      return;
    }

    const options = {
      key: orderData.razorpayKeyId,
      amount: orderData.totals?.total * 100, // Amount in paise
      currency: "INR",
      name: "TN16 Tirupur Cotton",
      description: "Order Payment",
      order_id: orderData.razorpayOrderId,
      handler: function (response) {
        // Update orderData with payment details
        const updatedOrderData = {
          ...orderData,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        };
        // Call onPlaceOrder with updated data
        onPlaceOrder(updatedOrderData);
      },
      prefill: {
        name: verification.mobile ? "Customer" : "",
        contact: verification.mobile || "",
        email: verification.email || "",
      },
      theme: {
        color: "#000000",
      },
      modal: {
        ondismiss: function () {
          // User closed the payment modal
          console.log("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handlePlaceOrderClick = () => {
    if (paymentMethod === "razorpay" && orderData?.razorpayOrderId) {
      handleRazorpayPayment();
    } else {
      onPlaceOrder();
    }
  };

  return (
    <div className="card p-4 sm:p-6 space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold text-dark">Contact Verification</h2>
      <p className="text-sm text-muted">
        Please provide your contact details for order confirmation and tracking updates.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-dark/70 mb-1.5">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={verification.mobile}
            onChange={(e) => onChange({ ...verification, mobile: e.target.value })}
            placeholder="Enter 10-digit mobile number"
            maxLength={12}
            inputMode="tel"
            className={`w-full border rounded-full px-4 py-2.5 text-sm text-dark focus:outline-none focus:border-primary ${
              verification.mobile && !isValidMobile ? "border-red-300" : "border-border"
            }`}
          />
          {verification.mobile && !isValidMobile && (
            <p className="text-xs text-red-600 mt-1 ml-1">Please enter a valid 10-digit mobile number</p>
          )}
          {isValidMobile && (
            <p className="text-xs text-green-600 mt-1 ml-1">✓ Valid mobile number</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark/70 mb-1.5">
            Email ID <span className="text-xs text-muted">(Optional - Not recommended)</span>
          </label>
          <input
            type="email"
            value={verification.email}
            onChange={(e) => onChange({ ...verification, email: e.target.value })}
            placeholder="your.email@example.com"
            inputMode="email"
            className={`w-full border rounded-full px-4 py-2.5 text-sm text-dark focus:outline-none focus:border-primary ${
              verification.email && !isValidEmail ? "border-red-300" : "border-border"
            }`}
          />
          {verification.email && !isValidEmail && (
            <p className="text-xs text-red-600 mt-1 ml-1">Please enter a valid email address</p>
          )}
        </div>

        {paymentMethod === "stripe" && clientSecret && stripePromise && (
          <StripePaymentWrapper clientSecret={clientSecret} />
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          disabled={processing}
          className="flex-1 border-2 border-border text-dark py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handlePlaceOrderClick}
          disabled={!isValidMobile || processing || (verification.email && !isValidEmail) || (paymentMethod === "razorpay" && !razorpayLoaded && !orderData?.razorpayOrderId)}
          className="flex-1 bg-primary text-white py-3 rounded-full font-semibold tracking-[0.2em] uppercase text-xs hover:bg-primary/90 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? "Placing Order..." : paymentMethod === "razorpay" ? "Pay Now" : "Place Order"}
        </button>
      </div>
    </div>
  );
}

// Step 4: Confirmation
function ConfirmationStep({ orderId, orderData, shipping, paymentMethod, onViewOrder, onContinueShopping }) {
  return (
    <div className="card p-4 sm:p-6 text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <span className="text-4xl">✓</span>
      </div>
      
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-dark mb-2">
          Order Placed Successfully! 🎉
        </h2>
        <p className="text-sm sm:text-base text-muted">
          Your order has been confirmed and we've sent you a confirmation message.
        </p>
        {orderId && (
          <p className="text-sm font-semibold text-dark mt-2">
            Order ID: <span className="text-primary">{orderId.substring(0, 8).toUpperCase()}</span>
          </p>
        )}
      </div>

      {paymentMethod === "cod" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            💰 <strong>Cash on Delivery:</strong> Please keep exact change ready when your order arrives.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onViewOrder}
          className="w-full bg-primary text-white py-3 rounded-full font-semibold tracking-[0.2em] uppercase text-xs hover:bg-primary/90 active:scale-95 transition-transform"
        >
          Track Order
        </button>
        <button
          onClick={onContinueShopping}
          className="w-full border-2 border-border text-dark py-3 rounded-full font-semibold hover:border-primary hover:text-primary transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// Order Summary Component
function OrderSummary({ orderData }) {
  if (!orderData) return null;

  const items = orderData?.items || [];
  const totals = orderData?.totals || {};

  return (
    <div className="card p-4 sm:p-6 sticky top-20 sm:top-24">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-dark">Order Summary</h2>
      <div className="space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 overflow-auto pr-2 text-dark/70">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div>
              <p className="font-semibold text-dark">{item.Product?.name}</p>
              <p className="text-muted text-xs">
                Qty {item.quantity} · ₹{item.unitPrice?.toFixed(0)}
              </p>
            </div>
            <p className="font-semibold text-dark">
              ₹{(item.quantity * (item.unitPrice || 0)).toFixed(0)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm text-dark/70">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{Number(totals.subtotal || 0).toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (5%)</span>
          <span>₹{Number(totals.taxTotal || 0).toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{Number(totals.shippingFee || 0).toFixed(0)}</span>
        </div>
      </div>
      <div className="flex justify-between text-lg font-semibold mt-4 text-dark">
        <span>Total</span>
        <span className="text-primary">₹{Number(totals.total || 0).toFixed(0)}</span>
      </div>
    </div>
  );
}

// Stripe Payment Wrapper Component
function StripePaymentWrapper({ clientSecret }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="border border-border rounded-2xl p-4 bg-light">
        <PaymentElement />
      </div>
    </Elements>
  );
}

// Input Component
function Input({ label, className = "", ...props }) {
  return (
    <label className={`block text-xs sm:text-sm font-semibold text-dark/70 ${className}`}>
      <span className="block mb-1.5">{label}</span>
      <input
        {...props}
        className="w-full border border-border bg-white rounded-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-dark focus:outline-none focus:border-primary"
      />
    </label>
  );
}
