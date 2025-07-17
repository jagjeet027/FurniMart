import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from '../axios/axiosInstance.js'
import ProductCard from "./ProductCard.jsx"; // Assuming you have this component

const CategoryDetail = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch category details
        const categoryResponse = await api.get(`/categories/${id}`);
        setCategory(categoryResponse.data.category);
        
        // Fetch products in this category
        const productsResponse = await api.get(`/products/category/${id}`);
        setProducts(productsResponse.data.products || []);
      } catch (err) {
        console.error("Error fetching category details:", err);
        setError("Failed to load category details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategoryDetails();
    }
  }, [id]);

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

  if (!category) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Category not found</p>
        <Link to="/categories" className="text-orange-600 hover:underline mt-2 inline-block">
          Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-800">{category.name}</h2>
        <Link
          to="/furniture"
          className="flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Link>
      </div>
      
      {category.description && (
        <p className="text-gray-600 mb-6">{category.description}</p>
      )}
      
      <h3 className="text-xl font-semibold text-orange-700 mb-4">Products in this category</h3>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No products found in this category.
          {/* Show add product link for admin users */}
          {localStorage.getItem("token") && (
            <div className="mt-4">
              <Link
                to="/products/add"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Product
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;