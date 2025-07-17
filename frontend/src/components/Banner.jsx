import React from "react";

const FeatureCard = ({ icon, title, description, background }) => (
  <div
    className={`relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full flex items-center justify-center
      overflow-hidden shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-2xl ${background}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full z-10"></div>
    <div className="z-20 text-center text-white p-4">
      <div className="mb-2 text-2xl md:text-3xl">{icon}</div>
      <h3 className="text-sm md:text-lg font-bold">{title}</h3>
      <p className="hidden lg:block text-xs md:text-sm">{description}</p>
    </div>
    <div className="absolute -inset-20 bg-white/5 blur-3xl rounded-full opacity-50"></div>
  </div>
);

const Banner = () => {
  const features = [
    {
      icon: "📊",
      title: "Analytics",
      description: "Advanced insights for smarter decisions.",
      background: "bg-gradient-to-br from-purple-500 to-indigo-600",
    },
    {
      icon: "🔒",
      title: "Security",
      description: "Multi-layered protection for peace of mind.",
      background: "bg-gradient-to-br from-green-500 to-teal-500",
    },
    {
      icon: "⚡",
      title: "Speed",
      description: "Fast, efficient, and reliable processes.",
      background: "bg-gradient-to-br from-orange-500 to-red-500",
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Seamlessly connect with the world.",
      background: "bg-gradient-to-br from-blue-500 to-cyan-600",
    },
  ];

  return (
    <div className="  flex items-center justify-center p-6">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 max-w-7xl">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            background={feature.background}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
