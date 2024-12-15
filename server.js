const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Konfigurasi Multer untuk upload
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan!'));
    }
  },
});

// Konfigurasi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Halaman utama
app.get('/', (req, res) => {
  const folderPath = path.join(__dirname, 'uploads');
  fs.readdir(folderPath, (err, files) => {
    if (err) return res.status(500).send('Error membaca folder');

    // Filter hanya file gambar
    const images = files.filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));
    res.render('index', { images });
  });
});

// Endpoint upload file
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('File tidak valid');
  }

  const originalExt = path.extname(req.file.originalname).toLowerCase();
  const newFileName = `${req.file.filename}${originalExt}`;
  const newPath = path.join(__dirname, 'uploads', newFileName);

  // Rename file ke nama baru
  fs.rename(req.file.path, newPath, (err) => {
    if (err) return res.status(500).send('Error saat memproses file');

    res.redirect('/');
  });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});