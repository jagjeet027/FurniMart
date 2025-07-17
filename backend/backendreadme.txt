
Furniture-App
##Backend Documentation

###API Endpoints

User Authentication

POST /api/users/send-otp→ Send OTP for authentication.
POST /api/users/verify-otp→ Verify OTP for user authentication.
POST /api/users/register → User registration.
POST /api/users/login → User login.
POST /api/users/refresh-token→ Refresh authentication token.
Manufacturers Management

POST /api/manufacturers/register→ Register a new manufacturer.
GET /api/manufacturers/allmanufacturers→ Fetch all manufacturers.
GET /api/manufacturers/stats→ Retrieve manufacturer statistics.
GET /api/manufacturers/:id→ Get manufacturer details.
PUT /api/manufacturers/:id→ Update manufacturer information.
PATCH /api/manufacturers/:id/status → Update manufacturer status.
DELETE /api/manufacturers/:id → Delete manufacturer.
Notifications Management

GET /api/notifications → Retrieve all notifications.
PATCH/api/notifications/:id/read→ Mark notification as read.
Payments Processing

POST /api/payments/create-order → Create a new order.
POST /api/payments/verify-payment → Verify payment transaction.
GET /api/payments/details/:manufacturerId→ Fetch payment details by manufacturer ID.
Products Management

POST /api/products/add→ Add a new product.
DELETE /api/products/remove/:id → Remove a product.
GET /api/products/→ Fetch all products.
GET /api/products/:id→ Get product details by ID.
GET /api/products/categories→ Retrieve all product categories.
GET /api/products/category/:category→ Get products by category.
Chat Support

POST /api/chat→ Processes user input, searches for a matching predefined issue, and returns a relevant response or default message if no match is found.
Security Enhancements

JWT Authentication for securing user sessions.
Role-Based Access Control (RBAC) for admins and customers.
Rate Limiting & API Security to prevent abuse.