const urlParams = new URLSearchParams(window.location.search);
const nim = urlParams.get("nim");

async function loadDetail() {
    const res = await fetch(`http://localhost:5000/api/mahasiswa/${nim}`);
    const json = await res.json();

    if (json.status !== "success") {
        document.querySelector(".title").innerText = "Mahasiswa tidak ditemukan.";
        return;
    }

    const data = json.data.mahasiswa;

    document.querySelector(".title").innerText = `${data.nama} (${data.nim})`;

    document.querySelector("#detail-body").innerHTML = `
        <p><strong>NIM:</strong> ${data.nim}</p>
        <p><strong>Nama:</strong> ${data.nama}</p>
        <p><strong>Tahun Masuk:</strong> ${data.tahun_masuk}</p>
        <p><strong>Sekolah Asal:</strong> ${data.nama_sekolah}</p>
        <p><strong>Kode Sekolah:</strong> ${data.kode_sekolah}</p>
        <p><strong>Alamat:</strong> ${data.alamat || '-'}</p>
    `;

    renderTA(json.data.judul_ta);
}

function renderTA(list) {
    const tbody = document.querySelector("#ta-table tbody");
    tbody.innerHTML = "";

    if (!list || list.length === 0) { 
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-neutral-500">Tidak ada data Tugas Akhir.</td>
        `;
        return;
    }

    list.forEach(t => {
        tbody.innerHTML += `
            <tr>
                <td>${t.judul}</td>
                <td>${t.tahun}</td>
            </tr>
        `;
    });
}

loadDetail();
