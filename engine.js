// 1. KONFIGURASI AKSES DATABASE SUPABASE
const SUPABASE_URL = "https://c.supabase.co"; // <-- GANTI dengan URL asli kelompokmu
const SUPABASE_KEY = "sb_publishable_...";    // <-- GANTI dengan Key asli kelompokmu

// Memori Penyimpanan Keranjang Sementara
let keranjangBelanja = [];

// 2. FUNGSI MENAMBAHKAN PRODUK KE KERANJANG
function tambahKeKeranjang(namaProduk, hargaProduk) {
    keranjangBelanja.push({
        nama: namaProduk,
        harga: hargaProduk
    });
    perbaruiTampilanKeranjang();
    alert(`Berhasil memasukkan ${namaProduk} ke keranjang!`);
}

// 3. FUNGSI MEMPERBARUI TAMPILAN ANGKA & DAFTAR BARANG
function perbaruiTampilanKeranjang() {
    const cartCount = document.getElementById('cartCount');
    const container = document.getElementById('cartItemsContainer');
    const totalText = document.getElementById('cartTotalText');
    
    if(cartCount) cartCount.innerText = keranjangBelanja.length;
    if (!container) return;
    
    if (keranjangBelanja.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center;">Keranjangmu masih kosong.</p>';
        if(totalText) totalText.innerText = "Rp 0";
        return;
    }
    
    let htmlDaftarBarang = "";
    let totalHarga = 0;
    
    keranjangBelanja.forEach((item) => {
        totalHarga += item.harga;
        htmlDaftarBarang += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; border-bottom: 1px dashed #eee; padding-bottom: 5px;">
                <span>${item.nama}</span>
                <span style="font-weight: bold;">Rp ${item.harga.toLocaleString('id-ID')}</span>
            </div>
        `;
    });
    
    container.innerHTML = htmlDaftarBarang;
    if(totalText) totalText.innerText = `Rp ${totalHarga.toLocaleString('id-ID')}`;
}

// 4. KONTROL BUKA TUTUP MODAL KERANJANG
function bukaKeranjangModal() {
    perbaruiTampilanKeranjang();
    const modalCart = document.getElementById('cartModal');
    if (modalCart) modalCart.classList.add('active');
}

function tutupKeranjangModal() {
    const modalCart = document.getElementById('cartModal');
    if (modalCart) modalCart.classList.remove('active');
}

// 5. PROSES CHECKOUT (BERLAKU UNTUK CART MAUPUN "BUY NOW" LANGSUNG)
function checkoutKeranjang() {
    if (keranjangBelanja.length === 0) {
        alert("Keranjangmu masih kosong, silakan pilih produk dulu!");
        return;
    }
    
    tutupKeranjangModal();
    
    // Cek memori internal HP apakah user sudah pernah mengisi data lengkap
    const namaTersimpan = localStorage.getItem('buyer_name');
    const emailTersimpan = localStorage.getItem('buyer_email');
    const alamatTersimpan = localStorage.getItem('buyer_address'); // <-- Perubahan: Ambil alamat di memori
    
    if (namaTersimpan && emailTersimpan && alamatTersimpan) {
        // Jika semua data lengkap, langsung kirim ke Supabase
        kirimKeranjangKeSupabase(namaTersimpan, emailTersimpan, alamatTersimpan);
    } else {
        // Jika ada yang belum diisi (termasuk alamat), tampilkan modal pengisian data
        const signupModal = document.getElementById('signupModal');
        if (signupModal) {
            if(namaTersimpan) document.getElementById('modalName').value = namaTersimpan;
            if(emailTersimpan) document.getElementById('modalEmail').value = emailTersimpan;
            if(alamatTersimpan) document.getElementById('modalAddress').value = alamatTersimpan;
            
            signupModal.classList.add('active');
        }
    }
}

// LOGIKA JIKA TOMBOL "LANJUTKAN" DI KOTAK MODAL DATA DIKLIK
const btnSubmit = document.getElementById('btnSubmit');
if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
        const namaInput = document.getElementById('modalName').value.trim();
        const emailInput = document.getElementById('modalEmail').value.trim();
        const alamatInput = document.getElementById('modalAddress').value.trim(); // <-- Perubahan: Ambil input teks alamat
        
        if (namaInput === "" || emailInput === "" || alamatInput === "") {
            alert("Harap isi Nama, Email, dan Alamat Lengkap kamu!");
            return;
        }
        
        // Simpan semua data ke memori internal HP agar pembeli tidak ketik ulang besok-besok
        localStorage.setItem('buyer_name', namaInput);
        localStorage.setItem('buyer_email', emailInput);
        localStorage.setItem('buyer_address', alamatInput);
        
        document.getElementById('signupModal').classList.remove('active');
        await kirimKeranjangKeSupabase(namaInput, emailInput, alamatInput);
    });
}

// 6. FUNGSI UTAMA: KIRIM DATA KE TABEL SUPABASE
async function kirimKeranjangKeSupabase(nama, email, alamat) {
    const daftarSemuaProduk = keranjangBelanja.map(item => item.nama).join(", ");
    const totalHargaGabungan = keranjangBelanja.reduce((sum, item) => sum + item.harga, 0);
    
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
                buyer_address: alamat,          // <-- Perubahan: DATA ALAMAT DIKIRIM KE SUPABASE DI SINI
                product_name: daftarSemuaProduk,
                price: totalHargaGabungan
            })
        });

        if (response.ok) {
            const successModal = document.getElementById('successModal');
            const successMessage = document.getElementById('successMessage');
            if (successModal && successMessage) {
                successMessage.innerText = `Sukses! Paket pesanan (${daftarSemuaProduk}) atas nama ${nama} segera dikirim ke alamatmu.`;
                successModal.classList.add('active');
            }
            // Kosongkan keranjang kembali
            keranjangBelanja = [];
            perbaruiTampilanKeranjang();
        } else {
            const errData = await response.json();
            alert("Gagal mengirim pesanan: " + JSON.stringify(errData));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan koneksi server.");
    }
}

// Tombol Tutup Modal (Fungsi Bawaan)
const btnCancel = document.getElementById('btnCancel');
if(btnCancel) btnCancel.addEventListener('click', () => { document.getElementById('signupModal').classList.remove('active'); });
const btnSuccessClose = document.getElementById('btnSuccessClose');
if(btnSuccessClose) btnSuccessClose.addEventListener('click', () => { document.getElementById('successModal').classList.remove('active'); });
