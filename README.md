# 💬 Suchale - Real-Time Chat Application

Suchale is a real-time messaging web application built using the **MERN** stack (MongoDB, Express, React, Node.js) with **Socket.IO** for instant communication between users.

## 🚀 Features

- 🔐 User Authentication (Signup/Login)
- 💬 Real-time 1-to-1 messaging with WebSockets (Socket.IO)
- 🟢 Online/offline user status
- 📜 Chat history stored in MongoDB
- 📱 Responsive UI using Tailwind CSS
- ⚙️ Backend API built with Express.js

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Context API

**Backend:**
- Node.js
- Express.js
- MongoDB (with Mongoose)
- Socket.IO
- JWT for authentication

## 📦 Installation

### Prerequisites
- Node.js & npm
- MongoDB (local or cloud like MongoDB Atlas)

### Backend ENV sample
```
PORT =
MongoDb_URI = 
Frontend_URL = 
jwt_Secret = 
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend ENV sample 

```
VITE_URL = 
VITE_Socket_URL =
```
### 1) Login Page
![image](https://github.com/user-attachments/assets/19efdbe9-4f82-4aa8-a3ea-e25aacf2da27)
### 2) Home Page
![image](https://github.com/user-attachments/assets/811a847a-a368-4e3a-b845-82aab09e26dd)
### 3) User Chat
![image](https://github.com/user-attachments/assets/94874d3e-169e-4605-ac40-6216661b20ee)
### 4) Image Viewer
![image](https://github.com/user-attachments/assets/4359578f-72e6-4a58-b494-f31021851976)
### 5) Settings Page
![image](https://github.com/user-attachments/assets/cf6c9ec0-3f26-4fd9-abe5-b4872da16df8)

### Clone the repository

```bash
git clone https://github.com/kush34/Suchale.git
cd Suchale
````

### Backend Setup

```bash
cd backend
npm install
npx nodemon index.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the app.

## 🌐 Live Demo

Try it live 👉 [https://suchale.vercel.app](https://suchale.vercel.app)

## 📁 Project Structure

```
Suchale/
├── backend/    # Node + Express API + Socket.IO server
|   └── config
│   ├── models/
│   └── controllers/
│   ├── routes/
|   └── utils/
├── frontend/src/   # React frontend
│   ├── Components/
│   ├── Store/
│   └── pages/
|   └── utils
```

## ✅ Todo / Future Improvements

* ✅ Add emojis and typing indicators
* ⏳ Improve mobile responsiveness
* ⏳ Add group chat functionality
* ⏳ Message read receipts
* ⏳ Deployment with Docker


## 📃 License

This project is open-source under the MIT License. Feel free to use and modify!


