// ISI DENGAN DATA SUPABASE MILIKMU
const SUPABASE_URL = "MASUKKAN_URL_SUPABASE_KAMU"; 
const SUPABASE_KEY = "MASUKKAN_ANON_KEY_KAMU";

async function handleBuy(productName, productPrice) {
    let savedBuyer = localStorage.getItem("qhuf_buyer_name");

    // Jika belum mendaftar, minta user untuk Sign Up dahulu
    if (!savedBuyer) {
        alert("Pemberitahuan: Silakan lakukan pendaftaran (Sign Up) terlebih dahulu sebelum membeli langsung dari website.");
        
        const usernameInput = prompt("[SIGN UP] Tentukan Username/Nama Anda:");
        if (!usernameInput || usernameInput.trim() === "") {
            alert("Pendaftaran dibatalkan. Pembelian tidak dapat dilanjutkan.");
            return;
        }

        const emailInput = prompt("[SIGN UP] Masukkan Alamat Email Anda:");
        if (!emailInput || emailInput.trim() === "") {
            alert("Pendaftaran dibatalkan. Pembelian tidak dapat dilanjutkan.");
            return;
        }

        localStorage.setItem("qhuf_buyer_name", usernameInput.trim());
        savedBuyer = usernameInput.trim();
        alert(`Pendaftaran Sukses!\nSelamat datang di QHUF APPAREL, ${savedBuyer}. Sistem akan memproses pesananmu.`);
    }

    // Kirim data pesanan ke database Supabase
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_name: productName,
                price: productPrice,
                buyer_name: savedBuyer
            })
        });

        if (response.ok) {
            alert(`Sukses Besar! Pesanan produk "${productName}" atas nama pelanggan "${savedBuyer}" telah terdaftar di database pusat Supabase.`);
        } else {
            const errData = await response.json();
            alert("Database menolak pesanan. Error: " + JSON.stringify(errData));
        }
    } catch (error) {
        alert("Gangguan jaringan/koneksi Supabase gagal: " + error.message);
    }
}
