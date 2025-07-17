import { useState } from "react";
import api from '../axios/axiosInstance'

export const useCloudinaryUpload = (uploadPreset) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImage = async (file) => {
    if (!file) {
      setError("No file selected");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    let cloudName = import.meta.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

    try {
      const response = await api.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      setImageUrl(response.data.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { imageUrl, uploadImage, loading, error };
};

