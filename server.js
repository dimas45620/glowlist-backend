const express = require('express')
const cors = require("cors");
const app = express()
const mysql = require('mysql2')
const PORT = 3001
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const saltRounds = 10

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '',
    database: 'db_glowlist'
})

db.connect(err => {
    if (err) {
        console.error('Gagal konek ke database:', err)
    } else {
        console.log('Berhasil konek ke database Glowlist')
    }
})



app.get('/', (req, res) => {
    res.send('Selamat Datang diGlowlist API 🔥DIMAS')
})

// ---------- Menampilkan Produk ---------->>>>
app.get('/produk', (req, res) => {
    const sql = 'SELECT * FROM produk'
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err})
        res.json(results)
    })
})

//-----------Post Produk ------------------------
app.post('/produk', (req, res) => {
    const { judul, deskripsi, harga, id_kategori } = req.body;

    if (!judul || !deskripsi || !harga) {
        return res.status(400).json({
            message: 'Judul, Deskripsi dan harga wajib diisi!!!'
        });
    }

    const sql = `
        INSERT INTO produk (judul, deskripsi, harga, id_kategori, tgl_input)
        VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(
        sql,
        [judul, deskripsi, harga, id_kategori],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.sqlMessage
                });
            }

            res.json({
                message: 'Produk berhasil ditambahkan!',
                id_produk: result.insertId
            });
        }
    );
});
//-------------------------------------------------------------------------

// ---------- Update Produk ----------
app.put('/produk/:id_produk', (req, res) => {
    const { id_produk } = req.params;
    const { judul, deskripsi, harga, id_kategori } = req.body;

    const sql = `
        UPDATE produk
        SET judul = ?, deskripsi = ?, harga = ?, id_kategori = ?
        WHERE id_produk = ?
    `;

    db.query(
        sql,
        [judul, deskripsi, harga, id_kategori, id_produk],
        (err, result) => {
            if (err) {
                return res.status(500).json({error: err.sqlMessage});
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Produk tidak ditemukan' });
            }
            res.json({
                message: 'Produk berhasil diupdate!'
            });
        }
    );
});
//--------------------------------------------------------------------

// ---------- Menampilkan Produk berdasarkan ID ----------
app.get('/produk/:id_produk', (req, res) => {
    const { id_produk } = req.params;

    const sql = 'SELECT * FROM produk WHERE id_produk = ?';

    db.query(sql, [id_produk], (err, results) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        }

        res.json(results);
    });
});
//--------------------------------
// ---------- Hapus Produk ----------
app.delete('/produk/:id_produk', (req, res) => {
    const { id_produk } = req.params;

    const sql = 'DELETE FROM produk WHERE id_produk = ?';

    db.query(sql, [id_produk], (err, result) => {
        if (err) {
            return res.status(500).json({error: err.sqlMessage});
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        res.json({
            message: 'Produk berhasil dihapus!'
        });
    });
});

//---------------- Menampilkan Kategori ----------------->>>>
app.get('/kategori', (req, res) => {
    const sql = 'SELECT * FROM kategori'
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err})
        res.json(results)
    })
})

//----------------post ppengguna-----------
app.post('/pengguna', async (req, res) => {
    const { nama, email, password, no_hp } = req.body

    if (!nama || !email || !password) {
        return res.status(400).json({ message: 'Nama, Email, dan Password wajib diisi!' })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const sql = 'INSERT INTO pengguna (nama, email, password, no_hp) VALUES (?, ?, ?, ?)'

        db.query(sql, [nama, email, hashedPassword, no_hp], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({
                        message: 'Email sudah terdaftar, gunakan email lain'
                    })
                }

                return res.status(500).json({ error: err.sqlMessage })
            }

            res.json({
                message: 'Akun berhasil dibuat!',
                id_pengguna: result.insertId
            })
        })
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengenskripsi password'})
    }
})


app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`)
})