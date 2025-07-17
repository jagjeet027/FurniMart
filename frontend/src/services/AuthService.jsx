import React from "react";

const HomePage = () => {
  const benefits = [
    { title: "Work-Life Balance", desc: "Flexible hours and remote options." },
    { title: "Growth Opportunities", desc: "Training programs to advance your career." },
    { title: "Inclusive Environment", desc: "We value diversity and inclusion." },
    { title: "Competitive Pay", desc: "Industry-leading salaries and benefits." },
    { title: "Innovative Projects", desc: "Work on exciting and cutting-edge projects." },
    { title: "Employee Wellness", desc: "Health and wellness programs for a happy team." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white font-sans">
      {/* Header Section */}
      <div className="text-center py-10">
        <h1 className="text-5xl font-bold animate-fade-in">Welcome to Our Hiring Platform</h1>
        <p className="text-xl mt-4 animate-slide-up">
          Discover opportunities and grow with us. Explore why we are the perfect choice for you!
        </p>
      </div>

      {/* Benefits Section */}
      <div className="px-6 md:px-12 lg:px-32 py-10">
        <h2 className="text-3xl font-semibold mb-4 animate-slide-left">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white text-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center gap-8 py-10">
     <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
    <button className="relative block px-6 py-3 text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1">
      Apply as Individual
    </button>
  </div>
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-red-500 rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-500"></div>
    <button className="relative block px-10 py-3 text-white bg-gradient-to-r from-purple-600 to-red-500 rounded-xl shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-1">
      Apply by orginisation
    </button>
  </div>
</div>


    </div>
  );
};

export default HomePage;
