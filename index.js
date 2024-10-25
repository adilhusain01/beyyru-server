const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const userVerificationRoutes = require('./routes/userVerificationRoutes');
const carouselRouter = require('./routes/carouselSectionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const conditionRoutes = require('./routes/conditionRoutes');
const demographicRoutes = require('./routes/demographicRoutes');
const typeRoutes = require('./routes/typeRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const heroBanner = require('./routes/heroBannerRoutes');
const blogRouter = require('./routes/blogRoutes');
const cartRouter = require('./routes/cartRouter');
const addressRouter = require('./routes/addressRouter');
const purchaseHistoryRouter = require('./routes/purchaseHistoryRoutes');
const discountRoutes = require('./routes/discountRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { logger } = require('./middleware/logEvents');
const { sendEmail } = require('./util/emailSender');
const { verifyPayment } = require('./controllers/verifyPayment');
const orderRoutes = require('./routes/orderRoute');
const User = require('./models/userModel');

// const {createOrder} = require('./controllers/orderController')
// Load environment variables
const NewsLetter = require('./models/newsLetterModel'); // Import NewsLetter model
dotenv.config();

connectDB();

const app = express();
app.use(logger);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/verification', userVerificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/carousel', carouselRouter);
app.use('/api', categoryRoutes);
app.use('/api/product', productRoutes);
app.use('/api/ingredient', ingredientRoutes);
app.use('/api/condition', conditionRoutes);
app.use('/api/demographic', demographicRoutes);
app.use('/api/type', typeRoutes);
app.use('/api/testimonial', testimonialRoutes);
app.use('/api', heroBanner);
app.use('/api/blogs', blogRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/purchasehistory', purchaseHistoryRouter);

app.post('/api/verify-payment', verifyPayment);
app.use('/api/orders', orderRoutes);

app.use('/api/discounts', discountRoutes);
app.get('/api/newsletter', async (req, res) => {
  try {
    const newsLetter = await NewsLetter.find();
    res.status(200).json(newsLetter);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching newsletter', error });
  }
});
app.post('/api/send-email', async (req, res) => {
  const { name, email, message, isNewsLetter } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: 'All fields (name, email, message) are required.' });
  }

  try {
    // console.log(name);
    await sendEmail(name, email, message, isNewsLetter);
    // console.log(email);

    if (isNewsLetter) {
      const existingEntry = await NewsLetter.findOne({ email });
      if (!existingEntry) {
        const newsLetterEntry = new NewsLetter({ email, subscribed: true });
        await newsLetterEntry.save();
      }

      // Update email_subscription in User collection
      const user = await User.findOne({ email });
      if (user) {
        user.email_subscription = true;
        await user.save();
      }
    }

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
