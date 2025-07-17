import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../axios/axiosInstance';

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);
        const [categoryResponse, productsResponse] = await Promise.all([
          api.get(`/categories/${categoryId}`),
          api.get(`/products?category=${categoryId}`)
        ]);

        setCategory(categoryResponse.data.category);
        setProducts(productsResponse.data.products);
        setError(null);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryAndProducts();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {category?.name || 'Category Products'}
          </h1>
          <p className="text-gray-600">
            {category?.description || 'Browse our collection'}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts; 