/**
 * Express Node.js Server for PPDS UNHAS Journal Management & CMS
 * Integrated with Supabase REST client, Vercel Serverless, & Cloud Storage.
 * Author: Ariel Usman | Copyright 2026
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer Storage Configuration (for Vercel serverless /tmp & local environment)
const uploadDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) {}
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'PPDS-JURNAL-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file PDF, DOC, atau DOCX yang diperbolehkan!'));
        }
    }
});

// Initialize Supabase Client if env provided
let SUPABASE_URL = process.env.SUPABASE_URL || '';
let SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
let supabase = null;

function initSupabase(url, key) {
    if (url && key && url.startsWith('http')) {
        try {
            supabase = createClient(url, key);
            SUPABASE_URL = url;
            SUPABASE_KEY = key;
            console.log('⚡ Supabase Client connected successfully to cloud database.');
            return true;
        } catch (e) {
            console.error('Supabase connection error:', e.message);
        }
    }
    return false;
}

initSupabase(SUPABASE_URL, SUPABASE_KEY);

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Local In-Memory Fallback Users (Matching Supabase Schema)
let memoryUsers = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@unhas.ac.id',
        nim_nip: '198501012010011001',
        password: 'admin123',
        full_name: 'Direktorat SDM Admin UNHAS',
        role: 'admin',
        role_label: 'Admin SDM FK UNHAS',
        department: 'Bagian SDM & Teknologi Informasi FK UNHAS',
        avatar: 'https://ui-avatars.com/api/?name=Admin+SDM&background=800000&color=fff'
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'reviewer@unhas.ac.id',
        nim_nip: '197505122003121002',
        password: 'reviewer123',
        full_name: 'Prof. Dr. Dahlang T., S.Si., M.Si.',
        role: 'reviewer',
        role_label: 'Dosen Reviewer Jurnal',
        department: 'Departemen Bedah & Kedokteran Spesialis',
        avatar: 'https://ui-avatars.com/api/?name=Prof+Dahlang&background=0284c7&color=fff'
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'user@unhas.ac.id',
        nim_nip: 'C111201045',
        password: 'user123',
        full_name: 'dr. Ariel Usman',
        role: 'residen',
        role_label: 'Residen PPDS Bedah',
        department: 'Spesialis Ilmu Bedah (PPDS)',
        avatar: 'https://ui-avatars.com/api/?name=dr+Ariel&background=10b981&color=fff'
    },
    {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'residen@unhas.ac.id',
        nim_nip: 'C111201088',
        password: 'residen123',
        full_name: 'dr. Inayatul Mutmainna',
        role: 'residen',
        role_label: 'Residen PPDS Anestesi',
        department: 'Spesialis Anestesiologi & Terapi Intensif',
        avatar: 'https://ui-avatars.com/api/?name=dr+Inayatul&background=10b981&color=fff'
    }
];

// Local In-Memory Fallback Database
let memoryJournals = [
    {
        id: 'a1111111-1111-1111-1111-111111111111',
        submission_code: 'SEMRIPMAS2026-01786',
        title: 'Sintesis dan Karakterisasi Hidroksiapatit Berbasis Cangkang Kerang Menggunakan Metode Sol-Gel',
        abstract: 'Penelitian ini bertujuan untuk menganalisis sintesis hidroksiapatit dari limbah cangkang kerang laut menggunakan metode sol-gel. Hasil karakterisasi XRD menunjukkan pembentukan fasa kristal murni dengan bioaktivitas tinggi pada uji in-vitro.',
        keywords: 'hidroksiapatit, sol-gel, implan tulang, biokompatibilitas',
        event_category: 'SEMRIPMAS IV 2026',
        subtheme: 'Perubahan iklim, kebencanaan, dan ekonomi sirkular',
        department: 'Spesialis Ilmu Bedah Orthopedi',
        presenting_author: 'dr. Ijoneon Ardiansyah',
        author_email: 'ijoneon@pasca.unhas.ac.id',
        author_institution: 'Universitas Hasanuddin',
        co_authors: [{ name: 'Dr. dr. Ahmad Rivaldi, Sp.B', email: 'ahmad@unhas.ac.id' }],
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_name: 'DRAF_JURNAL_SOLGEL_IJONEON.pdf',
        file_size: '2.4 MB',
        status: 'accepted',
        created_at: '2026-09-11T18:45:00.000Z'
    },
    {
        id: 'a2222222-2222-2222-2222-222222222222',
        submission_code: 'ICESD2026-01783',
        title: 'Analisis Komplikasi Pasca Operasi Laparoskopi Pada Pasien Lanjut Usia di RSUP Dr. Wahidin Sudirohusodo',
        abstract: 'Evaluasi retrospektif terhadap 120 kasus laparoskopi pada pasien usia >65 tahun. Penurunan durasi operasi secara signifikan mempercepat pemulihan organ pasca pembiusan anestesi.',
        keywords: 'laparoskopi, geriatri, pemulihan pasca operasi',
        event_category: 'IC-RiCoS 2026',
        subtheme: 'Sustainable Agriculture & Clinical Innovation',
        department: 'Spesialis Anestesiologi & Terapi Intensif',
        presenting_author: 'dr. Inayatul Mutmainna',
        author_email: 'inayatul@pasca.unhas.ac.id',
        author_institution: 'Universitas Hasanuddin',
        co_authors: [],
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_name: 'LAPAROSKOPI_GERIATRI_INAYATUL.pdf',
        file_size: '1.8 MB',
        status: 'pending',
        created_at: '2026-09-11T18:01:00.000Z'
    },
    {
        id: 'a3333333-3333-3333-3333-333333333333',
        submission_code: 'ICESD2026-01779',
        title: 'Pemanfaatan Cangkang Kerang sebagai Sumber Kalsium dalam Sintesis Hidroksiapatit Menggunakan Metode Sol-Gel',
        abstract: 'Kajian sintesis kalsium karbonat alami dalam aplikasi rekayasa jaringan kedokteran medis modern.',
        keywords: 'kalsium, hidroksiapatit, medis',
        event_category: 'IC-RiCoS 2026',
        subtheme: 'Environmental Resilience and Sustainability',
        department: 'Spesialis Ilmu Kesehatan Anak',
        presenting_author: 'dr. Fitri Handayani',
        author_email: 'fitri@pasca.unhas.ac.id',
        author_institution: 'Universitas Hasanuddin',
        co_authors: [],
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_name: 'JURNAL_FITRI_KALSIUM.pdf',
        file_size: '3.1 MB',
        status: 'accepted',
        created_at: '2026-09-11T17:13:00.000Z'
    }
];

let memoryComments = [
    {
        id: 'c1',
        journal_id: 'a1111111-1111-1111-1111-111111111111',
        user_name: 'Prof. Dr. Dahlang T., S.Si., M.Si.',
        user_role: 'reviewer',
        comment_text: 'Metode sol-gel dijabarkan secara cermat. Abstrak dan metodologi telah memenuhi standar publikasi internasional.',
        created_at: '2026-09-12T09:15:00.000Z'
    },
    {
        id: 'c2',
        journal_id: 'a2222222-2222-2222-2222-222222222222',
        user_name: 'Prof. Dr. Dahlang T., S.Si., M.Si.',
        user_role: 'reviewer',
        comment_text: 'Mohon lengkapi data kualitatif sampel pasien pada bagian hasil dan pembahasan sebelum tahap verifikasi akhir.',
        created_at: '2026-09-12T10:30:00.000Z'
    }
];

// --- REST API ENDPOINTS ---

// 1. Get System Status & Supabase Config Info
app.get('/api/status', (req, res) => {
    res.json({
        app: 'PPDS UNHAS Journal Management & CMS',
        author: 'Ariel Usman',
        copyright: '2026',
        supabase_connected: !!supabase,
        supabase_url: SUPABASE_URL ? SUPABASE_URL.slice(0, 20) + '...' : null,
        total_journals: memoryJournals.length,
        environment: process.env.VERCEL ? 'Vercel Serverless' : 'Node.js Local'
    });
});

// Dynamic Supabase Live Config Endpoint
app.post('/api/config/supabase', (req, res) => {
    const { url, key } = req.body;
    const success = initSupabase(url, key);
    if (success) {
        res.json({ success: true, message: 'Berhasil terhubung ke database cloud Supabase!' });
    } else {
        res.status(400).json({ success: false, message: 'URL atau Anon Key Supabase tidak valid.' });
    }
});

// Authentication Endpoint (Supabase Cloud + Local Fallback)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: 'Silakan masukkan Email / NIP / NIM dan Password.' });
        }

        const cleanIdentifier = String(identifier).trim();
        const cleanPassword = String(password).trim();

        if (!cleanIdentifier || !cleanPassword) {
            return res.status(400).json({ success: false, message: 'Identifier atau password tidak boleh kosong.' });
        }

        const buildUserResponse = (record) => ({
            id: record.id,
            email: record.email,
            nim_nip: record.nim_nip,
            full_name: record.full_name,
            role: record.role,
            role_label: record.role_label || (
                record.role === 'admin'
                    ? 'Admin SDM FK UNHAS'
                    : record.role === 'reviewer'
                        ? 'Dosen Reviewer Jurnal'
                        : 'Residen PPDS UNHAS'
            ),
            department: record.department || 'Fakultas Kedokteran UNHAS',
            avatar: record.avatar || record.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(record.full_name)}&background=${record.role === 'admin' ? '800000' : (record.role === 'reviewer' ? '0284c7' : '10b981')}&color=fff`
        });

        if (supabase) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .or(`email.ilike.${cleanIdentifier},nim_nip.eq.${cleanIdentifier}`)
                    .limit(10);

                if (!error && data && data.length > 0) {
                    const matched = data.find((user) => {
                        const storedPassword = String(user.password_hash ?? '').trim();
                        return storedPassword === cleanPassword && (
                            user.email?.toLowerCase() === cleanIdentifier.toLowerCase() ||
                            user.nim_nip === cleanIdentifier
                        );
                    });

                    if (matched) {
                        return res.json({
                            success: true,
                            source: 'supabase',
                            user: buildUserResponse(matched)
                        });
                    }
                }
            } catch (err) {
                console.error('Supabase user auth query error:', err.message);
            }
        }

        const matched = memoryUsers.find((u) => {
            const sameIdentity = u.email.toLowerCase() === cleanIdentifier.toLowerCase() || u.nim_nip === cleanIdentifier;
            return sameIdentity && String(u.password).trim() === cleanPassword;
        });

        if (matched) {
            return res.json({
                success: true,
                source: 'memory',
                user: buildUserResponse(matched)
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Email / NIP / NIM atau Password salah!'
        });
    } catch (err) {
        console.error('Login process error:', err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem saat proses login.' });
    }
});

// 2. GET All Journals
app.get('/api/journals', async (req, res) => {
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('journals')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                return res.json({ success: true, source: 'supabase', data });
            }
        } catch (err) {
            console.error('Supabase query error, fallback to memory:', err.message);
        }
    }
    res.json({ success: true, source: 'memory', data: memoryJournals });
});

// 3. POST Upload File & Create Journal Submission
app.post('/api/journals', upload.single('file'), async (req, res) => {
    try {
        const body = req.body;
        const file = req.file;

        const subCode = 'ICESD2026-0' + Math.floor(1000 + Math.random() * 9000);
        let fileUrl = file ? `/uploads/${file.filename}` : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        let fileName = file ? file.originalname : 'DOKUMEN_JURNAL.pdf';
        let fileSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB';

        // Upload directly to Supabase Storage Bucket if connected
        if (supabase && file) {
            try {
                const fileBuffer = fs.readFileSync(file.path);
                const storagePath = `submissions/${Date.now()}_${file.originalname}`;
                const { data: uploadData, error: uploadErr } = await supabase.storage
                    .from('journal-files')
                    .upload(storagePath, fileBuffer, { contentType: file.mimetype });

                if (!uploadErr && uploadData) {
                    const { data: publicUrlData } = supabase.storage.from('journal-files').getPublicUrl(storagePath);
                    if (publicUrlData && publicUrlData.publicUrl) {
                        fileUrl = publicUrlData.publicUrl;
                    }
                }
            } catch (storageErr) {
                console.error('Supabase storage upload error:', storageErr.message);
            }
        }

        let coAuthorsArray = [];
        if (body.co_authors) {
            try {
                coAuthorsArray = typeof body.co_authors === 'string' ? JSON.parse(body.co_authors) : body.co_authors;
            } catch (e) {
                coAuthorsArray = [];
            }
        }

        const newJournal = {
            id: 'j-' + Date.now(),
            submission_code: subCode,
            title: body.title || 'Untitled Journal Submission',
            abstract: body.abstract || '',
            keywords: body.keywords || '',
            event_category: body.event_category || 'IC-RiCoS 2026',
            subtheme: body.subtheme || 'Clinical Medicine & Health Science',
            department: body.department || 'Spesialis UNHAS',
            presenting_author: body.presenting_author || 'Residen PPDS',
            author_email: body.author_email || 'residen@pasca.unhas.ac.id',
            author_institution: body.author_institution || 'Universitas Hasanuddin',
            co_authors: coAuthorsArray,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        if (supabase) {
            try {
                await supabase.from('journals').insert([newJournal]);
            } catch (sbErr) {
                console.error('Failed to sync to Supabase, stored in memory:', sbErr.message);
            }
        }

        memoryJournals.unshift(newJournal);

        res.status(201).json({
            success: true,
            message: 'Jurnal PPDS berhasil diunggah dan diajukan ke sistem review!',
            data: newJournal
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. PUT Update Journal Decision Status (Accept, Reject, Revision)
app.put('/api/journals/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, feedback_notes, reviewer_name } = req.body;

    const journalIndex = memoryJournals.findIndex(j => j.id === id);
    if (journalIndex !== -1) {
        memoryJournals[journalIndex].status = status;
    }

    if (supabase) {
        try {
            await supabase.from('journals').update({ status }).eq('id', id);
            if (feedback_notes) {
                await supabase.from('reviews').insert([{
                    journal_id: id,
                    reviewer_name: reviewer_name || 'Reviewer UNHAS',
                    decision: status,
                    feedback_notes: feedback_notes
                }]);
            }
        } catch (err) {
            console.error('Supabase update status error:', err.message);
        }
    }

    if (feedback_notes) {
        memoryComments.push({
            id: 'c-' + Date.now(),
            journal_id: id,
            user_name: reviewer_name || 'Prof. Dr. Dahlang T., S.Si., M.Si. (Reviewer)',
            user_role: 'reviewer',
            comment_text: `[KEPUTUSAN REVIEW: ${status.toUpperCase()}] ${feedback_notes}`,
            created_at: new Date().toISOString()
        });
    }

    res.json({ success: true, message: `Status jurnal berhasil diperbarui menjadi ${status}` });
});

// 5. GET & POST Comments on Submission
app.get('/api/journals/:id/comments', (req, res) => {
    const { id } = req.params;
    const comments = memoryComments.filter(c => c.journal_id === id);
    res.json({ success: true, data: comments });
});

app.post('/api/journals/:id/comments', (req, res) => {
    const { id } = req.params;
    const { user_name, user_role, comment_text } = req.body;

    const newComment = {
        id: 'c-' + Date.now(),
        journal_id: id,
        user_name: user_name || 'Pengguna UNHAS',
        user_role: user_role || 'residen',
        comment_text: comment_text,
        created_at: new Date().toISOString()
    };

    memoryComments.push(newComment);

    if (supabase) {
        supabase.from('comments').insert([newComment]).then(() => {}).catch(() => {});
    }

    res.status(201).json({ success: true, data: newComment });
});

// Catch-all route to serve main frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Export app for Vercel Serverless deployment
module.exports = app;

// Listen locally if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
===============================================================
  🏥 PPDS UNHAS JOURNAL CMS & MANAGEMENT SYSTEM IS RUNNING!
  -------------------------------------------------------------
  📍 Server URL : http://localhost:${PORT}
  👨‍💻 Author     : Ariel Usman
  🗓️  Copyright  : 2026
===============================================================
        `);
    });
}
