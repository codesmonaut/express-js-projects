require(`dotenv`).config();

const path = require(`path`);
const express = require(`express`);
const mongoose = require(`mongoose`);
const cors = require(`cors`);
const cookieParser = require(`cookie-parser`);
const helmet = require(`helmet`);
const hpp = require(`hpp`);
const rateLimit = require(`express-rate-limit`);
const mongoSanitize = require(`express-mongo-sanitize`);

const songRouter = require(`./routes/songs`);
const authRouter = require(`./routes/auth`);
const userRouter = require(`./routes/users`);
const playlistRouter = require(`./routes/playlists`);
const serverRateLimit = require(`./config/serverRateLimit`);
const ErrorResponse = require(`./utils/ErrorResponse`);
const handleErr = require(`./utils/handleErr`);

// APP CONFIG
const app = express();
const baseUrl = process.env.BASE_URL;
const port = process.env.PORT;
const database = process.env.DATABASE;

// MIDDLEWARES
app.use(express.json({ limit: '10kb' }));
app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(hpp());
app.use(rateLimit(serverRateLimit));
app.use(mongoSanitize());

// STATIC FILES
app.use(`/uploads`, express.static(path.join(`${__dirname}/uploads`)));
app.use(`/img`, express.static(`${__dirname}/img`));

// DB CONFIG
mongoose.connect(database).then(() => console.log('Connected to database.'));

// API ENDPOINTS
app.use(`/api/v1/songs`, songRouter);
app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/playlists`, playlistRouter);
app.all(`*`, (req, res) => {
    handleErr(res, new ErrorResponse(404, `Page ${req.originalUrl} not found.`));
})

// LISTENER
app.listen(port, () => {
    console.log(`Server is running: ${baseUrl}${port}/`);
})