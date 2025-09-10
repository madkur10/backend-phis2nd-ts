import { panggilAntrian, updateAntrian } from "./antrian.repository";

const panggilAntrianService = async (data: any) => {
    const panggilAntrianData = await panggilAntrian(data);

    return panggilAntrianData;
};

const updatePanggilanService = async (data: any) => {
    const updateAntrianData = await updateAntrian(data);

    return updateAntrianData;
};

export { panggilAntrianService, updatePanggilanService };
