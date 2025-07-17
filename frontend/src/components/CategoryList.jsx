import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from '../axios/axiosInstance.js'

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        const categoriesData = response.data.categories || response.data;
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-orange-800 mb-6">Product Categories</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/category/${category._id}`}
            className="block p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <div className="font-semibold text-orange-700">{category.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {category.products?.length || 0} products
            </div>
          </Link>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No categories found. Start by adding products to create categories.
        </div>
      )}
    </div>
  );
};

export default CategoryList;