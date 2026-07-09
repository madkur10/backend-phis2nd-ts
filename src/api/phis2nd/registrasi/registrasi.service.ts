import {
    getPasienByMrRepo,
    getPasienPenjaminRepo,
    getPegawaiIdByDokterIdRepo,
    checkDuplicateRegistrationRepo,
    insertRegistrasiRepo,
} from "./registrasi.repository";

/**
 * Memverifikasi No MR dan Tanggal Lahir pasien
 */
export const verifikasiPasienService = async (noMr: string, tanggalLahir: string) => {
    const pasien = await getPasienByMrRepo(noMr);

    if (!pasien) {
        return { status: false, message: "No MR tidak ditemukan" };
    }

    const dbTglLahir = pasien.tgl_lahir ? new Date(pasien.tgl_lahir).toISOString().split('T')[0] : "";
    const inputTglLahir = new Date(tanggalLahir).toISOString().split('T')[0];

    if (dbTglLahir !== inputTglLahir) {
        return { status: false, message: "Tanggal lahir tidak sesuai" };
    }

    const penjamin = await getPasienPenjaminRepo(pasien.pasien_id);

    return {
        status: true,
        nama_pasien: pasien.nama_pasien,
        email: pasien.email,
        penjamin: penjamin, // Array penjamin
    };
};

/**
 * Melakukan pendaftaran pasien ke klinik/dokter dengan validasi duplikasi & transaksi data
 */
export const daftarPasienService = async (data: {
    noMr: string;
    kodeKlinik: number;
    kodeDokter: number;
    tanggalDaftar: string;
    kodePenjamin: number; // Ini adalah nasabah_id
}) => {
    // 1. Ambil data pasien berdasarkan No MR
    const pasien = await getPasienByMrRepo(data.noMr);
    if (!pasien) {
        return { status: false, message: "Pasien tidak ditemukan" };
    }

    // 2. Ambil pegawai_id dari tabel user berdasarkan dokter_id (kodeDokter)
    const pegawaiId = await getPegawaiIdByDokterIdRepo(data.kodeDokter);

    // 3. Validasi duplikasi (pasien, dokter/pegawai, dan bagian pada hari yang sama)
    const isDuplicate = await checkDuplicateRegistrationRepo(
        pasien.pasien_id,
        data.kodeKlinik,
        pegawaiId,
        data.tanggalDaftar
    );

    if (isDuplicate) {
        return {
            status: false,
            message: "Pasien sudah terdaftar pada klinik dan dokter yang sama untuk hari ini",
        };
    }

    // 4. Lakukan registrasi multitable secara atomic (registrasi, detail, urut, penanggung, diagnosa, bill_temp)
    try {
        const registrationResult = await insertRegistrasiRepo({
            pasien_id: pasien.pasien_id,
            kodeKlinik: data.kodeKlinik,
            kodeDokter: data.kodeDokter,
            pegawai_id: pegawaiId,
            tanggalDaftar: data.tanggalDaftar,
            nasabah_id: data.kodePenjamin, // Mengirimkan nasabah_id
        });

        return {
            status: true,
            data: registrationResult,
        };
    } catch (err: any) {
        console.error("Error saat melakukan transaksi pendaftaran:", err);
        return {
            status: false,
            message: err.message || "Terjadi kesalahan database saat pendaftaran",
        };
    }
};
