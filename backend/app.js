const express = require("express");
const cors = require("cors");
const path = require("path");
const loginRouter = require("./api/login").router;
const injuriesRouter = require("./api/injuries");
const registerRouter = require("./api/register");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(
  cors({
    origin: "https://mountain-rescue-863ea.web.app",
    credentials: true,
  })
);

app.use("/api/injuries", injuriesRouter);
app.use("/api", registerRouter);

app.use("/api", loginRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port:${PORT}`);
});
