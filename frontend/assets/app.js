const API_URL = "http://127.0.0.1:5000/api/mahasiswa/paginated";

let currentPage = 1;
let searchValue = "";
let tahunValue = "";
let sortValue = "";
let limit = 20;

const container = document.getElementById("dataContainer");
const pageInfo = document.getElementById("pageInfo");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const searchInput = document.getElementById("searchInput");
const tahunFilter = document.getElementById("tahunFilter");
const sortSelect = document.getElementById("sortSelect");

// Load tahun dropdown
async function loadTahunOptions() {
    try {
        const res = await fetch("http://127.0.0.1:5000/api/mahasiswa/tahun");
        const json = await res.json();

        tahunFilter.innerHTML = `<option value="">Semua Tahun</option>`;  

        json.data.forEach(t => {
            tahunFilter.innerHTML += `<option value="${t}">${t}</option>`;
        });

    } catch (e) {
        console.error("Error fetching tahun:", e);
    }
}

async function loadData() {
    let url = `${API_URL}?page=${currentPage}&limit=${limit}`;

    if (searchValue) url += `&search=${encodeURIComponent(searchValue)}`;
    if (tahunValue) url += `&tahun_masuk=${tahunValue}`;
    
    if (sortValue) {
        if (sortValue === "tahun_asc") {
            url += `&sort=asc`;
        } else if (sortValue === "tahun_desc") {
            url += `&sort=desc`;
        }
    }

    try {
        const res = await fetch(url);
        const json = await res.json();
        
        if (json.status === "success") {
            renderData(json.data);
            handlePagination(json.page, json.total_pages);
        } else {
            console.error("API error:", json.message);
        }
    } catch (err) {
        console.error("Gagal fetch:", err);
        container.innerHTML = `
            <div class="bg-red-900/20 border border-red-500 rounded-xl p-4 text-center">
                <p class="text-red-400">Gagal memuat data. Pastikan server berjalan.</p>
            </div>
        `;
    }
}

function renderData(data) {
    container.innerHTML = "";
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="bg-neutral-900 border border-neutral-700 rounded-xl p-8 text-center">
                <p class="text-neutral-400">Tidak ada data ditemukan</p>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "bg-neutral-900 p-4 rounded-2xl border border-neutral-700 shadow hover:border-neutral-600 transition";

        card.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-xl font-bold">${item.nama || "-"}</p>
                   
                   <a heref="detail.html?nim=${item.nim}" 
                   class="text-neutral-400 underline hover:text-neutral-200">
                   ${item.nim || "-"}</a>

                </div>
                <span class="text-neutral-300">${item.tahun_masuk || "-"}</span>
            </div>
            <div class="mt-3 text-neutral-300">
                <p class="text-sm">Sekolah Asal:</p>
                <p class="font-medium">${item.nama_sekolah || "-"}</p>
                <p class="text-neutral-500 text-sm">${item.kode_sekolah || ""}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

function handlePagination(page, totalPages) {
    pageInfo.textContent = `Page ${page} / ${totalPages}`;
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
}

// Event Listeners
searchInput.addEventListener("input", e => {
    searchValue = e.target.value.trim();
    currentPage = 1;
    loadData();
});

tahunFilter.addEventListener("change", e => {
    tahunValue = e.target.value;
    currentPage = 1;
    loadData();
});

sortSelect.addEventListener("change", e => {
    sortValue = e.target.value;
    currentPage = 1;
    loadData();
});

prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        loadData();
    }
});

nextBtn.addEventListener("click", () => {
    currentPage++;
    loadData();
});

// Inisialisasi
loadTahunOptions();
loadData();
