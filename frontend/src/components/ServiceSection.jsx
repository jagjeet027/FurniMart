import React from 'react';
import { Award, Target, Rocket, Timer } from 'lucide-react';

// ServiceTimelineCard Component
const ServiceTimelineCard = ({icon, title, description, step}) => {
  return (
    <div className="relative bg-white shadow-xl rounded-xl p-8 transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden group border-2 border-transparent hover:border-emerald-300">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-200 opacity-0 group-hover:opacity-30 transition-opacity rounded-xl"></div>

      {/* Step Indicator */}
      <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 rotate-45 bg-emerald-500 text-white w-20 h-20 flex items-center justify-center text-2xl font-bold rounded-full shadow-lg opacity-10 group-hover:opacity-20 transition-all">
        {step}
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Icon Container */}
        <div className="w-24 h-24 bg-white shadow-md rounded-full flex items-center justify-center transform transition-transform duration-300 group-hover:-translate-y-3 group-hover:shadow-lg">
          {React.cloneElement(icon, {
            className: "w-12 h-12 text-emerald-600 transition-colors group-hover:text-emerald-800",
          })}
        </div>
        {/* Title */}
        <h3 className="text-2xl font-semibold text-center text-gray-800 group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>
        {/* Description */}
        <p className="text-md text-gray-600 text-center leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

// ServiceSection Component
const ServiceSection = () => {
  const services = [
    {
      icon: <Award />,
      title: "Direct Manufacturer Connection",
      description:
        "Furnimart creates a direct communication channel between customers and manufacturers, enabling personalized furniture designs tailored to individual preferences.",
      step: "01",
    },
    {
      icon: <Target />,
      title: "Seamless Administrative Management",
      description:
        "Efficient administrative tools facilitate smooth communication, order tracking, and ensure top-quality service for customers and manufacturers.",
      step: "02",
    },
    {
      icon: <Rocket />,
      title: "Effortless Product Discovery",
      description:
        "An intuitive interface helps customers explore a wide range of furniture, apply filters, and find pieces that suit their style and needs.",
      step: "03",
    },
  ];

  return (
    <section
      className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 py-20"
      aria-labelledby="service-timeline-heading"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        {/* Heading */}
        <header className="text-center mb-16">
          <h2
            id="service-timeline-heading"
            className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 tracking-tight flex items-center justify-center gap-4"
          >
            <Timer className="w-12 h-12 text-emerald-600" />
            Our Service Journey
          </h2>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Transforming furniture shopping into an exciting adventure of
            innovation and quality.
          </p>
        </header>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-20 bottom-20 w-1 bg-emerald-300 opacity-50"></div>

          {/* Timeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <div
                key={index}
                className={`
                  relative ${index % 2 === 0 ? 'md:translate-y-10' : 'md:-translate-y-10'}
                  transition-transform duration-300
                `}
              >
                <ServiceTimelineCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  step={service.step}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <svg
        className="absolute bottom-0 left-0 w-full h-48 text-white opacity-80"
        preserveAspectRatio="none"
        viewBox="0 0 1440 320"
        fill="currentColor"
      >
        <path d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,170.7C672,149,768,139,864,154.7C960,171,1056,213,1152,229.3C1248,245,1344,235,1392,229.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320L192,320L96,320L0,320Z"></path>
      </svg>
    </section>
  );
};

export default ServiceSection;
