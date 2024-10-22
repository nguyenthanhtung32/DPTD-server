const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// MONGOSE
const { default: mongoose } = require('mongoose');
const { CONNECTION_STRING } = require('./constants/dbSettings');


const recruitmentRouter = require('./routes/recruitment');
const hotRouter = require('./routes/hot');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);

// Add CORS here
app.use(
  cors({
    origin: '*',
  }),
);

// MONGOOSE
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false); // Tùy chọn này có thể được xem xét
    await mongoose.connect(CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Dừng ứng dụng nếu không thể kết nối
  }
};

// Lắng nghe các sự kiện kết nối
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

// Gọi hàm connectDB để kết nối
connectDB();

app.use('/recruitment', recruitmentRouter);
app.use('/hot', hotRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
