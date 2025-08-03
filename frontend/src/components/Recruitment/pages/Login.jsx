import React, { useState } from 'react';
import { Upload, Mail, Lock, User, FileText } from 'lucide-react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    resume: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume' && files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <User className="w-4 h-4 mr-2" />
          Full Name
        </label>
        <input
          type="text"
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Mail className="w-4 h-4 mr-2" />
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Lock className="w-4 h-4 mr-2" />
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <FileText className="w-4 h-4 mr-2" />
          Resume
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="resume" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                <span>Upload a file</span>
                <input
                  id="resume"
                  name="resume"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={handleInputChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Sign In
      </button>
    </form>
  );
};



export default LoginForm;