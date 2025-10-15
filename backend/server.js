const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');


const app = express();
const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash'});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-summarizer', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  audioFile: { type: String, required: true },
  transcript: { type: String, default: '' },
  summary: { type: String, default: '' },
  actionItems: [{ task: String, assignee: String, priority: String }],
  keyDecisions: [String],
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  createdAt: { type: Date, default: Date.now }
});

const Meeting = mongoose.model('Meeting', meetingSchema);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = 'uploads/audio';
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm', 'video/mp4'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed!'), false);
    }
  }
});

async function analyzeAudioWithGemini(audioPath, mimeType) {
  try {
    const audioFile = {
      inlineData: {
        data: Buffer.from(await fs.readFile(audioPath)).toString("base64"),
        mimeType
      }
    };

    const prompt = `
      You are an expert meeting analyst. Please perform the following tasks for the provided audio file:
      1.  First, create a full, accurate transcript of the entire meeting.
      2.  After creating the transcript, analyze it to extract the following information:
          - A concise summary (2-3 paragraphs).
          - Key decisions made (as a list).
          - Action items with suggested assignees and priority levels (high, medium, or low).

      Provide the final output in a single, clean JSON format like this, and nothing else:
      {
        "transcript": "...",
        "summary": "...",
        "keyDecisions": ["decision1", "decision2"],
        "actionItems": [
          {"task": "...", "assignee": "...", "priority": "high/medium/low"}
        ]
      }
    `;

    const result = await model.generateContent([prompt, audioFile]);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid JSON response format from Gemini');
  } catch (error) {
    console.error('Gemini processing error:', error);
    throw new Error('Failed to process audio with Gemini');
  }
}

async function processMeetingAsync(meetingId, mimeType) {
  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return;

    meeting.status = 'processing';
    await meeting.save();

    const analysis = await analyzeAudioWithGemini(meeting.audioFile, mimeType);

    meeting.transcript = analysis.transcript || 'Transcript not available.';
    meeting.summary = analysis.summary || 'Summary not available.';
    meeting.keyDecisions = analysis.keyDecisions || [];
    meeting.actionItems = analysis.actionItems || [];
    meeting.status = 'completed';
    await meeting.save();
    
  } catch (error) {
    console.error('Processing error:', error);
    const meeting = await Meeting.findById(meetingId);
    if (meeting) {
      meeting.status = 'failed';
      await meeting.save();
    }
  }
}

app.post('/api/meetings/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Meeting title is required' });
    }

    const meeting = new Meeting({
      title,
      audioFile: req.file.path,
      status: 'uploaded'
    });
    await meeting.save();

    processMeetingAsync(meeting._id, req.file.mimetype);

    res.status(201).json({
      message: 'Meeting uploaded successfully',
      meetingId: meeting._id,
      status: 'processing'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload meeting' });
  }
});

app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .select('-transcript')
      .sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
});

app.get('/api/meetings/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
});

app.delete('/api/meetings/:id', async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        try {
            await fs.unlink(meeting.audioFile);
        } catch (err) {
            console.warn('Failed to delete audio file:', err);
        }
        await Meeting.findByIdAndDelete(req.params.id);
        res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete meeting' });
    }
});


app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n Server running on http://localhost:${PORT}`);
});