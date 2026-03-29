const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();

// SQLite Database Connection
const db = new sqlite3.Database("./lab_students.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("DB Connected");
  }
});

// Create students table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER NOT NULL
)`);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// PART 6 — Middleware Requirement: Log every request
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

// Test Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve student list page alias (file is `student.html` but links point to `/students.html`)
app.get('/students.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student.html'));
});
// also support direct `/student.html`
app.get('/student.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student.html'));
});

// PART 4 — (1) POST Route → Add Student
app.post("/add-student", (req, res) => {
  const { name, age } = req.body;
    console.log('POST /add-student body:', req.body);
    const query = "INSERT INTO students (name, age) VALUES (?, ?)";
  
  db.run(query, [name, age], function(err) {
    if (err) {
      console.error("Error inserting student:", err);
      return res.status(500).send("Error adding student");
    }
    console.log(`Student added with ID: ${this.lastID}`);
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
            }
            .success-box {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              text-align: center;
            }
            h1 {
              color: #28a745;
              margin-bottom: 20px;
            }
            p {
              color: #333;
              margin-bottom: 30px;
              font-size: 18px;
            }
            a {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 0 10px;
              font-weight: bold;
            }
            a:hover {
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="success-box">
            <h1>✓ Student Added Successfully!</h1>
            <p>Student <strong>${name}</strong> (Age: ${age}) has been registered.</p>
            <a href="/">Add Another Student</a>
            <a href="/students.html">View All Students</a>
          </div>
        </body>
      </html>
    `);
  });
});

// PART 4 — (2) GET Route → Fetch All Students
app.get("/students", (req, res) => {
  // If the client prefers HTML, serve the students page; otherwise return JSON list
  const accepts = req.headers.accept || '';
  const query = "SELECT * FROM students";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching students:", err);
      return res.status(500).json({ error: "Error fetching students" });
    }

    if (accepts.includes('text/html')) {
      // Serve the student list page (the page will fetch JSON from the same route)
      return res.sendFile(path.join(__dirname, 'public', 'student.html'));
    }

    // Default: return JSON data
    res.json(rows);
  });
});

// Additional route to get single student by ID
app.get("/students/:id", (req, res) => {
  const query = "SELECT * FROM students WHERE id = ?";
  
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      console.error("Error fetching student:", err);
      return res.status(500).json({ error: "Error fetching student" });
    }
    res.json(row);
  });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running...");
  console.log(`Server started on http://localhost:${PORT}`);
});

// Fallback route to accept form-encoded submissions (if form used without JS)
app.post('/add-event-form', (req, res) => {
  console.log('POST /add-event-form body:', req.body);
  const { eventName, eventDate, eventLocation, eventType } = req.body;

  // Map form fields to DB columns
  const name = eventName || req.body.name;
  const date = eventDate || req.body.date;
  const location = eventLocation || req.body.location;
  const type = eventType || req.body.type;

  if (!name || !date || !location || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `INSERT INTO events (name, event_date, location, type) VALUES (?, ?, ?, ?)`;
  db.run(query, [name, date, location, type], function (err) {
    if (err) {
      console.error('❌ Error adding event (form):', err);
      return res.status(500).json({ error: 'Failed to add event' });
    }
    console.log(`✅ Event added via form with ID: ${this.lastID}`);
    res.redirect('/#events');
  });
});