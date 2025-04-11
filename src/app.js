const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const supplierRouter = require('./routes/supplierRoutes');
const attributeRouter = require('./routes/attributeRoutes');

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/attributes', attributeRouter); 