# SmartEMI Backend – AI Powered Loan Advisory API

Backend service for **SmartEMI**, a fintech web application that helps users analyze education loans using EMI calculations, affordability analysis, financial health scoring, and AI-driven financial advice.

---
## Live API
https://smartemi-backend-b2p7.onrender.com

# 🚀 Features

## Authentication System

* User Registration
* User Login
* JWT Authentication
* Password hashing using bcrypt
* Protected routes

## EMI Calculation Engine

Calculates:

* Monthly EMI
* Total interest
* Total payment

## Loan Affordability Analysis

Analyzes:

* Debt to income ratio
* Savings ratio
* Risk category
* Affordability score

## Financial Health Score

Provides:

* Financial score
* Health category (Poor / Average / Healthy)

## AI Financial Advisor

Integrated with Google Gemini AI.

Provides:

* Risk assessment
* Financial recommendations
* Budget improvement tips

Includes fallback rule engine if AI fails.

## Loan History System

Stores:

* Loan data
* EMI values
* Risk level
* AI advice
* Date created

Users can:

* View history
* Delete records

---

# 🛠 Tech Stack

## Backend

* Node.js
* Express.js
* TypeScript

## Database

* MongoDB Atlas
* Mongoose ODM

## Security

* JWT Authentication
* bcrypt password hashing
* Helmet security middleware
* CORS protection

## AI Integration

* Google Gemini API
* AI fallback logic
* Model caching
* Safe JSON parsing

---

# 📁 Project Structure

```
server/
│
├── controllers/
│   ├── authController.ts
│   ├── emiController.ts
│   ├── affordabilityController.ts
│   ├── aiController.ts
│   ├── analysisController.ts
│
├── models/
│   ├── User.ts
│   ├── LoanAnalysis.ts
│
├── routes/
│   ├── authRoutes.ts
│   ├── emiRoutes.ts
│   ├── aiRoutes.ts
│   ├── analysisRoutes.ts
│   ├── affordabilityRoutes.ts
│
├── services/
│   ├── emiService.ts
│   ├── affordabilityService.ts
│   ├── aiAdvisorService.ts
│
├── middleware/
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│
├── utils/
│
├── config/
│
├── index.ts
├── package.json
├── tsconfig.json
```

---

# ⚙️ Installation

## Clone repository

```
git clone https://github.com/YOUR_USERNAME/SmartEMI-backend.git
```

## Go to folder

```
cd SmartEMI-backend
```

## Install dependencies

```
npm install
```

## Setup environment variables

Create:

```
.env
```

Add:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
GEMINI_API_KEY=your_api_key
```

## Run development server

```
npm run dev
```

## Build project

```
npm run build
```

## Start production server

```
npm start
```

---

# 🔌 API Endpoints

## Auth APIs

Register:

```
POST /api/auth/register
```

Login:

```
POST /api/auth/login
```

---

## EMI APIs

Calculate EMI:

```
POST /api/emi/calculate
```

---

## Affordability APIs

Check loan affordability:

```
POST /api/affordability/check
```

---

## AI APIs

Get AI financial advice:

```
POST /api/ai/advice
```

---

## Analysis APIs

Get loan history:

```
GET /api/analysis/history
```

Delete record:

```
DELETE /api/analysis/:id
```

---

# 🔐 Protected Routes

Requires JWT token:

```
/api/analysis
/api/ai
/api/affordability
```

Header format:

```
Authorization: Bearer TOKEN
```

---

# 🧠 AI Engineering Improvements

Implemented:

* Dynamic Gemini model detection
* Model fallback handling
* Timeout protection
* Quota protection
* JSON normalization
* Error safe parsing
* Rule based fallback advisor

---

# 🌍 Deployment

Backend designed for:

* Render deployment
* MongoDB Atlas cloud database

Production features:

* Build scripts
* Environment config
* Security middleware
* Production start command

---

# 📊 Future Improvements

Planned:

* Rate limiting
* API caching
* Advanced financial scoring
* AI conversation memory
* Payment simulation
* Credit score integration

---

# 👨‍💻 Author

**Dinesh Chaudhary**

Backend Developer | MERN Stack | Fintech Systems | AI Integration

LinkedIn:
https://linkedin.com/in/dinesh-chaudhary-81b928228/

GitHub:
https://github.com/Dinesh-chaudhary1406

LeetCode:
https://leetcode.com/u/CODE_WITH_DINESH/

---

# ⭐ Project Value

This project demonstrates:

* Backend architecture design
* Financial domain logic
* REST API development
* JWT authentication systems
* MongoDB integration
* AI integration patterns
* Production deployment preparation

---

# 📜 License

MIT License
