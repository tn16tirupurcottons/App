const Membership = () => {
  return (
    <div className="p-6 md:p-12 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-800">
          TN16 Exclusive Membership
        </h1>

        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
          Welcome to the <span className="font-semibold">TN16 Tirupur Cotton</span> membership experience — 
          created for customers who love premium quality, luxury comfort, and exclusive access.
        </p>

        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
          As a TN16 Member, you enjoy special benefits designed to elevate your shopping journey.  
          From priority access to new collections to exclusive member-only pricing, your membership 
          gives you a privileged experience with every purchase.
        </p>

        <div className="mt-8 bg-gray-100 p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Membership Benefits</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg">
            <li>Early access to premium Tirupur Cotton collections</li>
            <li>Special member-only discounts & seasonal offers</li>
            <li>Priority customer support</li>
            <li>Birthday month rewards</li>
            <li>Free shipping on select orders</li>
          </ul>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">Become a Member</h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            Joining TN16 Membership is simple. Create an account, stay connected, 
            and unlock exclusive privileges crafted specially for our premium customers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Membership;
