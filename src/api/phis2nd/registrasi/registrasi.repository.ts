import { prismaDb1 } from "../../../db";
import { generateMaxDb1, timeHandler } from "../../../db/database.handler";
import { dateNow } from "../../../middlewares/time";

/**
 * Mengambil data pasien berdasarkan No MR
 */
export const getPasienByMrRepo = async (noMr: string) => {
    const pasien = await prismaDb1.pasien.findFirst({
        where: {
            no_mr: noMr,
            status_batal: null,
        },
        select: {
            pasien_id: true,
            nama_pasien: true,
            tgl_lahir: true,
            email: true,
        },
    });
    return pasien;
};

/**
 * Mengambil daftar penjamin (asuransi/nasabah) yang dimiliki pasien
 */
export const getPasienPenjaminRepo = async (pasienId: number) => {
    // 1. Cari relasi di tabel pasien_nasabah
    const pasienNasabahList = await prismaDb1.pasien_nasabah.findMany({
        where: {
            pasien_id: pasienId,
            status_batal: null,
        },
        select: {
            pasien_nasabah_id: true,
            nasabah_id: true,
            no_peserta: true,
        },
    });

    if (pasienNasabahList.length === 0) {
        return [];
    }

    // 2. Ambil informasi nama nasabah dari tabel nasabah
    const nasabahIds = pasienNasabahList
        .map((item) => item.nasabah_id)
        .filter((id): id is number => id !== null);

    const nasabahList = await prismaDb1.nasabah.findMany({
        where: {
            nasabah_id: { in: nasabahIds },
            status_batal: null,
        },
        select: {
            nasabah_id: true,
            nama_nasabah: true,
        },
    });

    // 3. Gabungkan data asuransi/penjamin pasien
    const result = pasienNasabahList.map((pn) => {
        const infoNasabah = nasabahList.find((n) => n.nasabah_id === pn.nasabah_id);
        return {
            pasien_nasabah_id: pn.pasien_nasabah_id,
            nasabah_id: pn.nasabah_id,
            nama_nasabah: infoNasabah?.nama_nasabah || "UMUM/CASH",
            no_peserta: pn.no_peserta,
        };
    });

    return result;
};

/**
 * Mencari pegawai_id berdasarkan user_id (dokter_id)
 */
export const getPegawaiIdByDokterIdRepo = async (dokterId: number) => {
    const user = await prismaDb1.users.findFirst({
        where: {
            user_id: dokterId,
            status_batal: null,
        },
        select: {
            pegawai_id: true,
        },
    });
    return user?.pegawai_id || dokterId; // Fallback jika tidak terpetakan
};

/**
 * Memvalidasi apakah pasien sudah terdaftar pada dokter & bagian/klinik yang sama di hari yang sama
 */
export const checkDuplicateRegistrationRepo = async (
    pasienId: number,
    bagianId: number,
    pegawaiId: number,
    tanggalDaftar: string
) => {
    // Cari registrasi aktif pasien di hari tersebut
    const registrations = await prismaDb1.registrasi.findMany({
        where: {
            pasien_id: pasienId,
            tgl_masuk: {
                gte: new Date(`${tanggalDaftar}T00:00:00`),
                lte: new Date(`${tanggalDaftar}T23:59:59`),
            },
            status_batal: null,
        },
        select: {
            registrasi_id: true,
        },
    });

    if (registrations.length === 0) {
        return false;
    }

    const regIds = registrations.map((r) => r.registrasi_id);

    // Cari detail registrasi yang merujuk ke bagian/klinik tersebut
    const details = await prismaDb1.registrasi_detail.findMany({
        where: {
            registrasi_id: { in: regIds },
            bagian_id: bagianId,
            status_batal: null,
        },
        select: {
            registrasi_detail_id: true,
        },
    });

    if (details.length === 0) {
        return false;
    }

    const detailIds = details.map((d) => d.registrasi_detail_id);

    // Cari urutan registrasi yang merujuk ke dokter (pegawai_id) tersebut
    const urut = await prismaDb1.registrasi_urut.findFirst({
        where: {
            registrasi_detail_id: { in: detailIds },
            pegawai_id: pegawaiId,
            status_batal: null,
        },
    });

    return !!urut; // true jika duplikat ditemukan
};

/**
 * Mencari urutan maksimal pada pelayanan rawat jalan
 */
export const urutanMaxRajal = async (
    bagianId: number,
    pegawaiId: number,
    tglKunjungan: string,
    client: any = prismaDb1
) => {
    const urutanRajal: any = await client.$queryRaw`
        SELECT 
            MAX(urutan) as antrian_max
        FROM 
            registrasi_urut 
        WHERE 
            status_batal IS NULL
            AND bagian_id = ${bagianId}
            AND pegawai_id = ${pegawaiId}
            AND tgl_urut::date = ${tglKunjungan}::date`;

    if (urutanRajal[0]?.antrian_max > 0) {
        return urutanRajal[0].antrian_max;
    } else {
        return 0;
    }
};

/**
 * Menyimpan data pendaftaran pasien ke dalam 6 tabel transaksi secara atomic (Prisma Transaction)
 */
export const insertRegistrasiRepo = async (data: {
    pasien_id: number;
    kodeKlinik: number;
    kodeDokter: number;
    pegawai_id: number;
    tanggalDaftar: string;
    nasabah_id: number; // Diubah dari pasien_nasabah_id ke nasabah_id
}) => {
    return await prismaDb1.$transaction(async (tx) => {
        // 1. Ambil data penanggung (asuransi/nasabah) & kelas berdasarkan pasien_id dan nasabah_id
        const pasienNasabah = await tx.pasien_nasabah.findFirst({
            where: {
                pasien_id: data.pasien_id,
                nasabah_id: data.nasabah_id,
                status_batal: null,
            },
            select: {
                pasien_nasabah_id: true,
                hak_kelas_id: true,
            },
        });

        const defaultKelas = parseInt((process.env.kelas_ruang3 ?? "3") as string, 10);
        const kelasId = pasienNasabah?.hak_kelas_id || defaultKelas;
        const pasienNasabahId = pasienNasabah?.pasien_nasabah_id || null;
        const nasabahId = data.nasabah_id;

        // 2. Insert tabel registrasi
        const registrasiId = await generateMaxDb1("max_registrasi_idx", "registrasi_id");
        const registrasi = await tx.registrasi.create({
            data: {
                registrasi_id: registrasiId,
                input_time: dateNow(),
                input_user_id: 1, // Default System User
                pasien_id: data.pasien_id,
                pasien_nasabah_id: pasienNasabahId, // Memakai pasien_nasabah_id hasil resolve
                tgl_masuk: new Date(data.tanggalDaftar),
                jenis_rawat: "RJ",
                prioritas: "Berjalan Sendiri",
                flag_online: 1,
            },
        });

        // 3. Insert tabel registrasi_detail
        const registrasiDetailId = await generateMaxDb1("max_registrasi_detail_idx", "registrasi_detail_id");
        const registrasiDetail = await tx.registrasi_detail.create({
            data: {
                registrasi_detail_id: registrasiDetailId,
                input_time: dateNow(),
                input_user_id: 1,
                registrasi_id: registrasiId,
                tgl_daftar: new Date(data.tanggalDaftar),
                bagian_id: data.kodeKlinik,
                kelas_id: kelasId,
                hak_kelas_id: kelasId,
            },
        });

        // 4. Hitung antrean pelayanan & Insert tabel registrasi_urut
        const rangeAntrianRJ = parseInt(process.env.rangeAntrianRJ || "10", 10);
        const antrianMax = await urutanMaxRajal(
            data.kodeKlinik,
            data.pegawai_id,
            data.tanggalDaftar,
            tx
        );

        const antrian_rj = antrianMax + 1;
        const addminute = antrian_rj * rangeAntrianRJ - rangeAntrianRJ;

        const hari = new Date(data.tanggalDaftar).getDay();
        const jadwal = await tx.jadwal_dokter.findFirst({
            where: {
                bagian_id: data.kodeKlinik,
                pegawai_id: data.pegawai_id,
                hari: hari,
                status_batal: null,
            },
            select: {
                waktu_mulai: true,
                waktu_selesai: true,
            },
        });

        let jam_mulai: any = jadwal?.waktu_mulai || "08:00:00";
        let jam_selesai: any = jadwal?.waktu_selesai || "12:00:00";
        jam_mulai = await timeHandler(jam_mulai);
        jam_selesai = await timeHandler(jam_selesai);

        const kontrol = `${data.tanggalDaftar} ${jam_mulai}`;
        const bataskontrol = `${data.tanggalDaftar} ${jam_selesai}`;

        let time = new Date(kontrol + " UTC");
        time.setMinutes(time.getMinutes() + addminute);

        let jampelayanan;
        if (new Date(time) >= new Date(bataskontrol + " UTC")) {
            jampelayanan = new Date(new Date(bataskontrol + " UTC").getTime() - 3600000);
        } else {
            jampelayanan = time;
        }

        const registrasiUrutId = await generateMaxDb1("max_registrasi_urut_idx", "registrasi_urut_id");
        const registrasiUrut = await tx.registrasi_urut.create({
            data: {
                registrasi_urut_id: registrasiUrutId,
                input_time: dateNow(),
                input_user_id: 1,
                registrasi_detail_id: registrasiDetailId,
                pegawai_id: data.pegawai_id,
                bagian_id: data.kodeKlinik,
                urutan: antrian_rj,
                tgl_urut: jampelayanan,
            },
        });

        // 5. Insert tabel penanggung_rawat
        const penanggungRawatId = await generateMaxDb1("max_penanggung_rawat_idx", "penanggung_rawat_id");
        await tx.penanggung_rawat.create({
            data: {
                penanggung_rawat_id: penanggungRawatId,
                input_time: dateNow(),
                input_user_id: 1,
                registrasi_id: registrasiId,
                rawat_user_id: data.kodeDokter,
            },
        });

        // 6. Insert tabel diagnosa_rawat
        const diagnosaRawatId = await generateMaxDb1("max_diagnosa_rawat_idx", "diagnosa_rawat_id");
        await tx.diagnosa_rawat.create({
            data: {
                diagnosa_rawat_id: diagnosaRawatId,
                input_time: dateNow(),
                input_user_id: 1,
                registrasi_id: registrasiId,
                icd_id: 9985, // Default/Placeholder ICD-10
                jenis_diagnosa: 1,
            },
        });

        // 7. Insert tabel bill_temp
        const billTempId = await generateMaxDb1("max_bill_temp_idx", "bill_temp_id");
        await tx.bill_temp.create({
            data: {
                bill_temp_id: billTempId,
                input_time: dateNow(),
                input_user_id: 1,
                registrasi_detail_id: registrasiDetailId,
                pasien_id: data.pasien_id,
                bagian_id: data.kodeKlinik,
                nasabah_id: nasabahId,
                kelas_ruang_id: kelasId,
                hak_kelas_ruang_id: kelasId,
                tgl_bill: new Date(data.tanggalDaftar),
            },
        });

        return {
            registrasi_id: registrasiId,
            registrasi_detail_id: registrasiDetailId,
            registrasi_urut_id: registrasiUrutId,
            urutan: antrian_rj,
            jam_pelayanan: jampelayanan,
        };
    });
};
