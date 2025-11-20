const About = () => {
  return (
    <div className="p-6 md:p-12 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-800">
          About TN16 — Tirupur Cotton Studio
        </h1>

        {/* Intro Paragraph */}
        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
          <span className="font-semibold">TN16 Tirupur Cotton</span> is more than just a clothing brand — 
          it is a tribute to the world-famous cotton craftsmanship of Tirupur. 
          Built with passion and precision, our brand represents purity, comfort, 
          and luxurious everyday wear.
        </p>

        {/* Second Paragraph */}
        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
          Every fabric is carefully chosen, every stitch is thoughtfully crafted, 
          and every design reflects the perfect blend of modern fashion 
          and timeless South Indian textile heritage. 
          We believe that premium quality should be accessible, durable, and stylish.
        </p>

        {/* Mission Paragraph */}
        <p className="text-gray-700 leading-relaxed mb-4 text-lg">
          Our mission is simple — to create luxury cotton wear that feels incredibly soft, 
          lasts longer, and makes you feel confident every day. 
          Whether you're choosing daily essentials or premium outfits, 
          TN16 ensures unmatched comfort and quality.
        </p>

        {/* Closing Paragraph */}
        <p className="text-gray-700 leading-relaxed text-lg">
          Thank you for being part of the TN16 journey.  
          Discover comfort. Experience style.  
          Welcome to <span className="font-semibold">TN16 Tirupur Cotton</span>.
        </p>

        {/* Optional Section - Brand Values */}
        <div className="mt-10 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Our Core Values</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg">
            <li>Premium Quality Cotton</li>
            <li>Modern Designs with Traditional Roots</li>
            <li>Comfort as the Highest Priority</li>
            <li>Ethically Crafted Clothing</li>
            <li>Customer-First Brand Experience</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default About;
