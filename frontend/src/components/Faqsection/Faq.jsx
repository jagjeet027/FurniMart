import { useState } from "react";

const faqs = [
  {
    question: "What is FurniMart.com?",
    answer: "FurniMart.com is a premium online marketplace connecting customers with verified furniture manufacturers across India. We specialize in facilitating seamless transactions for home, office, and commercial furniture while ensuring quality, authenticity, and customer satisfaction."
  },
  { 
    question: "How does FurniMart.com work?", 
    answer: "Our platform creates a direct bridge between buyers and manufacturers. Customers can browse thousands of furniture products, filter by category, contact verified manufacturers, request custom quotes, negotiate prices, place orders, and make secure payments. Manufacturers list their products, respond to inquiries, fulfill orders, and manage their storefront all in one place." 
  },
  { 
    question: "What types of products can I find on FurniMart.com?",
    answer: "FurniMart.com offers an extensive collection of furniture including living room sets, bedroom furnishings, dining tables, office furniture, outdoor pieces, and specialty items. Our products are crafted from various materials including solid wood, engineered wood, metal, glass, rattan, and upholstered pieces with premium fabrics and leathers. We cater to residential, commercial, and hospitality sectors." 
  },
  { 
    question: "How can I contact FurniMart.com customer service?",
    answer: "Our customer support team is available through multiple channels: the Help Center on FurniMart.com, live chat support available 7 days a week from 9 AM to 7 PM IST, email at support@furnimart.com, and phone support at +91-XXXXXXXXXX for urgent inquiries." 
  },
  { 
    question: "What is the difference between FurniMart.com and Alibaba.com?",
    answer: "FurniMart.com specializes in Indian furniture products with a focus on both retail and wholesale customers, offering specialized knowledge of local craftsmanship and design. We provide end-to-end service including delivery and installation across India. Alibaba.com is a global platform primarily focused on bulk international wholesale with minimal after-sales support within India." 
  },
  { 
    question: "How can I verify the legitimacy of manufacturers on FurniMart.com?",
    answer: "All manufacturers on FurniMart.com undergo rigorous verification. Look for the blue verification badge, read customer reviews and ratings, check their transaction history, visit their detailed profile showcasing their workshop and manufacturing process, and use our secure FurniMart Assurance program for protected transactions." 
  },
  { 
    question: "How can I manage my notification settings?",
    answer: "Simply log in to your account, navigate to 'Profile' > 'Settings' > 'Notifications' and customize your preferences for order updates, promotions, price alerts, and communication from manufacturers. You can choose to receive notifications via email, SMS, or push notifications through our mobile app." 
  },
  { 
    question: "How do I update my profile information?",
    answer: "Log in to your account, click on the profile icon in the top right corner, select 'My Profile', and click 'Edit Profile'. From there you can update your personal information, shipping addresses, communication preferences, and payment methods securely." 
  },
  {
    question: "Can I have multiple accounts on FurniMart.com?",
    answer: "No, our platform policy prohibits multiple accounts under the same business identity or individual. This ensures transparency and trust in our marketplace. However, business accounts can add multiple team members with different access permissions."
  },
  {
    question: "How do I link my FurniMart.com account to other platforms?",
    answer: "While FurniMart.com doesn't officially support linking to social media platforms, we do offer integration with popular ERP systems and inventory management software through our API. For enterprise customers, we provide specialized integration services to connect with your business systems."
  },
  {
    question: "What payment methods are accepted on FurniMart.com?",
    answer: "We accept various payment methods including credit/debit cards, net banking, UPI, wallets like Paytm and PhonePe, EMI options, and bank transfers for bulk orders. All transactions are secured with industry-standard encryption and fraud protection."
  },
  {
    question: "Does FurniMart.com offer customized furniture options?",
    answer: "Absolutely! Many of our manufacturers offer customization services. When browsing products, look for the 'Customizable' badge. You can request specific dimensions, materials, finishes, and designs. Simply contact the manufacturer through our platform to discuss your requirements and receive a custom quote."
  },
  {
    question: "What is FurniMart Assurance?",
    answer: "FurniMart Assurance is our premium protection program that safeguards your purchases. It includes payment protection, quality guarantee, manufacturer verification, and dispute resolution. When you buy from a manufacturer covered by FurniMart Assurance, your payment is held securely until you confirm satisfactory delivery of your order."
  },
  {
    question: "How does shipping work on FurniMart.com?",
    answer: "Shipping options vary by manufacturer and product. Most items include free shipping within the same city or state. For interstate deliveries, shipping costs depend on distance and product size. During checkout, you'll see precise shipping costs and estimated delivery times. For large furniture pieces, white-glove delivery service with installation is available at an additional cost."
  },
  {
    question: "What is the return policy for products purchased on FurniMart.com?",
    answer: "Our return policy varies by manufacturer, but generally allows returns within 7-14 days for most products. Custom-made items typically have limited return options. All returns must be in original condition and packaging. Check the specific return policy listed on each product page before purchasing."
  },
  {
    question: "Can I track my order on FurniMart.com?",
    answer: "Yes, all orders placed through FurniMart.com come with real-time tracking. After purchase, you'll receive a tracking ID via email and SMS. You can also check your order status by logging into your account and visiting 'My Orders'. For large furniture deliveries, you'll receive pre-delivery calls to confirm convenient delivery timing."
  },
  {
    question: "How do I become a seller on FurniMart.com?",
    answer: "To join as a manufacturer, click on 'Sell on FurniMart' on our homepage and complete the application process. You'll need to provide business documentation, product photos, manufacturing capabilities, and pass our quality verification process. Our team will review your application and typically respond within 3-5 business days."
  },
  {
    question: "Does FurniMart.com offer assembly services?",
    answer: "Yes, we offer assembly services for most furniture products in major cities across India. During checkout, you can select assembly service as an add-on. Our trained assembly partners will install your furniture professionally at your convenience. For some products, assembly is included in the price."
  },
  {
    question: "What if I receive damaged furniture?",
    answer: "In the rare event you receive damaged furniture, document the damage with photos immediately upon delivery and report it through your account within 48 hours. Our customer service team will coordinate with the manufacturer for a prompt resolution, which may include repair, replacement, or refund depending on the situation."
  },
  {
    question: "Can I cancel my order after placing it?",
    answer: "Order cancellation policies depend on the manufacturing stage. Generally, orders can be cancelled without penalty if production hasn't started. Once production begins, cancellation may incur charges. Custom orders usually have stricter cancellation policies. Check your order details page for specific cancellation options."
  },
  {
    question: "How does FurniMart.com ensure product quality?",
    answer: "We maintain strict quality standards through our verification process. Manufacturers must submit samples for inspection, provide material certifications, and maintain consistent customer ratings to remain on our platform. Regular quality audits are conducted, and manufacturers falling below our standards are suspended from the marketplace."
  },
  {
    question: "Does FurniMart.com offer warranty on products?",
    answer: "Warranty terms vary by product and manufacturer. Most furniture comes with at least a 1-year warranty against manufacturing defects. Premium products may offer extended warranties of up to 5 years. Warranty details are clearly mentioned on each product page along with coverage terms and claim process."
  },
  {
    question: "Is FurniMart.com available across all of India?",
    answer: "Yes, FurniMart.com operates pan-India with delivery services reaching all major cities and most small towns. Delivery timeframes and shipping costs may vary by location. For remote areas, additional delivery charges may apply, and certain assembly services might be limited."
  },
  {
    question: "How do reviews work on FurniMart.com?",
    answer: "Only verified buyers can leave product reviews after completing a purchase. Reviews include ratings on product quality, value for money, delivery experience, and after-sales service. Manufacturers cannot remove negative reviews but can respond to address concerns. This ensures transparent and authentic feedback for other customers."
  },
  {
    question: "Can I purchase furniture in bulk for my business?",
    answer: "Absolutely! FurniMart.com has a dedicated B2B program for bulk purchases. Hotels, offices, restaurants, and other businesses can request wholesale quotes, custom manufacturing, and project-based pricing. Contact our B2B specialists through the 'Business Solutions' section for personalized assistance."
  },
  {
    question: "How do I report a problem with my order?",
    answer: "Log into your account, go to 'My Orders', select the problematic order, and click 'Report Issue'. You can describe the problem and upload supporting photos or videos. Our resolution team typically responds within 24 hours. For urgent issues, use our live chat or contact our helpline."
  },
  {
    question: "What sustainable and eco-friendly options does FurniMart.com offer?",
    answer: "We have a growing selection of eco-friendly furniture made from sustainable materials like reclaimed wood, bamboo, and recycled materials. Look for our 'Eco-Friendly' badge when browsing. Many of our manufacturers hold environmental certifications like FSC (Forest Stewardship Council) for responsibly sourced timber."
  },
  {
    question: "Does FurniMart.com offer interior design services?",
    answer: "Yes, we offer complementary basic design consultation for customers purchasing complete room sets. For comprehensive interior design services, our premium 'FurniDesign' service connects you with professional interior designers who can create custom solutions for your space using products from our platform."
  },
  {
    question: "How can I check if furniture will fit in my space?",
    answer: "Many products on FurniMart.com feature our 'VirtualPlace' AR tool, allowing you to visualize furniture in your space using your smartphone camera. Additionally, all product listings include detailed dimensions. For custom sizes, contact manufacturers directly through our platform."
  },
  {
    question: "What is FurniMart's Price Match guarantee?",
    answer: "If you find the identical product (same brand, model, size) at a lower price on another authorized retailer's website within 7 days of purchase, we'll refund the difference. Simply submit the competitor's link through your account's 'Price Match' section for verification."
  },
  {
    question: "How can I become an affiliate or influencer for FurniMart.com?",
    answer: "Our Affiliate Program allows content creators, interior designers, and influencers to earn commission by promoting FurniMart products. Visit the 'Partners' section on our website to apply. Selected affiliates receive unique tracking links, promotional materials, and early access to new collections."
  },
  {
    question: "Does FurniMart.com offer gift cards?",
    answer: "Yes, we offer digital gift cards in denominations ranging from ₹1,000 to ₹50,000. Gift cards are valid for one year from the date of purchase and can be used for any product on FurniMart.com. They make perfect gifts for housewarming parties, weddings, and home renovations."
  },
  {
    question: "How often does FurniMart.com add new products?",
    answer: "Our catalog is continuously updated with new manufacturers adding fresh designs daily. We also feature seasonal collections four times a year and exclusive designer collaborations monthly. Enable notifications to stay updated on new arrivals matching your interests."
  },
  {
    question: "What financing options does FurniMart.com offer?",
    answer: "We partner with leading financial institutions to offer No-Cost EMI options on purchases above ₹10,000 when using major credit cards. For orders above ₹50,000, we also provide furniture financing with flexible repayment terms ranging from 3 to 18 months, subject to credit approval."
  },
  {
    question: "Can I get samples of materials before purchasing furniture?",
    answer: "Yes, many manufacturers offer material swatches for fabrics, leather, wood finishes, and laminates. Look for the 'Sample Available' icon on product pages. Samples typically cost between ₹100-500, which is credited toward your purchase if you order the furniture."
  },
  {
    question: "Does FurniMart.com offer furniture rental options?",
    answer: "We've recently launched 'FurniRent' in select metro cities, allowing customers to rent quality furniture for periods ranging from 3 to 24 months. This service is ideal for temporary accommodations, staging properties, or trying pieces before committing to purchase."
  },
  {
    question: "How does FurniMart.com handle personal data?",
    answer: "We adhere to strict privacy protocols compliant with Indian data protection laws. Your personal information is encrypted and securely stored. We never share your contact details with manufacturers without your consent. Review our detailed Privacy Policy accessible from the footer of our website."
  },
  {
    question: "What is FurniMart's Loyalty Program?",
    answer: "Our 'FurniRewards' program allows you to earn points on every purchase (1 point per ₹100 spent). Points can be redeemed for discounts, exclusive access to sales, free delivery upgrades, and priority customer service. Membership tiers (Silver, Gold, Platinum) offer increasing benefits based on annual spending."
  },
  {
    question: "Can I schedule furniture delivery for a specific date?",
    answer: "Yes, our 'Scheduled Delivery' service allows you to select your preferred delivery date and time slot during checkout. This service is available in most major cities and comes complimentary for premium members or at a nominal fee for standard orders."
  },
  {
    question: "Does FurniMart.com offer furniture disposal services?",
    answer: "Yes, we offer 'OldFurniGone' service in select cities, where our delivery team can remove and responsibly dispose of or donate your old furniture when delivering new items. This service can be added during checkout for a small fee depending on the size of the furniture being removed."
  },
  {
    question: "How can I contact manufacturers directly on FurniMart.com?",
    answer: "Each product page has a 'Contact Manufacturer' button allowing you to send inquiries directly to the seller. Our messaging system keeps all communication on-platform for your protection. You can discuss customizations, bulk pricing, or specific questions about the product."
  },
  {
    question: "What are FurniMart's showroom locations?",
    answer: "While we primarily operate online, we have experience centers in Delhi, Mumbai, Bangalore, Chennai, and Hyderabad where you can view popular items from our catalog. These showrooms operate on an appointment basis, which you can schedule through our website or app."
  },
  {
    question: "How can I suggest a new feature for FurniMart.com?",
    answer: "We value customer feedback! Visit the 'Suggestions' tab in your account settings to submit feature ideas. Our product team reviews all suggestions regularly, and implemented ideas earn FurniRewards points. Many of our most popular features came directly from customer suggestions."
  },
  {
    question: "Does FurniMart offer seasonal sales?",
    answer: "Yes, we run major sales during traditional shopping seasons (Diwali, New Year, etc.) plus our anniversary sale in August. Subscribers to our newsletter get early access to these sales. Additionally, we offer Flash Sales every weekend with limited-time deals on selected items."
  },
  {
    question: "What is FurniMart's Trade Program?",
    answer: "Our Trade Program caters to interior designers, architects, and design professionals with exclusive benefits including trade discounts (10-25% off retail), dedicated account managers, access to trade-only products, CAD files for planning, priority manufacturing, and specialized delivery options. Apply through the 'Trade Professionals' section with your professional credentials."
  },
  {
    question: "How can I view product dimensions clearly?",
    answer: "Each listing includes detailed dimension diagrams showing height, width, depth, and other relevant measurements. Our interactive 3D viewer allows you to rotate products and examine them from all angles. For additional measurements not shown, you can request specific details through the product Q&A section."
  },
  {
    question: "Does FurniMart.com sell internationally?",
    answer: "Currently, FurniMart.com primarily serves the Indian market. However, we do offer international shipping for select products to neighboring countries including Nepal, Bangladesh, Sri Lanka, and the UAE. International orders require additional customs documentation and longer delivery timeframes."
  },
  {
    question: "Can I create a furniture wishlist on FurniMart.com?",
    answer: "Yes, registered users can create multiple wishlists by clicking the heart icon on any product. You can organize items into categorized lists (e.g., 'Living Room Ideas', 'Office Renovation'), share lists with friends and family, receive price drop notifications, and easily add items to your cart from your wishlist."
  },
  {
    question: "What is FurniMart's Design Consultation service?",
    answer: "Our complimentary Design Consultation service connects you with professional interior advisors who help you select furniture that matches your style, budget, and space requirements. Book a 30-minute video consultation through your account, and our experts will provide personalized recommendations from our catalog."
  },
  {
    question: "How does FurniMart ensure fair pricing?",
    answer: "Our Price Intelligence system continuously monitors market rates to ensure competitive pricing. Manufacturers on our platform agree to our fair pricing policy, which prevents artificial price inflation. We also provide price history charts on product pages so you can make informed decisions about purchase timing."
  },
  {
    question: "What is the FurniMart mobile app?",
    answer: "Our mobile app for iOS and Android offers an enhanced shopping experience with features like AR View (see furniture in your space), exclusive app-only deals, real-time order tracking, voice search, and instant notifications. The app also works offline to browse previously viewed products when connectivity is limited."
  },
  {
    question: "How do I care for furniture purchased from FurniMart.com?",
    answer: "Each product comes with specific care instructions in the product manual. Additionally, our website features an extensive Furniture Care Guide with maintenance tips for different materials. For premium purchases, we offer optional care kits with appropriate cleaning supplies and protective treatments."
  },
  {
    question: "Does FurniMart.com offer corporate gifting solutions?",
    answer: "Yes, our Corporate Gifting program helps businesses select appropriate furniture gifts for clients, employees, or partners. We offer bulk discounts, custom branding options, personalized gift cards, and coordinated delivery. Contact our Corporate Services team for tailored gifting solutions."
  },
  {
    question: "How can I sell my used furniture through FurniMart?",
    answer: "Our recently launched 'FurniExchange' marketplace allows users to list their gently used furniture for sale. We verify listings, provide fair market value estimates, and facilitate secure transactions between buyers and sellers. Service is currently available in select metro cities only."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  
  // Calculate total pages
  const totalPages = Math.ceil(faqs.length / questionsPerPage);
  
  // Get current page questions
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = faqs.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setOpenIndex(null); 
      window.scrollTo({ top: document.getElementById('faq-section').offsetTop - 100, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setOpenIndex(null); 
      window.scrollTo({ top: document.getElementById('faq-section').offsetTop - 100, behavior: 'smooth' });
    }
  };

  return (
    <section id="faq-section" className="w-full bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Notebook-style header */}
        <div className="relative mb-12 text-center">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-12 bg-gradient-to-b from-amber-800 to-amber-700 rounded-t-lg z-0 shadow-lg"></div>
          <div className="relative z-10 bg-gradient-to-b from-white to-amber-50 rounded-t-lg pt-8 pb-4 px-8 shadow-2xl border-t-8 border-amber-700">
            <h2 className="text-4xl font-bold text-amber-900 font-serif">Frequently Asked Questions</h2>
            <div className="mt-2 text-amber-600 font-medium">Page {currentPage} of {totalPages}</div>
            
            {/* Notebook binding holes */}
            <div className="absolute top-5 left-12 w-4 h-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-inner"></div>
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-inner"></div>
            <div className="absolute top-5 right-12 w-4 h-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-400 shadow-inner"></div>
          </div>
        </div>
        
        {/* Main content body with cover styling */}
        <div className="relative bg-gradient-to-b from-white to-amber-50 p-8 rounded-b-lg shadow-2xl border-b border-x border-amber-200 mb-8 overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-300 opacity-20 rounded-br-full"></div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-200 to-amber-300 opacity-20 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-amber-200 to-amber-300 opacity-20 rounded-tr-full"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-amber-200 to-amber-300 opacity-20 rounded-tl-full"></div>
          
          {/* Content wrapper */}
          <div className="relative z-10 space-y-6">
            {currentQuestions.map((faq, index) => (
              <div 
                key={index}
                className={`border-l-4 ${openIndex === index ? "border-amber-600 shadow-lg" : "border-amber-300"} bg-gradient-to-r from-white to-amber-50 rounded-r-lg shadow-md transition-all duration-300 hover:shadow-lg`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex justify-between items-center w-full px-6 py-5 text-left hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-200 rounded-r-lg"
                >
                  <span className="text-xl font-medium text-amber-900 pr-4">{faq.question}</span>
                  <span className={`flex items-center justify-center h-8 w-8 rounded-full text-white text-xl font-bold ${openIndex === index ? "bg-gradient-to-br from-amber-700 to-amber-800 rotate-45" : "bg-gradient-to-br from-amber-500 to-amber-600"} transition-all duration-300 shadow-md`}>
                    {openIndex === index ? "+" : "+"}
                  </span>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-amber-100 border-t border-amber-200">
                    <p className="text-amber-800 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-10 flex justify-between items-center relative z-10">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-md ${
                currentPage === 1 
                  ? "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 hover:shadow-lg"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPage(idx + 1);
                    setOpenIndex(null);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all shadow-md ${
                    currentPage === idx + 1
                      ? "bg-gradient-to-br from-amber-700 to-amber-800 text-white shadow-lg"
                      : "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 hover:from-amber-200 hover:to-amber-300"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 shadow-md ${
                currentPage === totalPages 
                  ? "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 hover:shadow-lg"
              }`}
            >
              More
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="relative h-12">
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-tl-lg shadow-lg transform rotate-45 translate-x-8 translate-y-8 border border-amber-300"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-tl-lg shadow-md transform rotate-45 translate-x-6 translate-y-6 opacity-70"></div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;