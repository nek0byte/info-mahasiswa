// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/mahasiswa' 
    : '/api/mahasiswa';

// Get NIM from URL
const urlParams = new URLSearchParams(window.location.search);
const nim = urlParams.get('nim');

// DOM Elements
const studentCard = document.getElementById('studentCard');
const taTableBody = document.getElementById('taTableBody');
const loadingRow = document.getElementById('loadingRow');
const emptyState = document.getElementById('emptyState');
const statsSection = document.getElementById('statsSection');
const totalTA = document.getElementById('totalTA');
const countSelesai = document.getElementById('countSelesai');
const countProses = document.getElementById('countProses'); // FIXED TYPO
const countTotal = document.getElementById('countTotal');

// Status configuration - BLACK THEME
const statusConfig = {
    'Selesai': { 
        color: 'bg-green-900 text-green-300 border border-green-700', 
        icon: 'fas fa-check-circle', 
        text: 'Completed',
        badge: 'success'
    },
    'Proses': { 
        color: 'bg-yellow-900 text-yellow-300 border border-yellow-700', 
        icon: 'fas fa-clock', 
        text: 'In Progress',
        badge: 'warning'
    },
    'Batal': { 
        color: 'bg-red-900 text-red-300 border border-red-700', 
        icon: 'fas fa-times-circle', 
        text: 'Cancelled',
        badge: 'error'
    },
    'default': { 
        color: 'bg-gray-700 text-gray-300 border border-gray-600', 
        icon: 'fas fa-question-circle', 
        text: 'Unknown',
        badge: 'default'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!nim) {
        showError('No student ID specified in URL.');
        return;
    }
    loadStudentData();
});

// Load student data
async function loadStudentData() {
    try {
        const response = await fetch(`${API_BASE_URL}/${nim}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderStudentInfo(data.data.mahasiswa);
            renderThesisList(data.data.judul_ta);
            updateStatistics(data.data.judul_ta);
        } else {
            showError(data.message || 'Failed to load data.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to connect to server. Please check if the server is running.');
    }
}

// Render student info
function renderStudentInfo(student) {
    studentCard.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-white">${student.nama}</h2>
                <div class="flex items-center mt-2 space-x-4">
                    <div class="flex items-center text-gray-300">
                        <i class="fas fa-id-card mr-2"></i>
                        <span class="font-medium">${student.nim}</span>
                    </div>
                    <div class="flex items-center text-gray-300">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        <span>Entry Year: ${student.tahun_masuk}</span>
                    </div>
                    ${student.nama_sekolah ? `
                        <div class="flex items-center text-gray-300">
                            <i class="fas fa-school mr-2"></i>
                            <span>${student.nama_sekolah}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <a href="detail.html?nim=${student.nim}" 
                   class="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg border border-gray-700">
                   <i class="fas fa-user-circle mr-2"></i> View Profile
                </a>
                <a href="index.html" 
                   class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                   <i class="fas fa-arrow-left mr-2"></i> Back
                </a>
            </div>
        </div>
    `;
}

// Render thesis list
function renderThesisList(thesisList) {
    loadingRow.style.display = 'none';
    
    if (!thesisList || thesisList.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    taTableBody.innerHTML = '';
    
    // Sort by year (newest first)
    thesisList.sort((a, b) => (b.tahun_masuk || 0) - (a.tahun_masuk || 0));
    
    thesisList.forEach((thesis, index) => {
        const status = thesis.status || 'Unknown';
        const statusInfo = statusConfig[status] || statusConfig.default;
        
        const row = document.createElement('tr');
        row.className = `hover:bg-gray-700 transition ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-850'}`;
        
        row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg ${statusInfo.color} mr-4">
                        <i class="${statusInfo.icon}"></i>
                    </div>
                    <div>
                        <div class="text-sm font-medium text-white">${thesis.judul}</div>
                        <div class="text-xs text-gray-500 mt-1">ID: ${thesis.id_ta}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-300">
                    ${thesis.tahun_masuk || '<span class="text-gray-500">-</span>'}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}">
                    <i class="${statusInfo.icon} mr-1"></i>
                    ${statusInfo.text}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-300 max-w-xs">
                    ${thesis.deskripsi || 
                        `<span class="text-gray-500 italic">No description available</span>`
                    }
                </div>
            </td>
        `;
        
        taTableBody.appendChild(row);
    });
}

// Update statistics
function updateStatistics(thesisList) {
    if (!thesisList || thesisList.length === 0) {
        statsSection.classList.add('hidden');
        return;
    }
    
    statsSection.classList.remove('hidden');
    
    const stats = {
        total: thesisList.length,
        selesai: thesisList.filter(t => t.status === 'Selesai').length,
        proses: thesisList.filter(t => t.status === 'Proses').length,
        batal: thesisList.filter(t => t.status === 'Batal').length
    };
    
    totalTA.textContent = stats.total;
    countSelesai.textContent = stats.selesai;
    countProses.textContent = stats.proses;
    countTotal.textContent = stats.total;
}

// Show error
function showError(message) {
    loadingRow.style.display = 'none';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'col-span-full';
    errorDiv.innerHTML = `
        <div class="bg-red-900 border border-red-700 rounded-xl p-8 text-center">
            <div class="text-red-400 mb-4">
                <i class="fas fa-exclamation-triangle text-4xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-red-200 mb-2">Error</h3>
            <p class="text-red-300 mb-6">${message}</p>
            <div class="space-x-4">
                <a href="index.html" class="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-black border border-gray-700">
                    <i class="fas fa-home mr-2"></i> Back to Directory
                </a>
                <button onclick="location.reload()" class="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    <i class="fas fa-redo mr-2"></i> Try Again
                </button>
            </div>
        </div>
    `;
    
    taTableBody.parentNode.parentNode.parentNode.insertBefore(errorDiv, taTableBody.parentNode.parentNode);
}
