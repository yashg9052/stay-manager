🏠 Stay Manager

A full-stack property management system to manage Flats → Rooms → Beds → Tenants with a strict relational structure and backend-enforced business logic.

This project demonstrates strong fundamentals in REST API design, relational data modeling, and full-stack integration.

🚀 Live Demo
🌐 Frontend: https://stay-manager-project.netlify.app
🔗 Backend API: https://stay-manager.onrender.com
📦 Tech Stack
Frontend
Next.js
Minimal Ui
Fetch-based API integration
Backend
Express.js
RESTful API architecture
Centralized error handling
Database
PostgreSQL via Supabase
Relational schema with constraints
Deployment
Frontend: Netlify
Backend: Render
🧠 Core Concept

The system follows a strict hierarchical structure:

Flat → Room → Bed → Tenant
Each entity belongs to its parent
A Tenant is always assigned to a Bed
No direct assignment to Room or Flat
✨ Features
🏢 Flat Management
Create, view, and delete flats
Each flat includes:
Name
Address
Prevents deletion if active tenant assignments exist (requires confirmation)
🚪 Room Management
Create rooms under a flat
Define maximum bed capacity
Enforces:
❌ Cannot exceed defined capacity
🛏️ Bed Management
Create beds under rooms
Each bed has a status:
✅ Available
🔴 Occupied
🛠️ Under Maintenance
Status updates automatically based on tenant assignment
👤 Tenant Management
Create tenant records
Assign tenant to a bed

Rules enforced:

❌ One tenant can have only one active bed
🔄 Reassignment auto-updates previous bed to Available
❌ Cannot delete tenant with active assignment
📊 Occupancy Dashboard
View occupancy stats per:
Flat
Room

Example:

Flat A → 8 / 10 beds occupied (80%)
🔐 Business Logic (Backend Enforced)

All rules are strictly handled on the backend:

❌ Cannot assign tenant to:
Occupied bed
Under Maintenance bed
❌ Room cannot exceed bed capacity
❌ Flat cannot be deleted if any bed has active tenants
❌ Tenant cannot be deleted with active assignment
🔄 Reassigning tenant:
Old bed → Available
New bed → Occupied
⚙️ Setup Instructions
1️⃣ Clone Repository
git clone <your-repo-url>
cd <repo-name>
2️⃣ Backend Setup
cd backend
npm install

Create a .env file based on .env.example

PORT=__________
DB_HOST=__________
DB_PORT=__________
DB_USER=__________
DB_PASSWORD=__________
DB_NAME=__________

Run server:

npm run dev
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
🔗 API Overview

Base URL:

https://stay-manager.onrender.com/api
Example Endpoints
Method	Endpoint	Description
POST	/flats	Create flat
GET	/flats	Get all flats
DELETE	/flats/:id	Delete flat
POST	/rooms	Create room
POST	/beds	Create bed
POST	/tenants	Create tenant
POST	/assign	Assign tenant to bed
💡 Key Highlights
Clean relational design using PostgreSQL
Strong backend validation (not just frontend)
Real-world constraint handling
Modular Express architecture
Scalable full-stack integration
📌 Future Improvements
Authentication & role-based access
Advanced dashboard with charts
Search & filtering
Pagination
Audit logs for assignments
👨‍💻 Author

Yash Gupta
