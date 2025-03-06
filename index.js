const express = require("express");
const dotenv = require("dotenv");
const cors = require('cors');
const userRoutes = require("./src/routers/user");
const authRoutes = require("./src/routers/auth");
const attendanceRoutes = require("./src/routers/attendance");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(userRoutes);
app.use(authRoutes);
app.use(attendanceRoutes);

app.listen(3000, () => {
    console.log(`Server listening at http://localhost:3000`);
});