const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Simulate auth middleware (accept any Authorization header)
app.use((req, res, next) => {
  next();
});

// Mock data
let urls = [
  
];

// GET /api/urls
app.get('/api/urls', (req, res) => {
  res.json({ urls });
});

// POST /api/urls
app.post('/api/urls', (req, res) => {
  const { url } = req.body;
  const newUrl = {
    id: urls.length + 1,
    url,
    status: 'queued',
    htmlVersion: 'HTML5',
    pageTitle: url,
    h1Count: 1,
    h2Count: 0,
    h3Count: 0,
    h4Count: 0,
    h5Count: 0,
    h6Count: 0,
    internalLinkCount: 1,
    externalLinkCount: 2,
    inaccessibleLinkCount: 0,
    brokenLinks: [],
    hasLoginForm: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  urls.unshift(newUrl); // Add to the top
  res.status(201).json({ message: 'Url has been added', id: newUrl.id, status: newUrl.status });
});

// GET /api/urls/:id
app.get('/api/urls/:id', (req, res) => {
  const url = urls.find(u => u.id === Number(req.params.id));
  if (!url) return res.status(404).json({ error: 'Not found' });
  res.json(url);
});

app.listen(3001, () => console.log('Mock backend running on http://localhost:3001')); 