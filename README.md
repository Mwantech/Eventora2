# 📸 Eventijam

Eventijam is an event media-sharing and management platform that allows organizers, guests, and photographers to upload, manage, and relive event memories in one secure and easy-to-use app.

Built with **React Native** (Frontend) and **Node.js** (Backend), Eventijam aims to revolutionize how events are experienced—by centralizing media in real-time and making it accessible to everyone involved.

---

## 🔧 Tech Stack

### Frontend
- **React Native**
- Expo (optional depending on setup)
- Axios (for API calls)
- React Navigation

### Backend
- **Node.js** with Express
- MongoDB (or MySQL depending on setup)
- Cloudinary or Firebase Storage (for media uploads)
- JWT for Authentication

---

## 🚀 Features

- 📸 Upload and view event media in real-time  
- 🔐 Privacy controls for public or private events  
- 🧠 AI-curated media highlights (coming soon)  
- 🎥 Media uploads by guests, photographers, and organizers  
- 🕹️ Admin dashboard for event content management  
- 📱 QR code for easy guest access  
- 💬 Comment and interact on event posts (optional feature)

---

## 📁 Project Structure

```
eventijam/
├── client/          # React Native frontend
│   ├── assets/
│   ├── components/
│   ├── screens/
│   ├── App.js
│   └── ...
├── server/          # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── index.js
├── README.md
└── .env
```

---

## 🔌 Getting Started

### Prerequisites
- Node.js & npm
- MongoDB (local or cloud)
- React Native CLI or Expo
- Cloudinary/Firebase for media storage

---

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_SECRET=your_secret
   ```

4. Start the server:
   ```bash
   npm start
   ```

---

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API base URL in the `api.js` file (or equivalent) to point to your local or hosted backend.

4. Start the app:
   ```bash
   npx react-native run-android
   # or
   npx expo start
   ```

---


---

## 📌 Future Plans

- ✅ AI-generated event highlights
- ✅ Web dashboard for organizers
- ✅ Livestream & social media integration
- ✅ Media reactions & comments
- ✅ Marketplace for hiring photographers/planners

---

## 🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📬 Contact

**Developer:** Mwangi Joshua  
📧 [mwantech005@gmail.com]  

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape Eventijam
- Special thanks to the React Native and Node.js communities
- Icons and emojis from various open-source projects