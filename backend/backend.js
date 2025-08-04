const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // npm install node-fetch

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/submit', async (req, res) => {
  const data = req.body;
  console.log("📥 Received data from frontend:", data); 

  if (!data.enroll || !data.name) {
    return res.json({ result: { success: false, message: 'Missing data' } });
  }

  try {
   const response = await fetch('https://script.google.com/macros/s/AKfycbxsHWhI4A1yT1vi5GQCB3HRUetUgeLPS2cr8JfmNjObNiDbfyPMzxjNskd4SN75cY7J/exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});


    const result = await response.json();
    console.log("📥 Google Sheet Response:", result);

    if (result.success) {
    console.log("📤 Sending data to Google Script:", data);

      res.json({ result: { success: true } });
    } else {
      console.error("❌ Google Sheet returned failure:", result);
      res.json({ result: { success: false, message: 'Google Sheet error' } });
    }

  } catch (err) {
    console.error("❌ Error sending to Google Sheet:", err);
    res.json({ result: { success: false, message: 'Server Error' } });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
