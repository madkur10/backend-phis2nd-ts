import { parse } from "path";
import { prismaDb1, prismaDb2, prismaDb3 } from "../../../../db";
import {
    generateMaxDb1,
    generateMaxDb2,
    selectFieldDb2,
    timeHandler,
} from "../../../../db/database.handler";
import { dateNow } from "../../../../middlewares/time";

const getAllergyIntoleranceRequest = async (limit: string, registrasi_id: string = "") => {
    let queryRegistrasiId;
    let queryDate;
    let queryWhereTransaction;
    if (registrasi_id) {
        queryDate = "";
        queryRegistrasiId = `AND r.registrasi_id = ${parseInt(
            registrasi_id,
            10
        )}`;

        queryWhereTransaction =
            "AND (ta.transaction_satu_sehat_id is null or ta.key_satu_sehat = '0')";
    } else {
        queryDate = `AND r.tgl_masuk::date = now()::date`;
        queryRegistrasiId = "";
        queryWhereTransaction = `AND ta.transaction_satu_sehat_id is null`;
    }

    const getDataPasien = `
        SELECT
            r.registrasi_id registration_id,
            te.key_satu_sehat Encounter_ID,
            p.no_mr,
            p.nama_pasien patient_name,
            rp.key_satu_sehat Patient_ID,
            r.tgl_masuk tgl_urut,
            b.nama_bagian location_poli_name,
            u.nama_pegawai practitioner_name,
            rpp.key_satu_sehat Practitioner_ID,
            n.nama_nasabah,
            upper(
                trim(
                    string_agg(
                        distinct
                        case
                            when ed.value = 'on' then ed.variabel
                            else ed.value
                        end, ','
                    )
                )
            ) alergi,
            ta.key_satu_sehat AllergyIntolerance_ID
        from
            registrasi r
        inner join registrasi_detail rd on
            r.registrasi_id = rd.registrasi_id
        inner join pasien p on
            p.pasien_id = r.pasien_id  
        inner join bagian b on
            rd.bagian_id = b.bagian_id 
        inner join penanggung_rawat pr on
            r.registrasi_id = pr.registrasi_id 
        inner join users u on
            pr.rawat_user_id = u.user_id 
        inner join pasien_nasabah pn on
            r.pasien_nasabah_id = pn.pasien_nasabah_id 
        inner join nasabah n on
            pn.nasabah_id = n.nasabah_id 
        inner join emr e on
            rd.registrasi_detail_id = e.registrasi_detail_id 
        inner join emr_detail ed on
            e.emr_id = ed.emr_id 
        inner join resources rp on
            r.pasien_id = rp.key_simrs
            and rp.resources_type = 'Patient'
        inner join resources rpp on
            pr.rawat_user_id = rpp.key_simrs
            and rpp.resources_type = 'Practitioner'
        inner join transaction_satu_sehat te on
            r.registrasi_id = te.key_simrs
            and te.transaction_type = 'Encounter'
        left outer join transaction_satu_sehat ta on
            r.registrasi_id = ta.key_simrs
            and ta.transaction_type = 'AllergyIntolerance'
        where
            r.status_batal is null
            and rd.status_batal is null
            and e.status_batal is null
            and ed.objek_id = 141
            and ed.value is not null
            and ed.variabel not in ('tingkat_alergi', 'reaksi_alergi', 'alergi_RI', 'alergi_Persiapan')
            and trim(ed.value) not in ('off','tidak ada', '-', '0', '00', '=', 'Pain Manajemen', 'tidakj ada', 'Tdk', 'tidalk ada', 'Tidak Diketahui', 'tidak ada-', 'Tidak Ada Alergi', '/', 'Riawayat Allergi Obat +', '- Tidak', 'tidakada', 'ya', 'Ada, Namun Tidak Diketahui', 'O', '_', '---', '-------------', '-=', '.', '', 'TIDAK ADA', 'Tidk Ada', 'tidak da', 'Tidak Daa', 'tidak ada ', 'tidak adaa','Terlampir','Tidak Ada','Disangkal','--','Tidak','DISANGKAL','&mdash;','tidak aada','tidka ada','Tidak ')
            ${queryRegistrasiId}
            ${queryDate}
            ${queryWhereTransaction}
        group by
            r.registrasi_id,
            te.key_satu_sehat,
            p.no_mr,
            p.nama_pasien,
            rp.key_satu_sehat,
            r.input_time,
            b.nama_bagian,
            u.nama_pegawai,
            rpp.key_satu_sehat,
            n.nama_nasabah,
            ta.key_satu_sehat
        limit ${parseInt(limit, 10)};
    `;
    const getDataPasienNew = await prismaDb1.$queryRawUnsafe(getDataPasien);
    
    return getDataPasienNew;
};

const updateInsertIdAllergyIntoleranceRepo = async (
    registrasi_id: bigint,
    payload: any,
    response: any,
    id: string,
    type: string,
    gagal: number | null = null
) => {
    const transaction_satu_sehatId = await generateMaxDb1(
        "max_transaction_satu_sehat_idx",
        "transaction_satu_sehat_id"
    );
    let data: any = {
        transaction_satu_sehat_id: transaction_satu_sehatId,
        input_time: dateNow(),
        input_user_id: 1,
        payload: payload,
        key_simrs: registrasi_id,
        key_satu_sehat: id,
        transaction_type: type,
        response: response,
    };
    if (gagal === 1) {
        data.status = 1;
    }
    const insertRujukan = await prismaDb1.transaction_satu_sehat.create({
        data,
    });
};

const updateUpdateIdAllergyIntoleranceRepo = async (
    registrasi_id: bigint,
    payload: any,
    response: any,
    id: string,
    type: string,
    gagal: number | null = null,
    transaction_satu_sehat_id: number | null = null
) => {
    let data: any = {
        mod_time: dateNow(),
        mod_user_id: 1,
        payload: payload,
        key_simrs: registrasi_id,
        key_satu_sehat: id,
        transaction_type: type,
        response: response,
    };
    if (gagal === 1) {
        data.status = 1;
    }
    if (transaction_satu_sehat_id) {
        data.transaction_satu_sehat_id = transaction_satu_sehat_id;
    }
    const updateRujukan = await prismaDb1.transaction_satu_sehat.update({
        where: {
            transaction_satu_sehat_id: parseInt(
                data.transaction_satu_sehat_id,
                10
            ),
        },
        data,
    });
};

export {
    getAllergyIntoleranceRequest,
    updateInsertIdAllergyIntoleranceRepo,
    updateUpdateIdAllergyIntoleranceRepo,
};
