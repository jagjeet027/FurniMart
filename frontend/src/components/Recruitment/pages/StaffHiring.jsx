import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Building2, Users, Rocket, Brain, Heart, Target, Award, Coffee } from "lucide-react";

const EmployeeFacilities = () => {
  const navigate = useNavigate();
  
  const benefits = [
    { 
      title: "Work-Life Balance",
      desc: "Flexible working hours, remote work options, and unlimited vacation policy to help you maintain perfect harmony between your personal and professional life.",
      icon: <Coffee className="w-6 h-6 text-purple-500" />
    },
    {
      title: "Growth Opportunities",
      desc: "Continuous learning programs, mentorship opportunities, and career advancement paths designed to help you reach your full potential.",
      icon: <Rocket className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Inclusive Environment",
      desc: "A diverse and inclusive workplace where every voice matters. We celebrate differences and create a space where everyone belongs.",
      icon: <Users className="w-6 h-6 text-green-500" />
    },
    {
      title: "Competitive Pay",
      desc: "Industry-leading compensation package including competitive salary, performance bonuses, and comprehensive benefits.",
      icon: <Award className="w-6 h-6 text-yellow-500" />
    },
    {
      title: "Innovative Projects",
      desc: "Work on cutting-edge technology and challenging projects that make a real impact in the world.",
      icon: <Brain className="w-6 h-6 text-red-500" />
    },
    {
      title: "Employee Wellness",
      desc: "Comprehensive health insurance, mental health support, fitness programs, and wellness initiatives for your overall well-being.",
      icon: <Heart className="w-6 h-6 text-pink-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight animate-fade-in">
              Your Career Journey 
              <span className="block text-yellow-300 mt-2">Starts Here</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-200">
              Join our innovative platform and discover opportunities that match your aspirations.
              Take the next step in your professional journey with us.
            </p>
          </div>

          {/* Registration Cards */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual Registration */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <button 
                onClick={() => navigate('/register/individual')}
                className="relative flex flex-col items-center gap-4 px-8 py-12 bg-white rounded-lg leading-none divide-y divide-gray-200 hover:text-purple-600 transition-colors duration-300"
              >
                <Users className="w-16 h-16 text-purple-600" />
                <div className="text-gray-800 pt-4">
                  <h3 className="text-xl font-bold">Register as Individual</h3>
                  <p className="mt-2 text-gray-600">Perfect for job seekers looking for their next opportunity</p>
                  <span className="inline-flex items-center mt-4 text-purple-600 font-semibold">
                    Get Started <ChevronRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </button>
            </div>

            {/* Organization Registration */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <button 
                onClick={() => navigate('/register/organization')}
                className="relative flex flex-col items-center gap-4 px-8 py-12 bg-white rounded-lg leading-none divide-y divide-gray-200 hover:text-blue-600 transition-colors duration-300"
              >
                <Building2 className="w-16 h-16 text-blue-600" />
                <div className="text-gray-800 pt-4">
                  <h3 className="text-xl font-bold">Register as Organization</h3>
                  <p className="mt-2 text-gray-600">For companies looking to hire top talent</p>
                  <span className="inline-flex items-center mt-4 text-blue-600 font-semibold">
                    Get Started <ChevronRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Choose Our Platform?
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Discover the advantages that make us stand out
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Ready to Begin Your Journey?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register/individual')}
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Register as Individual
            </button>
            <button
              onClick={() => navigate('/register/organization')}
              className="px-8 py-4 bg-transparent border-2 border-white rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300"
            >
              Register as Organization
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes tilt {
          0%, 50%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(0.5deg);
          }
          75% {
            transform: rotate(-0.5deg);
          }
        }
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default EmployeeFacilities;