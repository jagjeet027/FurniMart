# Product API Documentation

This documentation provides details about the Product API endpoints, their usage, and examples.

## Base URL
```
/api/products
```

## Endpoints

### 1. Add Product
Add a new product to the database.

- **URL:** `/add`
- **Method:** `POST`
- **Request Body:**
```json
{
  "name": "Modern Sofa",
  "description": "A comfortable modern sofa",
  "price": 999.99,
  "category": "Sofa",
  "stock": 10,
  "manufacturer": "Furniture Co",
  "imageUrl": "https://example.com/sofa.jpg",
  "specifications": {
    "dimensions": "200x100x85 cm",
    "material": "Leather",
    "color": "Brown"
  }
}
```
- **Success Response:**
  - **Code:** 201
  - **Content:**
```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Modern Sofa",
    // ... other product details
  }
}
```
- **Error Response:**
  - **Code:** 400
  - **Content:** `{ "success": false, "message": "Error message" }`

### 2. Update Product
Update an existing product by ID.

- **URL:** `/update/:id`
- **Method:** `PUT`
- **URL Params:** `id=[string]` (Product ID)
- **Request Body:** (Include only fields that need to be updated)
```json
{
  "price": 899.99,
  "stock": 15
}
```
- **Allowed Fields:**
  - name
  - description
  - price
  - category
  - stock
  - manufacturer
  - imageUrl
  - specifications
- **Success Response:**
  - **Code:** 200
  - **Content:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "_id": "product_id",
    // ... updated product details
  }
}
```
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "success": false, "message": "Product not found" }`
  - **Code:** 400
  - **Content:** `{ "success": false, "message": "Invalid updates", "allowedFields": [...] }`

### 3. Remove Product
Delete a single product by ID.

- **URL:** `/remove/:id`
- **Method:** `DELETE`
- **URL Params:** `id=[string]` (Product ID)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "Product removed successfully" }`
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Product not found" }`

### 4. Bulk Delete Products
Delete multiple products at once.

- **URL:** `/bulk-delete`
- **Method:** `DELETE`
- **Request Body:**
```json
{
  "ids": ["productId1", "productId2", "productId3"]
}
```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "message": "Successfully deleted X products" }`
- **Error Response:**
  - **Code:** 400
  - **Content:** `{ "success": false, "message": "Please provide valid product IDs for deletion" }`

### 5. Get All Products
Retrieve all products.

- **URL:** `/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of product objects
- **Error Response:**
  - **Code:** 500
  - **Content:** `{ "message": "Server Error", "error": "error details" }`

### 6. Get Product by ID
Retrieve a specific product by ID.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id=[string]` (Product ID)
- **Success Response:**
  - **Code:** 200
  - **Content:** Product object
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Product not found" }`

### 7. Get All Categories
Retrieve all unique product categories.

- **URL:** `/categories`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
```json
{
  "success": true,
  "categories": ["Sofa", "Chair", "Table", ...]
}
```
- **Error Response:**
  - **Code:** 500
  - **Content:** `{ "success": false, "message": "Server error" }`

### 8. Get Products by Category
Retrieve all products in a specific category.

- **URL:** `/category/:category`
- **Method:** `GET`
- **URL Params:** `category=[string]`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of products in the specified category
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Products not found" }`
  - **Code:** 400
  - **Content:** `{ "message": "Category is required" }`

## Error Handling
All endpoints include proper error handling for:
- Invalid input data
- Server errors
- Not found resources
- Validation errors

## Notes
- All requests that include a body should have `Content-Type: application/json` header
- All responses are in JSON format
- Authentication/Authorization requirements (if any) should be handled by middleware 