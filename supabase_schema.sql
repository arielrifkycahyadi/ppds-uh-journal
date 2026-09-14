-- ==============================================================================
-- DATABASE SCHEMA FOR PPDS UNHAS JOURNAL CMS SYSTEM
-- Sesuai Struktur Database Framework Laravel (Eloquence/Migration standard)
-- Author: Ariel Usman | Copyright 2026
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Tabel Pengguna: Residen, Dosen Reviewer, Admin SDM)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nim_nip VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'password123',
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'reviewer', 'residen')),
    department VARCHAR(255) DEFAULT 'Program Pendidikan Dokter Spesialis UNHAS',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. JOURNALS TABLE (Tabel Jurnal & Submission)
CREATE TABLE IF NOT EXISTS public.journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_code VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    keywords VARCHAR(255),
    event_category VARCHAR(100) DEFAULT 'SEM RIPMAS & KONGRES PPDS FK UNHAS',
    subtheme VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    presenting_author VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_institution VARCHAR(255) DEFAULT 'Universitas Hasanuddin',
    co_authors JSONB DEFAULT '[]'::jsonb,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'revision_required')),
    submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. REVIEWS TABLE (Tabel Penilaian & Histori Reviewer)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('accepted', 'rejected', 'revision_required')),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback_notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. COMMENTS TABLE (Tabel Komentar Diskusi Jurnal)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SYSTEM ANNOUNCEMENTS TABLE (Pengumuman CMS)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INITIAL SEED DATA FOR TESTING / PRODUCTION DEPLOYMENT
-- ==============================================================================

-- Seed Users
INSERT INTO public.users (id, email, nim_nip, password_hash, full_name, role, department)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@unhas.ac.id', '198501012010011001', 'admin123', 'Direktorat SDM Admin UNHAS', 'admin', 'Bagian SDM & Teknologi Informasi FK UNHAS'),
    ('22222222-2222-2222-2222-222222222222', 'dahlang@unhas.ac.id', '197505122003121002', 'reviewer123', 'Prof. Dr. Dahlang T., S.Si., M.Si.', 'reviewer', 'Departemen Bedah & Kedokteran Spesialis'),
    ('33333333-3333-3333-3333-333333333333', 'ijoneon@pasca.unhas.ac.id', 'C111201045', 'residen123', 'dr. Ijoneon Ardiansyah', 'residen', 'Spesialis Ilmu Bedah (PPDS)'),
    ('44444444-4444-4444-4444-444444444444', 'inayatul@pasca.unhas.ac.id', 'C111201088', 'residen123', 'dr. Inayatul Mutmainna', 'residen', 'Spesialis Anestesiologi & Terapi Intensif')
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Journals
INSERT INTO public.journals (id, submission_code, title, abstract, keywords, event_category, subtheme, department, presenting_author, author_email, status, submitted_by)
VALUES 
    (
        'a1111111-1111-1111-1111-111111111111', 
        'SEMRIPMAS2026-01786', 
        'Sintesis dan Karakterisasi Hidroksiapatit Berbasis Cangkang Kerang Menggunakan Metode Sol-Gel Untuk Implan Tulang', 
        'Penelitian ini bertujuan untuk menganalisis sintesis hidroksiapatit dari limbah cangkang kerang laut menggunakan metode sol-gel. Hasil karakterisasi XRD menunjukkan pembentukan fasa kristal murni dengan bioaktivitas tinggi pada uji in-vitro.',
        'hidroksiapatit, sol-gel, implan tulang, biokompatibilitas',
        'SEMRIPMAS IV 2026', 
        'Perubahan iklim, kebencanaan, dan ekonomi sirkular', 
        'Spesialis Ilmu Bedah Orthopedi', 
        'dr. Ijoneon Ardiansyah', 
        'ijoneon@pasca.unhas.ac.id', 
        'accepted',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'a2222222-2222-2222-2222-222222222222', 
        'ICESD2026-01783', 
        'Analisis Komplikasi Pasca Operasi Laparoskopi Pada Pasien Lanjut Usia di RSUP Dr. Wahidin Sudirohusodo', 
        'Evaluasi retrospektif terhadap 120 kasus laparoskopi pada pasien usia >65 tahun. Penurunan durasi operasi secara signifikan mempercepat pemulihan organ pasca pembiusan anestesi.',
        'laparoskopi, geriatri, pemulihan pasca operasi',
        'IC-RiCoS 2026', 
        'Sustainable Agriculture & Clinical Innovation', 
        'Spesialis Anestesiologi & Terapi Intensif', 
        'dr. Inayatul Mutmainna', 
        'inayatul@pasca.unhas.ac.id', 
        'pending',
        '44444444-4444-4444-4444-444444444444'
    ),
    (
        'a3333333-3333-3333-3333-333333333333', 
        'ICESD2026-01779', 
        'Pemanfaatan Cangkang Kerang sebagai Sumber Kalsium dalam Sintesis Hidroksiapatit Menggunakan Metode Sol-Gel', 
        'Kajian sintesis kalsium karbonat alami dalam aplikasi rekayasa jaringan kedokteran medis modern.',
        'kalsium, hidroksiapatit, medis',
        'IC-RiCoS 2026', 
        'Environmental Resilience and Sustainability', 
        'Spesialis Ilmu Kesehatan Anak', 
        'dr. Fitri Handayani', 
        'fitri@pasca.unhas.ac.id', 
        'accepted',
        '33333333-3333-3333-3333-333333333333'
    )
ON CONFLICT (submission_code) DO NOTHING;

-- Seed Comments
INSERT INTO public.comments (journal_id, user_id, user_name, user_role, comment_text)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Prof. Dr. Dahlang T., S.Si., M.Si.', 'reviewer', 'Metode sol-gel dijabarkan secara cermat. Abstrak dan metodologi telah memenuhi standar publikasi internasional.'),
    ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Prof. Dr. Dahlang T., S.Si., M.Si.', 'reviewer', 'Mohon lengkapi data kualitatif sampel pasien pada bagian hasil dan pembahasan sebelum tahap verifikasi akhir.');

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies for public reading during demo/production
CREATE POLICY "Allow public read access for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access for journals" ON public.journals FOR SELECT USING (true);
CREATE POLICY "Allow public insert access for journals" ON public.journals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access for journals" ON public.journals FOR UPDATE USING (true);
CREATE POLICY "Allow public access for reviews" ON public.reviews FOR ALL USING (true);
CREATE POLICY "Allow public access for comments" ON public.comments FOR ALL USING (true);
