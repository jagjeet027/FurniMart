import { useState, useEffect } from "react";
import api from "../axios/axiosInstance";

const useProductsByCategory = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoryNames } = await api.get("/product/categories");

        if (!Array.isArray(categoryNames)) {
          throw new Error("Invalid category response format");
        }

        const categoryData = await Promise.all(
          categoryNames.map(async (category) => {
            try {
              const { data } = await api.get(
                `/api/products/category/${category}`
              );

              return {
                name: category,
                products: data.map((product) => ({
                  id: product._id,
                  name: product.name,
                  price: `$${product.price}`,
                  image: product.images?.[0] || "default.jpg",
                  images: product.images || [],
                  description: product.description,
                  rating: product.rating,
                  reviews: product.reviews,
                  manufacturer: product.manufacturer,
                  manufacturerInfo: product.manufacturerInfo,
                  sizes: product.sizes || [],
                  features: product.features || [],
                })),
              };
            } catch (error) {
              console.error(`Failed to fetch products for ${category}:`, error);
              return { name: category, products: [] }; // Ensure structure remains valid
            }
          })
        );

        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories and products:", error);
      }
    };

    fetchCategories();
  }, []);

  return categories;
};

export default useProductsByCategory;
