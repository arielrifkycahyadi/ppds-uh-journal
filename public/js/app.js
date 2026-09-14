/**
 * PPDS UNHAS Journal Management & CMS - Main Client Application Logic
 * Author: Ariel Usman | Copyright 2026
 */

// --- GLOBAL STATE ---
const state = {
    currentUser: null, // Logged in user object
    journals: [], // Array of journal submissions
    currentJournal: null, // Selected journal for modal/preview
    comments: [], // Active comments for selected journal
    activeFilter: 'all', // 'all', 'pending', 'accepted', 'rejected', 'revision_required'
    searchQuery: '',
    coAuthors: [], // Draft co-authors for submission form
    supabaseConnected: false
};

// Initial Seed Data
const MOCK_JOURNALS = [
    {
        id: 'a1111111-1111-1111-1111-111111111111',
        submission_code: 'SEMRIPMAS2026-01786',
        title: 'Sintesis dan Karakterisasi Hidroksiapatit Berbasis Cangkang Kerang Menggunakan Metode Sol-Gel',
        abstract: 'Penelitian ini bertujuan untuk menganalisis sintesis hidroksiapatit dari limbah cangkang kerang laut menggunakan metode sol-gel. Hasil karakterisasi XRD menunjukkan pembentukan fasa kristal murni dengan bioaktivitas tinggi pada uji in-vitro implan tulang.',
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
    },
    {
        id: 'a4444444-4444-4444-4444-444444444444',
        submission_code: 'ICESD2026-01775',
        title: 'Evaluasi Terapi Kombinasi Immunoterapi Pada Pasien Kanker Serviks Stadium Lanjut di Makassar',
        abstract: 'Analisis efektivitas klinis terapi imunologi terhadap kelangsungan hidup pasien kanker ginekologi.',
        keywords: 'immunoterapi, kanker serviks, ginekologi',
        event_category: 'IC-RiCoS 2026',
        subtheme: 'Humanities, Ethics, and Policy',
        department: 'Spesialis Obstetri & Ginekologi',
        presenting_author: 'dr. Siti Halimah',
        author_email: 'sitihalimah@pasca.unhas.ac.id',
        author_institution: 'Universitas Hasanuddin',
        co_authors: [],
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_name: 'JURNAL_SITI_IMMUNOTERAPI.pdf',
        file_size: '2.9 MB',
        status: 'accepted',
        created_at: '2026-09-11T16:53:00.000Z'
    },
    {
        id: 'a5555555-5555-5555-5555-555555555555',
        submission_code: 'SEMRIPMAS2026-01736',
        title: 'Pengaruh Pemberian Ekstrak Daun Kelor Terhadap Respon Inflamasi Pasien Luka Bakar',
        abstract: 'Studi eksperimental perbandingan penyembuhan luka jaringan epitelium kulit pasca trauma thermal.',
        keywords: 'ekstrak kelor, luka bakar, inflamasi',
        event_category: 'SEMRIPMAS IV 2026',
        subtheme: 'Hilirisasi riset dan inovasi sosial',
        department: 'Spesialis Bedah Plastik & Rekonstruksi',
        presenting_author: 'dr. Ardiansyah',
        author_email: 'ardiansyah@pasca.unhas.ac.id',
        author_institution: 'Universitas Hasanuddin',
        co_authors: [],
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_name: 'JURNAL_ARDIANSYAH_KELOR.pdf',
        file_size: '1.2 MB',
        status: 'revision_required',
        created_at: '2026-09-11T14:41:00.000Z'
    }
];

const MOCK_COMMENTS = [
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Load initial mock journals
    state.journals = [...MOCK_JOURNALS];
    state.comments = [...MOCK_COMMENTS];

    // Check backend API connection
    fetchJournalsFromAPI();

    // Bind UI Event Listeners
    bindLoginEvents();
    bindNavigationEvents();
    bindFormEvents();
    bindModalEvents();
    bindCMSEvents();

    // Default view: Login Page
    showView('login-view');
}

// Fetch journals from backend server / Supabase
async function fetchJournalsFromAPI() {
    try {
        const response = await fetch('/api/journals');
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.length > 0) {
                state.journals = result.data;
                state.supabaseConnected = result.source === 'supabase';
                updateCloudStatusBadge();
                if (state.currentUser) {
                    renderDashboard();
                    renderJournalsTable();
                    renderCMSDatabaseTable();
                }
            }
        }
    } catch (e) {
        console.log('Using client-side mock memory data.');
    }
}

function updateCloudStatusBadge() {
    const badge = document.getElementById('cloud-status-badge');
    if (badge) {
        if (state.supabaseConnected) {
            badge.className = 'px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-100 rounded-full flex items-center gap-1.5';
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Supabase Connected`;
        } else {
            badge.className = 'px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full flex items-center gap-1.5';
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> Local CMS Mode`;
        }
    }
}

// --- AUTH & LOGIN LOGIC ---
function bindLoginEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('login-identifier').value.trim();
            const password = document.getElementById('login-password').value.trim();

            if (!identifier || !password) {
                showToast('Silakan masukkan Email / NIM / NIP dan Password!');
                return;
            }

            const submitBtn = document.getElementById('login-submit-btn');
            const originalText = submitBtn ? submitBtn.innerHTML : 'Sign In';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Memeriksa akun...</span>';
            }

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ identifier, password })
                });

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Login gagal. Silakan cek kredensial Anda.');
                }

                if (result.user) {
                    performLogin(result.user);
                    loginForm.reset();
                    showToast(`Login berhasil untuk ${result.user.full_name}.`);
                } else {
                    throw new Error('Data user tidak valid dari server.');
                }
            } catch (error) {
                showToast(error.message || 'Terjadi kesalahan saat login.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            }
        });
    }

    // Toggle Password Visibility
    const togglePassBtn = document.getElementById('toggle-password-btn');
    if (togglePassBtn) {
        togglePassBtn.addEventListener('click', () => {
            const passInput = document.getElementById('login-password');
            const icon = togglePassBtn.querySelector('i');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                icon.className = 'fa-regular fa-eye-slash text-gray-500';
            } else {
                passInput.type = 'password';
                icon.className = 'fa-regular fa-eye text-gray-400';
            }
        });
    }
}

function performLogin(userObj) {
    state.currentUser = userObj;

    // Update Header UI
    document.getElementById('user-display-name').textContent = userObj.full_name;
    document.getElementById('user-display-role').textContent = userObj.role_label;
    document.getElementById('user-avatar-img').src = userObj.avatar;
    document.getElementById('welcome-user-name').textContent = userObj.full_name;
    document.getElementById('welcome-user-role-badge').textContent = userObj.role.toUpperCase();

    // Toggle Role-based visibility
    if (userObj.role === 'admin' || userObj.role === 'reviewer') {
        document.querySelectorAll('.role-admin-only').forEach(el => el.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.role-admin-only').forEach(el => el.classList.add('hidden'));
    }

    // Switch view to Dashboard
    showView('main-app-layout');
    showSubView('dashboard-view');

    // Render Data
    renderDashboard();
    renderJournalsTable();
    renderCMSDatabaseTable();

    // Notification toast
    showToast(`Selamat Datang, ${userObj.full_name}! (Akses: ${userObj.role_label})`);
}

function performLogout() {
    state.currentUser = null;
    showView('login-view');
    showToast('Anda telah keluar dari sistem Jurnal PPDS UNHAS.');
}

// --- VIEW NAVIGATION ---
function showView(viewId) {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('main-app-layout').classList.add('hidden');

    document.getElementById(viewId).classList.remove('hidden');
}

function showSubView(subViewId) {
    const subViews = ['dashboard-view', 'journal-list-view', 'submit-journal-view', 'cms-database-view'];
    subViews.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const activeEl = document.getElementById(subViewId);
    if (activeEl) activeEl.classList.remove('hidden');

    // Highlight active sidebar nav item
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
        if (btn.getAttribute('data-view') === subViewId) {
            btn.classList.add('bg-unhas-soft', 'text-unhas-maroon', 'font-bold');
            btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
        } else {
            btn.classList.remove('bg-unhas-soft', 'text-unhas-maroon', 'font-bold');
            btn.classList.add('text-gray-600', 'hover:bg-gray-100');
        }
    });

    if (subViewId === 'dashboard-view') renderDashboard();
    if (subViewId === 'journal-list-view') renderJournalsTable();
    if (subViewId === 'cms-database-view') renderCMSDatabaseTable();
}

function bindNavigationEvents() {
    // Sidebar nav click handlers
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetView = btn.getAttribute('data-view');
            showSubView(targetView);

            // Close mobile sidebar if open
            const sidebar = document.getElementById('app-sidebar');
            if (window.innerWidth < 768 && sidebar) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });

    // Mobile Sidebar Toggle
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const sidebar = document.getElementById('app-sidebar');
    if (toggleSidebarBtn && sidebar) {
        toggleSidebarBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
}

// --- DASHBOARD RENDERING ---
function renderDashboard() {
    const totalCount = state.journals.length;
    const acceptedCount = state.journals.filter(j => j.status === 'accepted').length;
    const pendingCount = state.journals.filter(j => j.status === 'pending' || j.status === 'under_review').length;
    const revisionCount = state.journals.filter(j => j.status === 'revision_required' || j.status === 'rejected').length;

    document.getElementById('stat-total-submissions').textContent = totalCount;
    document.getElementById('stat-accepted-submissions').textContent = acceptedCount;
    document.getElementById('stat-pending-submissions').textContent = pendingCount;
    document.getElementById('stat-revision-submissions').textContent = revisionCount;

    // Render Recent Activities list
    const recentContainer = document.getElementById('recent-submissions-list');
    if (recentContainer) {
        const recentJournals = state.journals.slice(0, 5);
        recentContainer.innerHTML = recentJournals.map(j => `
            <div class="p-4 border-b border-gray-100 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer" onclick="openJournalPreviewModal('${j.id}')">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg bg-unhas-soft flex items-center justify-center text-unhas-maroon font-bold text-xs shrink-0">
                        ${j.submission_code.slice(-4)}
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-800 line-clamp-1">${escapeHtml(j.title)}</h4>
                        <p class="text-xs text-gray-500 mt-0.5"><i class="fa-solid fa-user-doctor text-unhas-maroon mr-1"></i> ${escapeHtml(j.presenting_author)} • <span class="text-gray-400">${escapeHtml(j.subtheme)}</span></p>
                    </div>
                </div>
                <div>
                    ${getStatusBadgeHTML(j.status)}
                </div>
            </div>
        `).join('');
    }
}

// --- TABLE & CMS RENDERING (Ref: Image 4) ---
function renderJournalsTable() {
    const tbody = document.getElementById('journals-table-tbody');
    if (!tbody) return;

    let filtered = state.journals;

    // Apply Filter Tab
    if (state.activeFilter !== 'all') {
        filtered = filtered.filter(j => j.status === state.activeFilter);
    }

    // Apply Search Query
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(j => 
            j.title.toLowerCase().includes(q) || 
            j.submission_code.toLowerCase().includes(q) ||
            j.presenting_author.toLowerCase().includes(q) ||
            j.subtheme.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-12 text-gray-400">
                    <i class="fa-solid fa-folder-open text-4xl mb-3 text-gray-300"></i>
                    <p class="text-sm font-medium">Tidak ada data jurnal yang ditemukan.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(j => {
        const formattedDate = new Date(j.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        const isReviewerOrAdmin = state.currentUser.role === 'admin' || state.currentUser.role === 'reviewer';

        return `
            <tr class="hover:bg-slate-50 transition">
                <td class="font-mono text-xs text-gray-600 font-semibold">${escapeHtml(j.submission_code)}</td>
                <td>
                    <span class="px-2.5 py-1 text-[11px] font-semibold bg-red-50 text-unhas-maroon rounded-md border border-red-100">
                        ${escapeHtml(j.event_category || 'KONGRES PPDS')}
                    </span>
                </td>
                <td class="max-w-md">
                    <a href="javascript:void(0)" onclick="openJournalPreviewModal('${j.id}')" class="font-semibold text-gray-900 hover:text-unhas-maroon text-sm leading-snug block line-clamp-2">
                        ${escapeHtml(j.title)}
                    </a>
                    <p class="text-xs text-gray-400 mt-1"><i class="fa-solid fa-tags text-[10px] mr-1"></i>${escapeHtml(j.keywords || '-')}</p>
                </td>
                <td class="text-xs text-gray-600 max-w-xs truncate">${escapeHtml(j.subtheme)}</td>
                <td class="text-xs">
                    <div class="font-medium text-gray-800">${escapeHtml(j.presenting_author)}</div>
                    <div class="text-gray-400 text-[11px]">${escapeHtml(j.department)}</div>
                </td>
                <td class="text-xs text-gray-500 whitespace-nowrap">${formattedDate}</td>
                <td>${getStatusBadgeHTML(j.status)}</td>
                <td class="whitespace-nowrap text-right">
                    <div class="flex items-center justify-end gap-1.5">
                        <button onclick="openJournalPreviewModal('${j.id}')" class="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition flex items-center gap-1" title="Preview PDF & Detail">
                            <i class="fa-solid fa-eye text-gray-500"></i> View
                        </button>

                        ${isReviewerOrAdmin ? `
                            <button onclick="openReviewModal('${j.id}')" class="px-3 py-1.5 text-xs font-semibold text-white bg-unhas-maroon hover:bg-unhas-maroon-dark rounded-md transition flex items-center gap-1" title="Review & Berikan Aksi Keputusan">
                                <i class="fa-solid fa-gavel"></i> Review
                            </button>
                        ` : ''}

                        <button onclick="openCommentModal('${j.id}')" class="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition relative" title="Komentar / Catatan">
                            <i class="fa-solid fa-comments"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getStatusBadgeHTML(status) {
    switch (status) {
        case 'accepted':
            return `<span class="badge-status-accepted px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> DITERIMA</span>`;
        case 'pending':
        case 'under_review':
            return `<span class="badge-status-pending px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1"><i class="fa-solid fa-clock text-[10px]"></i> MENUNGGU</span>`;
        case 'rejected':
            return `<span class="badge-status-rejected px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1"><i class="fa-solid fa-circle-xmark text-[10px]"></i> DITOLAK</span>`;
        case 'revision_required':
            return `<span class="badge-status-revision px-2.5 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1"><i class="fa-solid fa-rotate-left text-[10px]"></i> REVISI</span>`;
        default:
            return `<span class="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full font-bold">${status}</span>`;
    }
}

// Bind Table Filters & Search
function bindCMSEvents() {
    // Filter Tabs
    document.querySelectorAll('.filter-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab-btn').forEach(b => {
                b.classList.remove('bg-unhas-maroon', 'text-white');
                b.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-50');
            });
            btn.classList.add('bg-unhas-maroon', 'text-white');
            btn.classList.remove('bg-white', 'text-gray-600');

            state.activeFilter = btn.getAttribute('data-filter');
            renderJournalsTable();
        });
    });

    // Search Input
    const searchInput = document.getElementById('journals-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value.trim();
            renderJournalsTable();
        });
    }
}

// --- FORM SUBMISSION & CO-AUTHORS (Ref: Images 2 & 5) ---
function bindFormEvents() {
    const addAuthorBtn = document.getElementById('add-coauthor-btn');
    if (addAuthorBtn) {
        addAuthorBtn.addEventListener('click', () => {
            const authorNameInput = document.getElementById('coauthor-name-input');
            const authorEmailInput = document.getElementById('coauthor-email-input');

            const name = authorNameInput.value.trim();
            const email = authorEmailInput.value.trim();

            if (!name) {
                alert('Masukkan nama co-author terlebih dahulu!');
                return;
            }

            state.coAuthors.push({ name, email });
            authorNameInput.value = '';
            authorEmailInput.value = '';
            renderCoAuthorsList();
        });
    }

    // Abstract character & word counter
    const abstractTextarea = document.getElementById('submit-abstract-text');
    if (abstractTextarea) {
        abstractTextarea.addEventListener('input', () => {
            const text = abstractTextarea.value.trim();
            const wordCount = text ? text.split(/\s+/).length : 0;
            document.getElementById('abstract-word-count').textContent = `${wordCount} words`;
        });
    }

    // File Upload Drag & Drop Preview
    const dropzone = document.getElementById('file-upload-dropzone');
    const fileInput = document.getElementById('journal-file-input');

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dropzone-active');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dropzone-active');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dropzone-active');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                updateFilePreviewUI(fileInput.files[0]);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                updateFilePreviewUI(fileInput.files[0]);
            }
        });
    }

    // Submit Form Event
    const submitForm = document.getElementById('journal-submit-form');
    if (submitForm) {
        submitForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('submit-title').value.trim();
            const subtheme = document.getElementById('submit-subtheme').value;
            const abstract = document.getElementById('submit-abstract-text').value.trim();
            const keywords = document.getElementById('submit-keywords').value.trim();
            const authorName = document.getElementById('submit-author-name').value.trim();
            const authorEmail = document.getElementById('submit-author-email').value.trim();
            const institution = document.getElementById('submit-author-institution').value.trim();
            const department = document.getElementById('submit-author-department').value;
            const fileInput = document.getElementById('journal-file-input');

            if (!title || !subtheme || !abstract || !authorName || !authorEmail) {
                alert('Harap isi semua kolom wajib (*)!');
                return;
            }

            const formData = new FormData();
            formData.append('title', title);
            formData.append('subtheme', subtheme);
            formData.append('abstract', abstract);
            formData.append('keywords', keywords);
            formData.append('presenting_author', authorName);
            formData.append('author_email', authorEmail);
            formData.append('author_institution', institution);
            formData.append('department', department);
            formData.append('co_authors', JSON.stringify(state.coAuthors));
            formData.append('event_category', 'SEM RIPMAS & KONGRES PPDS 2026');

            if (fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
            }

            // Show submit loading
            const submitBtn = document.getElementById('btn-submit-journal');
            const originalBtnHTML = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengunggah Jurnal...`;

            try {
                const response = await fetch('/api/journals', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    showToast('✅ Abstrak Jurnal PPDS Berhasil Diajukan!');
                    state.coAuthors = [];
                    submitForm.reset();
                    renderCoAuthorsList();
                    document.getElementById('file-preview-card').classList.add('hidden');
                    
                    // Refresh data & switch view
                    await fetchJournalsFromAPI();
                    showSubView('journal-list-view');
                } else {
                    alert('Gagal mengunggah jurnal: ' + (result.error || 'Terjadi kesalahan'));
                }
            } catch (err) {
                // Client side fallback insertion
                const newCode = 'ICESD2026-0' + Math.floor(1000 + Math.random() * 9000);
                const mockNew = {
                    id: 'j-' + Date.now(),
                    submission_code: newCode,
                    title: title,
                    abstract: abstract,
                    keywords: keywords,
                    event_category: 'IC-RiCoS 2026',
                    subtheme: subtheme,
                    department: department,
                    presenting_author: authorName,
                    author_email: authorEmail,
                    author_institution: institution,
                    co_authors: [...state.coAuthors],
                    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                    file_name: fileInput.files[0] ? fileInput.files[0].name : 'DOKUMEN_JURNAL.pdf',
                    file_size: '2.1 MB',
                    status: 'pending',
                    created_at: new Date().toISOString()
                };

                state.journals.unshift(mockNew);
                showToast('✅ Abstrak Jurnal PPDS Berhasil Diajukan (Mode Lokal)!');
                state.coAuthors = [];
                submitForm.reset();
                renderCoAuthorsList();
                document.getElementById('file-preview-card').classList.add('hidden');

                showSubView('journal-list-view');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
            }
        });
    }
}

function renderCoAuthorsList() {
    const container = document.getElementById('coauthors-tags-container');
    if (!container) return;

    if (state.coAuthors.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-2">Belum ada co-author ditambahkan.</p>`;
        return;
    }

    container.innerHTML = state.coAuthors.map((ca, idx) => `
        <div class="flex items-center justify-between bg-slate-100 border border-slate-200 px-3 py-2 rounded-md text-xs">
            <div>
                <span class="font-bold text-gray-800">${escapeHtml(ca.name)}</span>
                ${ca.email ? `<span class="text-gray-500 ml-2">(${escapeHtml(ca.email)})</span>` : ''}
            </div>
            <button type="button" onclick="removeCoAuthor(${idx})" class="text-red-500 hover:text-red-700 ml-2">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `).join('');
}

function removeCoAuthor(index) {
    state.coAuthors.splice(index, 1);
    renderCoAuthorsList();
}

function updateFilePreviewUI(file) {
    const card = document.getElementById('file-preview-card');
    const nameEl = document.getElementById('preview-file-name');
    const sizeEl = document.getElementById('preview-file-size');

    if (card && nameEl && sizeEl) {
        nameEl.textContent = file.name;
        sizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
        card.classList.remove('hidden');
    }
}

// --- MODAL CONTROLLERS ---
function bindModalEvents() {
    // Close modal triggers
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        });
    });

    // Review Modal Decision Form
    const reviewForm = document.getElementById('review-decision-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentJournal) return;

            const decision = document.querySelector('input[name="review-decision"]:checked').value;
            const notes = document.getElementById('review-notes-input').value.trim();

            if (!notes) {
                alert('Harap berikan catatan/alasan ulasan review!');
                return;
            }

            try {
                const response = await fetch(`/api/journals/${state.currentJournal.id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: decision,
                        feedback_notes: notes,
                        reviewer_name: state.currentUser ? state.currentUser.full_name : 'Prof. Dr. Dahlang T., S.Si., M.Si.'
                    })
                });
            } catch (err) {
                console.log('Updated in local memory state.');
            }

            // Local State Update
            state.currentJournal.status = decision;
            const journalInState = state.journals.find(j => j.id === state.currentJournal.id);
            if (journalInState) journalInState.status = decision;

            state.comments.push({
                id: 'c-' + Date.now(),
                journal_id: state.currentJournal.id,
                user_name: state.currentUser ? state.currentUser.full_name : 'Prof. Dr. Dahlang T. (Reviewer)',
                user_role: 'reviewer',
                comment_text: `[KEPUTUSAN REVIEW: ${decision.toUpperCase()}] ${notes}`,
                created_at: new Date().toISOString()
            });

            document.getElementById('review-modal').classList.add('hidden');
            renderDashboard();
            renderJournalsTable();
            renderCMSDatabaseTable();
            showToast(`Keputusan review berhasil disimpan: Status ${decision.toUpperCase()}`);
        });
    }

    // Comment Submit Form
    const commentForm = document.getElementById('submit-comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!state.currentJournal) return;

            const textInput = document.getElementById('comment-text-input');
            const commentText = textInput.value.trim();

            if (!commentText) return;

            const newComment = {
                id: 'c-' + Date.now(),
                journal_id: state.currentJournal.id,
                user_name: state.currentUser ? state.currentUser.full_name : 'Residen UNHAS',
                user_role: state.currentUser ? state.currentUser.role : 'residen',
                comment_text: commentText,
                created_at: new Date().toISOString()
            };

            state.comments.push(newComment);
            textInput.value = '';

            renderCommentsThread(state.currentJournal.id);

            try {
                await fetch(`/api/journals/${state.currentJournal.id}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newComment)
                });
            } catch (e) {}

            showToast('Komentar berhasil dipublikasikan!');
        });
    }
}

function openJournalPreviewModal(journalId) {
    const journal = state.journals.find(j => j.id === journalId);
    if (!journal) return;

    state.currentJournal = journal;

    document.getElementById('preview-modal-code').textContent = journal.submission_code;
    document.getElementById('preview-modal-title').textContent = journal.title;
    document.getElementById('preview-modal-author').textContent = journal.presenting_author;
    document.getElementById('preview-modal-email').textContent = journal.author_email;
    document.getElementById('preview-modal-subtheme').textContent = journal.subtheme;
    document.getElementById('preview-modal-abstract').textContent = journal.abstract;
    document.getElementById('preview-modal-status-badge').innerHTML = getStatusBadgeHTML(journal.status);

    // Set PDF Frame
    const pdfFrame = document.getElementById('pdf-preview-iframe');
    if (pdfFrame) {
        pdfFrame.src = journal.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    }

    const downloadLink = document.getElementById('preview-pdf-download-link');
    if (downloadLink) {
        downloadLink.href = journal.file_url;
    }

    document.getElementById('pdf-preview-modal').classList.remove('hidden');
}

function openReviewModal(journalId) {
    const journal = state.journals.find(j => j.id === journalId);
    if (!journal) return;

    state.currentJournal = journal;

    document.getElementById('review-modal-code').textContent = journal.submission_code;
    document.getElementById('review-modal-title').textContent = journal.title;
    document.getElementById('review-modal-author').textContent = journal.presenting_author;
    document.getElementById('review-notes-input').value = '';

    document.getElementById('review-modal').classList.remove('hidden');
}

function openCommentModal(journalId) {
    const journal = state.journals.find(j => j.id === journalId);
    if (!journal) return;

    state.currentJournal = journal;

    document.getElementById('comment-modal-title').textContent = journal.title;
    renderCommentsThread(journalId);

    document.getElementById('comment-modal').classList.remove('hidden');
}

function renderCommentsThread(journalId) {
    const container = document.getElementById('comments-thread-container');
    if (!container) return;

    const filteredComments = state.comments.filter(c => c.journal_id === journalId);

    if (filteredComments.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Belum ada komentar atau catatan review untuk jurnal ini.</p>`;
        return;
    }

    container.innerHTML = filteredComments.map(c => `
        <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-gray-800">${escapeHtml(c.user_name)} <span class="text-[10px] font-normal px-2 py-0.5 rounded ${c.user_role === 'reviewer' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'}">${c.user_role.toUpperCase()}</span></span>
                <span class="text-[10px] text-gray-400">${new Date(c.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">${escapeHtml(c.comment_text)}</p>
        </div>
    `).join('');
}

// --- LARAVEL-LIKE CMS DATABASE EXPLORER ---
function renderCMSDatabaseTable() {
    const container = document.getElementById('cms-db-rows-container');
    if (!container) return;

    container.innerHTML = state.journals.map((j, i) => `
        <tr class="hover:bg-slate-50 font-mono text-xs">
            <td class="font-bold text-unhas-maroon">${i + 1}</td>
            <td class="text-gray-500">${j.id.slice(0, 8)}...</td>
            <td class="font-semibold text-gray-800">${escapeHtml(j.submission_code)}</td>
            <td class="max-w-xs truncate text-gray-700">${escapeHtml(j.title)}</td>
            <td><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700">${escapeHtml(j.department)}</span></td>
            <td>${getStatusBadgeHTML(j.status)}</td>
            <td class="text-gray-400">${new Date(j.created_at).toISOString().slice(0, 10)}</td>
        </tr>
    `).join('');

    document.getElementById('cms-journals-count').textContent = state.journals.length;
}

// --- UTILITIES ---
function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-2xl z-50 flex items-center gap-3 text-sm transition-all duration-300 transform translate-y-10 opacity-0 border border-gray-700';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fa-solid fa-bell text-unhas-gold"></i> <span>${message}</span>`;
    toast.classList.remove('translate-y-10', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
