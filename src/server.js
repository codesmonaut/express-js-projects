require(`dotenv`).config();

const express = require(`express`);
const mongoose = require(`mongoose`);
const cors = require(`cors`);
const cookieParser = require(`cookie-parser`);

const songRouter = require(`./routes/songs`);
const authRouter = require(`./routes/auth`);
const userRouter = require(`./routes/users`);

// APP CONFIG
const app = express();
const baseUrl = process.env.BASE_URL;
const port = process.env.PORT;
const database = process.env.DATABASE;

// MIDDLEWARES
app.use(express.json({ limit: '10kb' }));
app.use(cors());
app.use(cookieParser());

// DB CONFIG
mongoose.connect(database).then(() => console.log('Connected to database.'));

// API ENDPOINTS
app.use(`/api/v1/songs`, songRouter);
app.use(`/api/v1/auth`, authRouter);
app.use(`/api/v1/users`, userRouter);

// LISTENER
app.listen(port, () => {
    console.log(`Server is running: ${baseUrl}${port}/`);
})