const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const applicationsRoutes = require('./routes/applications');
const companiesRoutes = require('./routes/companies');
const profilesRoutes = require('./routes/profiles');
const interviewsRoutes = require('./routes/interviews');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend tĩnh
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Job ATS API is running' });
});

// Fallback cho SPA-like (trả về index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi server nội bộ.' });
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`  Job ATS Server đang chạy tại:`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`========================================`);
});
