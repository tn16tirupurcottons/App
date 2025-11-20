const Shipping = () => {
  return (
    <div className="p-6 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-800">
          Shipping & Returns
        </h1>

        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          At <span className="font-semibold">TN16 Tirupur Cotton</span>, your comfort and satisfaction
          are our top priorities. We ensure that every order is delivered with care,
          on time, and with complete transparency.
        </p>

        {/* SHIPPING POLICY */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Shipping Policy
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg">
            <li>Orders are processed within 1–2 business days.</li>
            <li>Delivery timelines typically range from 3–7 days depending on your location.</li>
            <li>You will receive SMS or email updates once your order is shipped.</li>
            <li>Free shipping is available on select orders and promotional periods.</li>
          </ul>
        </div>

        {/* RETURN POLICY */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Returns & Exchanges
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-3">
            We want you to love your TN16 product. If something doesn’t feel right,
            we offer an easy and friendly return process.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg">
            <li>Returns accepted within 7 days of delivery.</li>
            <li>Product must be unworn, unwashed, and in original condition.</li>
            <li>Exchanges available for size or product issues.</li>
            <li>Refunds are processed within 5–7 working days after return approval.</li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div className="mt-8 bg-gray-100 p-6 rounded-xl">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Need Help?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            For any shipping or return-related concerns, our support team is here for you.  
            Reach out anytime at  
            <span className="font-semibold"> support@tn16cotton.com</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
