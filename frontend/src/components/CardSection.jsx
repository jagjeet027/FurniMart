import React from 'react';

const CardSection = () => {
  const cards = [
    {
      title: 'Discover Exclusive Samples',
      description: 'Explore unique product prototypes and innovative designs',
      image: '/src/assets/facto1.jpeg',
      link: '#',
      icon: '🔬',
      background: 'from-teal-500 to-blue-600',
      hoverEffect: 'group-hover:scale-110 group-hover:rotate-6'
    },
    {
      title: 'Immersive Factory Tours',
      description: 'Experience cutting-edge manufacturing processes',
      image: '/src/assets/facto2.jpeg',
      link: '#',
      icon: '🏭',
      background: 'from-orange-500 to-red-600',
      hoverEffect: 'group-hover:scale-110 group-hover:translate-x-2'
    },
    {
      title: 'Global Manufacturer Network',
      description: 'Connect with industry-leading production experts',
      image: '/src/assets/facto3.jpg',
      link: '#',
      icon: '🌐',
      background: 'from-purple-500 to-indigo-600',
      hoverEffect: 'group-hover:scale-110 group-hover:-rotate-6'
    }
  ];

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-20 overflow-hidden">
      {/* Dynamic Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Source Direct from Factory
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock a world of manufacturing possibilities with our cutting-edge platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="group relative transform transition-all duration-500 hover:-translate-y-4"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-60 group-hover:opacity-100 transition duration-500 blur-lg"></div>
              
              <div className={`
                relative 
                bg-white 
                rounded-2xl 
                shadow-2xl 
                overflow-hidden 
                border-2 border-transparent
                group-hover:border-blue-500
                transition-all 
                duration-500
                transform
                ${card.hoverEffect}
              `}>
                <div className={`
                  absolute 
                  top-0 
                  left-0 
                  w-full 
                  h-full 
                  bg-gradient-to-br 
                  ${card.background} 
                  opacity-20 
                  pointer-events-none
                `}>

                </div>
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="
                      w-full 
                      h-full 
                      object-cover 
                      transform 
                      scale-100 
                      group-hover:scale-110 
                      transition-transform 
                      duration-700
                    "
                  />
                  {/* Icon Overlay */}
                  <div className="
                    absolute 
                    top-4 
                    right-4 
                    bg-white 
                    bg-opacity-80 
                    rounded-full 
                    w-16 
                    h-16 
                    flex 
                    items-center 
                    justify-center 
                    text-4xl
                  ">
                    {card.icon}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 text-center">
                  <h3 className="
                    text-2xl 
                    font-bold 
                    text-gray-800 
                    mb-3 
                    group-hover:text-blue-600 
                    transition-colors
                  ">
                    {card.title}
                  </h3>
                  <p className="
                    text-gray-600 
                    mb-6 
                    text-base
                    opacity-80 
                    group-hover:opacity-100 
                    transition-opacity
                  ">
                    {card.description}
                  </p>
                  
                  {/* Action Button */}
                  <a 
                    href={card.link} 
                    className="
                      inline-block 
                      px-8 
                      py-3 
                      bg-gradient-to-r 
                      from-blue-500 
                      to-purple-600 
                      text-white 
                      rounded-full 
                      font-semibold 
                      uppercase 
                      tracking-wider 
                      text-sm 
                      transform 
                      hover:scale-105 
                      transition-all 
                      duration-300 
                      shadow-lg 
                      hover:shadow-xl
                    "
                  >
                    Explore More
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Background CSS */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 15s infinite;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default CardSection;