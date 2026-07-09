// 1. KONFIGURASI AKSES DATABASE SUPABASE
const SUPABASE_URL = "https://cjtjmhkoplxaaquuplec.supabase.co"; // URL Asli Kelompokmu
const SUPABASE_KEY = "sb_publishable_asFmGMLi0HeVsj0jdY34SA_H-uKESEQ";    // Key Asli Kelompokmu

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
function beliProduk() {
    // Cek memori internal HP apakah pembeli sudah pernah isi data lengkap
    const namaTersimpan = localStorage.getItem('buyer_name');
    const emailTersimpan = localStorage.getItem('buyer_email');
    const alamatTersimpan = localStorage.getItem('buyer_address'); // Ambil alamat di memori HP

    if (namaTersimpan && emailTersimpan && alamatTersimpan) {
        // Jika data lengkap, langsung kirim data ke Supabase tanpa pop-up lagi
        kirimKeSupabase(namaTersimpan, emailTersimpan, alamatTersimpan);
    } else {
        // Jika ada yang belum diisi, munculkan pop-up modal data pengiriman
        if (modal) {
            // Otomatis isikan data lama yang sudah ada agar pembeli tidak repot ketik ulang
            if(namaTersimpan) document.getElementById('modalName').value = namaTersimpan;
            if(emailTersimpan) document.getElementById('modalEmail').value = emailTersimpan;
            if(alamatTersimpan) document.getElementById('modalAddress').value = alamatTersimpan;
            
            modal.classList.add('active');
        }
    }
}

// 4. JIKA TOMBOL "BATAL" DI KOTAK POP-UP DIKLIK
if (btnCancel) {
    btnCancel.addEventListener('click', () => {
        modal.classList.remove('active'); // Tutup pop-up
    });
}

// 5. JIKA TOMBOL "LANJUTKAN" DI KOTAK POP-UP DIKLIK
if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
        const namaInput = document.getElementById('modalName').value.trim();
        const emailInput = document.getElementById('modalEmail').value.trim();
        const alamatInput = document.getElementById('modalAddress').value.trim(); // Ambil input alamat baru
        
        // Validasi jangan sampai kolomnya kosong
        if (namaInput === "" || emailInput === "" || alamatInput === "") {
            alert("Harap isi Nama, Email, dan Alamat Lengkap kamu terlebih dahulu!");
            return;
        }
        
        // Simpan semua data di memori HP biar tidak capek isi lagi ke depannya
        localStorage.setItem('buyer_name', namaInput);
        localStorage.setItem('buyer_email', emailInput);
        localStorage.setItem('buyer_address', alamatInput); // Simpan alamat baru ke memori HP
        
        // Tutup pop-up
        modal.classList.remove('active');
        
        // Kirim datanya ke database Supabase
        await kirimKeSupabase(namaInput, emailInput, alamatInput);
    });
}

// 6. FUNGSI UTAMA: MENGIRIM DATA PESANAN KE SUPABASE
async function kirimKeSupabase(nama, email, alamat) {
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
                buyer_address: alamat, // <-- BARIS BARU: Mengirim data Alamat ke Supabase
                product_name: produkYangDibeli.nama_produk,
                price: produkYangDibeli.harga
            })
        });

        if (response.ok) {
            alert(`Sukses Besar! Pesanan ${produkYangDibeli.nama_produk} atas nama ${nama} telah terdaftar di database pusat Supabase dan siap dikirim.`);
        } else {
            const errData = await response.json();
            alert("Gagal mengirim pesanan: " + JSON.stringify(errData));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan koneksi ke server.");
    }
}
