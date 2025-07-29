require('dotenv').config(); // 🔒 .env file ka use

const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 🔐 Admin credentials
const ADMIN_EMAIL = "tabassumbaby453@gmail.com";
const ADMIN_PASSWORD="$2b$10$pmEoTv8DGcUyXcWW.Basj.F86l4DuA2OORho6XV4tV.1wsCPTZ8pe";

const JWT_SECRET = process.env.JWT_SECRET;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// 🔓 LOGIN Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && bcrypt.compareSync(password, ADMIN_PASSWORD)) {
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
    return res.json({ success: true, token });
  } else {
    return res.json({ success: false, message: "Invalid credentials" });
  }
});

// 🔐 Token Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ✅ Certificate Save Route
app.post('/submit', authenticateToken, async (req, res) => {
  try {
    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const data = req.body;
    const values = [[
  data.enroll, data.issued, data.name, data.father, // ✅ correct
  data.course, data.joining, data.grade, data.address
]];


    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    res.json({ success: true, message: 'Certificate saved!' });
  } catch (error) {
    console.error('Error saving certificate:', error);
    res.json({ success: false, message: 'Failed to save certificate' });
  }
});

// 🔍 Certificate Verify Route
app.post('/verify', async (req, res) => {
  try {
    const { enroll } = req.body;

    const credentials = JSON.parse(fs.readFileSync('credentials.json'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A2:H', // A2: skip headers
    });

    const rows = response.data.values || [];

    const match = rows.find(row => row[0] === enroll);

    if (match) {
      res.json({
        success: true,
        certificate: {
          enroll: match[0],
          issued: match[1],
          name: match[2],
          fatherName: match[3],
          course: match[4],
          joining: match[5],
          grade: match[6],
          address: match[7]
        }
      });
    } else {
      res.json({ success: false, message: "Certificate not found" });
    }

  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
});

// 🟢 Server Start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});


