// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/mahasiswa' 
    : '/api/mahasiswa';

// DOM Elements
const container = document.getElementById('dataContainer');
const searchInput = document.getElementById('searchInput');
const tahunFilter = document.getElementById('tahunFilter');
const sortSelect = document.getElementById('sortSelect');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageLimit = document.getElementById('pageLimit');
const pageNumbers = document.getElementById('pageNumbers');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');

// Stats elements
const statsTotal = document.getElementById('statsTotal');
const statsThesis = document.getElementById('statsThesis');
const statsSchools = document.getElementById('statsSchools');
const statsYears = document.getElementById('statsYears');
const totalStudents = document.getElementById('totalStudents');

// State
let currentPage = 1;
let totalPages = 1;
let searchValue = "";
let tahunValue = "";
let sortValue = "";
let limit = 20;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTahunOptions();
    loadData();
    updateStats();
});

// Load tahun options
async function loadTahunOptions() {
    try {
        const res = await fetch(`${API_BASE_URL}/tahun`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        if (json.status !== "success") throw new Error(json.message);

        tahunFilter.innerHTML = `<option value="">All Years</option>`;
        json.data.forEach(t => {
            tahunFilter.innerHTML += `<option value="${t}">${t}</option>`;
        });

    } catch (e) {
        console.error("Error fetching years:", e);
        tahunFilter.innerHTML = `<option value="">Failed to load</option>`;
    }
}

// Load data with pagination
async function loadData() {
    const params = new URLSearchParams({
        page: currentPage,
        limit: limit
    });

    if (searchValue) params.append('search', searchValue);
    if (tahunValue) params.append('tahun_masuk', tahunValue);
    
    // Handle sort options
    if (sortValue) {
        if (sortValue === "tahun_asc") {
            params.append('sort_by', 'tahun_masuk');
            params.append('sort', 'asc');
        } else if (sortValue === "tahun_desc") {
            params.append('sort_by', 'tahun_masuk');
            params.append('sort', 'desc');
        } else if (sortValue === "name_asc") {
            params.append('sort_by', 'nama');
            params.append('sort', 'asc');
        } else if (sortValue === "name_desc") {
            params.append('sort_by', 'nama');
            params.append('sort', 'desc');
        }
    }

    try {
        const res = await fetch(`${API_BASE_URL}/paginated?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        
        if (json.status === "success") {
            renderData(json.data);
            updatePagination(json.page, json.total_pages);
        } else {
            showError(json.message || "An error occurred");
        }
    } catch (err) {
        console.error("Failed to fetch:", err);
        showError("Failed to load data. Please check if the server is running.");
    }
}

// Render student cards
function renderData(data) {
    container.innerHTML = "";
    
    if (data.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-gray-400 mb-4">
                    <i class="fas fa-user-slash text-5xl"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
                <p class="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow card-hover border border-gray-200 overflow-hidden';
        
        // Determine badge color based on year
        const currentYear = new Date().getFullYear();
        const studentYear = item.tahun_masuk || currentYear;
        const yearDiff = currentYear - studentYear;
        
        let yearBadge = '';
        if (yearDiff === 0) yearBadge = 'bg-green-100 text-green-800';
        else if (yearDiff <= 3) yearBadge = 'bg-blue-100 text-blue-800';
        else yearBadge = 'bg-gray-100 text-gray-800';

        card.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="${yearBadge} px-3 py-1 rounded-full text-xs font-semibold">
                            Batch ${item.tahun_masuk || 'N/A'}
                        </span>
                        <h3 class="text-xl font-bold text-gray-900 mt-2">${item.nama || "Unknown"}</h3>
                        <p class="text-gray-600">${item.nim || "No NIM"}</p>
                    </div>
                    <div class="text-right">
                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            ${item.nama ? item.nama.charAt(0).toUpperCase() : '?'}
                        </div>
                    </div>
                </div>
                
                <div class="space-y-3 mb-6">
                    <div class="flex items-center text-gray-700">
                        <i class="fas fa-school text-gray-400 mr-3 w-5"></i>
                        <span class="text-sm">${item.nama_sekolah || "Not specified"}</span>
                    </div>
                    <div class="flex items-center text-gray-700">
                        <i class="fas fa-book text-gray-400 mr-3 w-5"></i>
                        <span class="text-sm">
                            ${item.jumlah_ta > 0 ? `${item.jumlah_ta} Thesis Titles` : 'No thesis data'}
                        </span>
                    </div>
                    <div class="flex items-center text-gray-700">
                        <i class="fas fa-id-card text-gray-400 mr-3 w-5"></i>
                        <span class="text-sm font-mono">${item.kode_sekolah || 'No school code'}</span>
                    </div>
                </div>
                
                <div class="flex space-x-2 pt-4 border-t border-gray-100">
                    <a href="detail.html?nim=${item.nim}" 
                       class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg text-sm font-medium transition">
                       <i class="fas fa-user-circle mr-2"></i>Profile
                    </a>
                    <a href="ta.html?nim=${item.nim}" 
                       class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-lg text-sm font-medium transition">
                       <i class="fas fa-book-open mr-2"></i>Thesis
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Update pagination controls
function updatePagination(page, total) {
    currentPage = page;
    totalPages = total;
    
    currentPageSpan.textContent = page;
    totalPagesSpan.textContent = total;
    
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= total;
    
    // Generate page numbers
    pageNumbers.innerHTML = '';
    const maxPages = 5;
    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
    let endPage = startPage + maxPages - 1;
    
    if (endPage > total) {
        endPage = total;
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `px-3 py-1 rounded ${i === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => {
            currentPage = i;
            loadData();
        };
        pageNumbers.appendChild(pageBtn);
    }
}

// Update statistics
async function updateStats() {
    try {
        const res = await fetch(`${API_BASE_URL}/statistics`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        if (json.status === "success") {
            const stats = json.data;
            
            // Update UI
            statsTotal.textContent = stats.total_students || 0;
            statsThesis.textContent = stats.with_thesis || 0;
            statsSchools.textContent = stats.unique_schools || 0;
            statsYears.textContent = stats.unique_years || 0;
            totalStudents.textContent = stats.total_students || 0;
        }
    } catch (error) {
        console.error("Failed to load stats:", error);
        // Set default values
        statsTotal.textContent = "0";
        statsThesis.textContent = "0";
        statsSchools.textContent = "0";
        statsYears.textContent = "0";
        totalStudents.textContent = "0";
    }
}

// Export to CSV function
function exportToCSV() {
    alert('Export feature coming soon!');
    // Implement CSV export here
}

// Event Listeners with debouncing
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchValue = e.target.value.trim();
        currentPage = 1;
        loadData();
    }, 300);
});

tahunFilter.addEventListener('change', (e) => {
    tahunValue = e.target.value;
    currentPage = 1;
    loadData();
});

sortSelect.addEventListener('change', (e) => {
    sortValue = e.target.value;
    currentPage = 1;
    loadData();
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadData();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        loadData();
    }
});

pageLimit.addEventListener('change', (e) => {
    limit = parseInt(e.target.value);
    currentPage = 1;
    loadData();
});
