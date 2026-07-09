// 1. KONFIGURASI AKSES DATABASE SUPABASE (Data Asli Kelompokmu)
const SUPABASE_URL = "https://cjtjmhkoplxaaquuplec.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_asFmGMLi0HeVsj0jdY34SA_H-uKESEQ";    

// Memori Penyimpanan Keranjang Belanja Sementara
let keranjangBelanja = [];

// Data produk bawaan (untuk sistem Buy Now langsung)
let produkYangDibeli = {
    nama_produk: "Kemeja Linen Premium QHUF",
    harga: 149000
};

// 2. AMBIL ELEMEN TOMBOL & POP-UP DARI HTML
const modal = document.getElementById('signupModal');
const btnCancel = document.getElementById('btnCancel');
const btnSubmit = document.getElementById('btnSubmit');

// Elemen Modal Sukses Baru (Supaya tidak abu-abu kaku)
const successModal = document.getElementById('successModal');
const successMessage = document.getElementById('successMessage');
const btnSuccessClose = document.getElementById('btnSuccessClose');

// 3. LOGIKA KETIK TOMBOL "BUY NOW" DIKLIK (SISTEM LAMA YANG DIPERBARUI DENGAN ALAMAT)
function beliProduk() {
    const namaTersimpan = localStorage.getItem('buyer_name');
    const emailTersimpan = localStorage.getItem('buyer_email');
    const alamatTersimpan = localStorage.getItem('buyer_address');

    if (namaTersimpan && emailTersimpan && alamatTersimpan) {
        // Jika data lengkap, langsung kirim ke Supabase
        kirimKeSupabaseDirect(namaTersimpan, emailTersimpan, alamatTersimpan);
    } else {
        // Jika belum lengkap, munculkan pop-up input data pengiriman
        if (modal) {
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
        modal.classList.remove('active');
    });
}

// 5. JIKA TOMBOL "LANJUTKAN" DI KOTAK POP-UP DIKLIK
if (btnSubmit) {
    btnSubmit.addEventListener('click', async () => {
        const namaInput = document.getElementById('modalName').value.trim();
        const emailInput = document.getElementById('modalEmail').value.trim();
        const alamatInput = document.getElementById('modalAddress').value.trim(); // Ambil data alamat baru
        
        if (namaInput === "" || emailInput === "" || alamatInput === "") {
            alert("Harap isi Nama, Email, dan Alamat Lengkap kamu!");
            return;
        }
        
        // Simpan data di memori internal HP
        localStorage.setItem('buyer_name', namaInput);
        localStorage.setItem('buyer_email', emailInput);
        localStorage.setItem('buyer_address', alamatInput);
        
        modal.classList.remove('active');
        
        // Cek apakah ini transaksi dari Keranjang atau Buy Now langsung
        if (keranjangBelanja.length > 0) {
            await kirimKeranjangKeSupabase(namaInput, emailInput, alamatInput);
        } else {
            await kirimKeSupabaseDirect(namaInput, emailInput, alamatInput);
        }
    });
}

// Tombol Tutup di Modal Sukses kustom diklik
if (btnSuccessClose) {
    btnSuccessClose.addEventListener('click', () => {
        successModal.classList.remove('active');
    });
}


// ========================================================
// FITUR TAMBAHAN: FITUR KERANJANG BELANJA (CART)
// ========================================================

// Fungsi memasukkan produk ke keranjang
function tambahKeKeranjang(namaProduk, hargaProduk) {
    keranjangBelanja.push({ nama: namaProduk, harga: hargaProduk });
    perbaruiTampilanKeranjang();
    alert(`Berhasil memasukkan ${namaProduk} ke keranjang!`);
}

// Memperbarui hitungan angka & list barang di modal keranjang
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

function bukaKeranjangModal() {
    perbaruiTampilanKeranjang();
    const modalCart = document.getElementById('cartModal');
    if (modalCart) modalCart.classList.add('active');
}

function tutupKeranjangModal() {
    const modalCart = document.getElementById('cartModal');
    if (modalCart) modalCart.classList.remove('active');
}

// Proses checkout isi keranjang
function checkoutKeranjang() {
    if (keranjangBelanja.length === 0) {
        alert("Keranjangmu masih kosong, silakan pilih produk dulu!");
        return;
    }
    tutupKeranjangModal();
    
    const namaTersimpan = localStorage.getItem('buyer_name');
    const emailTersimpan = localStorage.getItem('buyer_email');
    const alamatTersimpan = localStorage.getItem('buyer_address');
    
    if (namaTersimpan && emailTersimpan && alamatTersimpan) {
        kirimKeranjangKeSupabase(namaTersimpan, emailTersimpan, alamatTersimpan);
    } else {
        if (modal) {
            if(namaTersimpan) document.getElementById('modalName').value = namaTersimpan;
            if(emailTersimpan) document.getElementById('modalEmail').value = emailTersimpan;
            if(alamatTersimpan) document.getElementById('modalAddress').value = alamatTersimpan;
            modal.classList.add('active');
        }
    }
}


// ========================================================
// PROSES PENGIRIMAN DATA AKHIR KE SUPABASE VIA API
// ========================================================

// A. Fungsi Kirim Produk Tunggal (Dari Fitur Buy Now Langsung)
async function kirimKeSupabaseDirect(nama, email, alamat) {
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
                buyer_address: alamat, // Menyimpan Alamat ke Supabase
                product_name: produkYangDibeli.nama_produk,
                price: produkYangDibeli.harga
            })
        });

        if (response.ok) {
            if (successModal && successMessage) {
                successMessage.innerText = `Sukses! Pesanan ${produkYangDibeli.nama_produk} atas nama ${nama} berhasil didaftarkan dan segera dikirim ke alamatmu.`;
                successModal.classList.add('active');
            }
        } else {
            const errData = await response.json();
            alert("Gagal mengirim pesanan: " + JSON.stringify(errData));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan koneksi ke server.");
    }
}

// B. Fungsi Kirim Banyak Produk Sekaligus (Dari Fitur Keranjang Belanja)
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
                buyer_address: alamat, // Menyimpan Alamat ke Supabase
                product_name: daftarSemuaProduk,
                price: totalHargaGabungan
            })
        });

        if (response.ok) {
            if (successModal && successMessage) {
                successMessage.innerText = `Sukses! Paket pesanan (${daftarSemuaProduk}) atas nama ${nama} segera dikirim ke alamatmu.`;
                successModal.classList.add('active');
            }
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
