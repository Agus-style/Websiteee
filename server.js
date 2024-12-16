const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();  // Menggunakan dotenv untuk membaca file .env

const app = express();
const upload = multer({ dest: 'uploads/' }); // Folder sementara untuk file yang diupload

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Menggunakan EJS sebagai template engine
app.set('view engine', 'ejs');
app.use(express.static('public')); // Untuk file static (CSS, JS)

// Halaman utama
app.get('/', (req, res) => {
  res.render('index', { fileUrl: null });
});

// Mengupload file ke Supabase
app.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const filePath = `uploads/${file.filename}`;

  // Mengupload file ke Supabase
  const { data, error } = await supabase.storage
    .from('uploads') // Nama bucket di Supabase
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    return res.status(500).json({ message: 'Error uploading file.', error });
  }

  // Mendapatkan URL publik file setelah diupload
  const publicURL = supabase.storage
    .from('uploads')
    .getPublicUrl(filePath);

  // Render halaman dengan URL file yang baru diupload
  res.render('index', { fileUrl: publicURL.publicURL });
});

// Menjalankan server di port 3000
app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});