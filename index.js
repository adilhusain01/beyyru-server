// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const userVerificationRoutes = require('./routes/userVerificationRoutes');
const carouselRouter = require('./routes/carouselSectionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const heroBanner = require('./routes/heroBannerRoutes');
const blogRouter = require('./routes/blogRoutes');
const cartRouter = require('./routes/cartRouter');
const addressRouter = require('./routes/addressRouter');
const purchaseHistoryRouter = require('./routes/purchaseHistoryRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { logger } = require('./middleware/logEvents');
const { sendEmail } = require('./util/emailSender');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(logger);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/verification', userVerificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/carousel', carouselRouter);
app.use('/api', categoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/testimonial', testimonialRoutes);
app.use('/api', heroBanner);
app.use('/api/blogs', blogRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/purchasehistory', purchaseHistoryRouter);
app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  // Validation: Ensure all fields are provided
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: 'All fields (name, email, message) are required.' });
  }

  try {
    // Call the sendEmail function
    console.log(name);
    await sendEmail(name, email, message);
    console.log(email);

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
