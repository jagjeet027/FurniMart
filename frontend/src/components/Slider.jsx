// Slider.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



const Slider = ({ slides, currentSlide, setCurrentSlide }) => {

  if (!slides || slides.length === 0) return null;

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative h-[500px] rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold mb-2"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl"
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;


// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ChevronLeft, ChevronRight } from 'lucide-react';

// const Slider = ({ slides, currentSlide, setCurrentSlide }) => {
//   const handleNext = () => {
//     setCurrentSlide((prev) => (prev + 1) % slides.length);
//   };

//   const handlePrev = () => {
//     setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
//   };

//   return (
//     <div className="relative w-full h-[500px] overflow-hidden">
//       <AnimatePresence>
//         <motion.div
//           key={currentSlide}
//           initial={{ opacity: 0, x: 100 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: -100 }}
//           transition={{ duration: 0.5 }}
//           className="absolute inset-0"
//         >
//           <div 
//             className="w-full h-full bg-cover bg-center relative"
//             style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
//           >
//             <div className="absolute inset-0 bg-black/40 flex items-end p-8">
//               <div className="text-white">
//                 <h2 className="text-3xl font-bold mb-2">{slides[currentSlide].title}</h2>
//                 <p className="text-lg">{slides[currentSlide].subtitle}</p>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </AnimatePresence>

//       {/* Navigation Buttons */}
//       <button
//         onClick={handlePrev}
//         className="absolute left-4 top-1/2 -translate-y-1/2 
//           bg-white/30 backdrop-blur-sm 
//           p-2 rounded-full 
//           z-10 hover:bg-white/50 
//           transition-all duration-300"
//       >
//         <ChevronLeft className="text-white w-6 h-6" />
//       </button>
//       <button
//         onClick={handleNext}
//         className="absolute right-4 top-1/2 -translate-y-1/2 
//           bg-white/30 backdrop-blur-sm 
//           p-2 rounded-full 
//           z-10 hover:bg-white/50 
//           transition-all duration-300"
//       >
//         <ChevronRight className="text-white w-6 h-6" />
//       </button>

//       {/* Slide Indicators */}
//       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
//         {slides.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => setCurrentSlide(index)}
//             className={`
//               w-3 h-3 rounded-full 
//               transition-all duration-300
//               ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'}
//             `}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Slider;