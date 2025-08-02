require('dotenv').config();
const express = require('express')
const app = express()


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY from .env:', process.env.STRIPE_SECRET_KEY);

const session = require('express-session')
const cookieParser = require("cookie-parser");
const rootRoutes = require('./routes/authRoutes')
const authRouter = require("./routes/Socialite")
const corsMiddleware = require("./security/cors");
app.use(corsMiddleware);
const rateLimit = require("./security/rateLimit");
app.use(rateLimit); // استخدام middleware تحديد معدل الطلبات

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);





app.use(express.json())
app.use(cookieParser()); // هنا
const bookRoutes = require('./routes/bookRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

app.use('/api/books', bookRoutes);
app.use('/api', mediaRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use(rootRoutes)
app.use("/auth", authRouter);


const oauth = require("./config/oauth");
app.use(oauth.initialize());



// 1. Connect to MongoDB
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
  }) , console.log('✔️ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

