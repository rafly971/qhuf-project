// 1. KONFIGURASI AKSES DATABASE SUPABASE
const SUPABASE_URL = "https://cjtjmhkoplxaaquuplec.supabase.co"; // <-- Pastikan URL lengkapmu ada di sini
const SUPABASE_KEY = "sb_publishable_asFmGMLi0HeVsj0jdY34SA_H-uKESEQ";    // <-- Pastikan Key publishable lengkapmu ada di sini

// 2. AMBIL ELEMEN TOMBOL & POP-UP DARI HTML
const modal = document.getElementById('signupModal');
const btnCancel = document.getElementById('btnCancel');
const btnSubmit = document.getElementById('btnSubmit');

// Data produk sementara (untuk simulasi pesanan)
let produkYangDibeli = {
    nama_produk: "Kemeja Linen Premium QHUF",
    harga: 149000
};

// 3. LOGIKA KETIK TOMBOL "BUY NOW" DIKLIK
// Fungsi ini harus dipanggil di tombol "Buy Now" kamu, contoh: onclick="beliProduk()"
function beliProduk() {
    // Cek apakah pembeli sudah pernah isi nama sebelumnya di HP ini
    const namaTersimpan = localStorage.getItem('buyer_name');
    const emailTersimpan = localStorage.getItem('buyer_email');

    if (namaTersimpan && emailTersimpan) {
        // Jika sudah pernah isi, langsung kirim data ke Supabase tanpa pop-up lagi
        kirimKeSupabase(namaTersimpan, emailTersimpan);
    } else {
        // Jika belum pernah, munculkan pop-up modal kustom yang estetik
        modal.classList.add('active');
    }
}

// 4. JIKA TOMBOL "BATAL" DI KOTAK POP-UP DIKLIK
btnCancel.addEventListener('click', () => {
    modal.classList.remove('active'); // Tutup pop-up
});

// 5. JIKA TOMBOL "LANJUTKAN" DI KOTAK POP-UP DIKLIK
btnSubmit.addEventListener('click', async () => {
    const namaInput = document.getElementById('modalName').value.trim();
    const emailInput = document.getElementById('modalEmail').value.trim();
    
    // Validasi jangan sampai kolomnya kosong
    if (namaInput === "" || emailInput === "") {
        alert("Harap isi nama dan email kamu terlebih dahulu!");
        return;
    }
    
    // Simpan data di memori HP biar tidak capek isi lagi ke depannya
    localStorage.setItem('buyer_name', namaInput);
    localStorage.setItem('buyer_email', emailInput);
    
    // Tutup pop-up
    modal.classList.remove('active');
    
    // Kirim datanya ke database Supabase
    await kirimKeSupabase(namaInput, emailInput);
});

// 6. FUNGSI UTAMA: MENGIRIM DATA PESANAN KE SUPABASE
async function kirimKeSupabase(nama, email) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                buyer_name: nama,
                buyer_email: email,
                product_name: produkYangDibeli.nama_produk,
                price: produkYangDibeli.harga
            })
        });

        if (response.ok) {
            alert(`Sukses Besar! Pesanan ${produkYangDibeli.nama_produk} atas nama ${nama} telah terdaftar di database pusat Supabase.`);
        } else {
            const errData = await response.json();
            alert("Gagal mengirim pesanan: " + JSON.stringify(errData));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan koneksi ke server.");
    }
}
