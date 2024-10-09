const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/studentDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  dob: Date,
  profilePhoto: String,
  studentId: String,
});

const Student = mongoose.model('Student', studentSchema);

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// CRUD Routes

// Create a new student
app.post('/students', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, dob, studentId } = req.body;
    const profilePhoto = req.file ? req.file.path : '';

    const student = new Student({
      name,
      dob,
      profilePhoto,
      studentId,
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read a specific student
app.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a student
app.put('/students/:id', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { name, dob, studentId } = req.body;
    const profilePhoto = req.file ? req.file.path : undefined;

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, dob, studentId, ...(profilePhoto && { profilePhoto }) },
      { new: true }
    );

    if (updatedStudent) {
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a student
app.delete('/students/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (deletedStudent) {
      res.json({ message: 'Student deleted successfully' });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});