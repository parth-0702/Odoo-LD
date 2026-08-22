require("dotenv").config();

const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const aiRoutes = require("./routes/ai.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler (must come after all valid routes)
app.use(notFound);

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`globetrotter-ai service running on port ${PORT}`);
});
