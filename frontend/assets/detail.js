// Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api/mahasiswa' 
    : '/api/mahasiswa';

// Get NIM from URL
const urlParams = new URLSearchParams(window.location.search);
const nim = urlParams.get('nim');

// DOM Elements
const loadingState = document.getElementById('loadingState');
const profileContent = document.getElementById('profileContent');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

// Profile elements
const studentInitial = document.getElementById('studentInitial');
const studentName = document.getElementById('studentName');
const studentNIM = document.getElementById('studentNIM');
const studentYear = document.getElementById('studentYear');
const viewThesisBtn = document.getElementById('viewThesisBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const thesisLink = document.getElementById('thesisLink');
const viewAllThesis = document.getElementById('viewAllThesis');

// Info elements
const infoName = document.getElementById('infoName');
const infoNIM = document.getElementById('infoNIM');
const infoYear = document.getElementById('infoYear');
const infoSchool = document.getElementById('infoSchool');
const infoSchoolCode = document.getElementById('infoSchoolCode');
const infoThesisCount = document.getElementById('infoThesisCount');

// Additional info
const infoCreated = document.getElementById('infoCreated');
const infoUpdated = document.getElementById('infoUpdated');
const infoRecordID = document.getElementById('infoRecordID');

// Thesis container
const thesisContainer = document.getElementById('thesisContainer');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!nim) {
        showError('No student ID specified in URL.');
        return;
    }
    loadStudentProfile();
});

// Load student profile
async function loadStudentProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/${nim}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            renderProfile(data.data);
        } else {
            showError(data.message || 'Failed to load student profile.');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to connect to server. Please check if the server is running.');
    }
}

// Render profile data
function renderProfile(data) {
    const student = data.mahasiswa;
    const thesisList = data.judul_ta || [];
    
    // Hide loading, show content
    loadingState.style.display = 'none';
    profileContent.classList.remove('hidden');
    
    // Set basic info
    const firstName = student.nama ? student.nama.split(' ')[0] : '';
    studentInitial.textContent = student.nama ? student.nama.charAt(0).toUpperCase() : '?';
    studentName.textContent = student.nama || 'Unknown Student';
    studentNIM.textContent = `NIM: ${student.nim || 'N/A'}`;
    studentYear.textContent = `Year: ${student.tahun_masuk || 'N/A'}`;
    
    // Update info cards
    infoName.textContent = student.nama || '-';
    infoNIM.textContent = student.nim || '-';
    infoYear.textContent = student.tahun_masuk || '-';
    infoSchool.textContent = student.nama_sekolah || 'Not specified';
    infoSchoolCode.textContent = student.kode_sekolah || '-';
    infoThesisCount.textContent = thesisList.length;
    
    // Set dates
    const now = new Date();
    infoCreated.textContent = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    infoUpdated.textContent = 'Just now';
    infoRecordID.textContent = student.nim || '-';
    
    // Update links
    viewThesisBtn.href = `ta.html?nim=${student.nim}`;
    editProfileBtn.href = `#`;
    thesisLink.href = `ta.html?nim=${student.nim}`;
    viewAllThesis.href = `ta.html?nim=${student.nim}`;
    
    // Render thesis preview
    renderThesisPreview(thesisList);
}

// Render thesis preview - BLACK THEME
function renderThesisPreview(thesisList) {
    if (!thesisList || thesisList.length === 0) {
        thesisContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="text-gray-500 mb-3">
                    <i class="fas fa-book-open text-4xl"></i>
                </div>
                <h4 class="text-lg font-medium text-gray-300 mb-2">No Thesis Found</h4>
                <p class="text-gray-400">This student hasn't registered any thesis titles yet.</p>
            </div>
        `;
        return;
    }
    
    // Show only first 3 theses
    const previewTheses = thesisList.slice(0, 3);
    
    let thesisHTML = '';
    
    if (thesisList.length > 3) {
        thesisHTML += `
            <div class="mb-4 p-3 bg-blue-900 rounded-lg text-sm text-blue-300 border border-blue-800">
                <i class="fas fa-info-circle mr-2"></i>
                Showing 3 of ${thesisList.length} thesis titles. 
                <a href="ta.html?nim=${nim}" class="font-medium underline">View all</a>
            </div>
        `;
    }
    
    thesisHTML += '<div class="space-y-4">';
    
    previewTheses.forEach((thesis, index) => {
        const status = thesis.status || 'Unknown';
        let statusClass = 'bg-gray-700 text-gray-300 border border-gray-600';
        
        if (status === 'Selesai') statusClass = 'bg-green-900 text-green-300 border border-green-700';
        else if (status === 'Proses') statusClass = 'bg-yellow-900 text-yellow-300 border border-yellow-700';
        
        thesisHTML += `
            <div class="border border-gray-700 bg-gray-900 rounded-lg p-4 hover:bg-gray-800">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h4 class="font-medium text-white mb-1">${thesis.judul || 'Untitled Thesis'}</h4>
                        <div class="flex items-center text-sm text-gray-400 space-x-4">
                            <span><i class="far fa-calendar mr-1"></i> ${thesis.tahun_masuk || 'N/A'}</span>
                            <span class="${statusClass} px-2 py-1 rounded-full text-xs">
                                ${status}
                            </span>
                        </div>
                        ${thesis.deskripsi ? `
                            <p class="text-sm text-gray-300 mt-2 line-clamp-2">${thesis.deskripsi}</p>
                        ` : ''}
                    </div>
                    <a href="ta.html?nim=${nim}#thesis-${thesis.id_ta}" 
                       class="ml-4 text-blue-400 hover:text-blue-300">
                       <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    thesisHTML += '</div>';
    thesisContainer.innerHTML = thesisHTML;
}

// Show error state
function showError(message) {
    loadingState.style.display = 'none';
    errorState.classList.remove('hidden');
    errorMessage.textContent = message;
}

// Print profile function
function printProfile() {
    alert('Print feature coming soon!');
    // Implement print functionality here
}

// Share profile function
function shareProfile() {
    if (navigator.share) {
        navigator.share({
            title: 'Student Profile',
            text: `Check out ${studentName.textContent}'s profile`,
            url: window.location.href,
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
    }
}
