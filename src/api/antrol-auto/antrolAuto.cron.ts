import cron from "node-cron";
import {
    hitFisioNow,
    updateTask,
    updateTaskFisio,
    hitUlangAddAntrol,
    updateTaskRujukBedaPoli,
    updateTaskPoliSesuai
} from "./antrolAuto.service";

// Control status for turning on/off dynamically
let isCronEnabled = true;

// Lock variables to prevent execution overlaps
let isHitUlangRunning = false;
let isFisioRunning = false;
let isRujukBedaRunning = false;
let isPoliSesuaiRunning = false;
let isBackdateRunning = false;

export const getCronStatus = (): boolean => {
    return isCronEnabled;
};

export const setCronStatus = (status: boolean): void => {
    isCronEnabled = status;
};

// Helper for formatting YYYY-MM-DD
const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Helper to get backdate range (7 days ago until yesterday)
const getBackdateRange = () => {
    const today = new Date();
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return {
        tglAwal: formatDate(oneWeekAgo),
        tglAkhir: formatDate(yesterday)
    };
};

export const initAntrolCron = () => {
    console.log("[CRON INITIALIZER] Mengaktifkan scheduler cron internal...");

    // 1. Hit Ulang Add Antrol (Mulai jam 7.00, setiap 10 menit)
    cron.schedule("*/10 * * * *", () => {
        if (!isCronEnabled) {
            return;
        }

        const hour = new Date().getHours();
        if (hour < 7) return;

        if (isHitUlangRunning) {
            console.log("[CRON] Hit Ulang Add Antrol terlewat karena proses sebelumnya masih berjalan.");
            return;
        }

        // Run asynchronously in the background to prevent blocking node-cron tick
        (async () => {
            try {
                isHitUlangRunning = true;
                console.log(`\n[CRON] [${new Date().toLocaleTimeString()}] Menjalankan Hit Ulang Add Antrol (limit 20)...`);
                const res = await hitUlangAddAntrol(20);
                console.log("[CRON] Selesai Hit Ulang Add Antrol:", res);
            } catch (error) {
                console.error("[CRON ERROR] Hit Ulang Add Antrol:", error);
            } finally {
                isHitUlangRunning = false;
            }
        })();
    });

    // 2. Fisio Now & Update Task Fisio 1-7 (Mulai jam 7.00, setiap 30 menit)
    cron.schedule("*/30 * * * *", () => {
        if (!isCronEnabled) {
            return;
        }

        const hour = new Date().getHours();
        if (hour < 7) return;

        if (isFisioRunning) {
            console.log("[CRON] Fisio Task terlewat karena proses sebelumnya masih berjalan.");
            return;
        }

        // Run asynchronously in the background to prevent blocking node-cron tick
        (async () => {
            try {
                isFisioRunning = true;
                console.log(`\n[CRON] [${new Date().toLocaleTimeString()}] Menjalankan Fisio Now (limit 10)...`);
                await hitFisioNow(10);

                console.log("[CRON] Menjalankan Update Task Fisio 1 s/d 7 secara berurutan...");
                for (let taskId = 1; taskId <= 7; taskId++) {
                    console.log(`[CRON] -> Update Task Fisio taskId: ${taskId}`);
                    await updateTaskFisio(10, taskId);
                }
                console.log("[CRON] Selesai Fisio Task.");
            } catch (error) {
                console.error("[CRON ERROR] Fisio Task:", error);
            } finally {
                isFisioRunning = false;
            }
        })();
    });

    // 3. Rujukan Beda Poli (Mulai jam 8.00, setiap 10 menit)
    cron.schedule("*/10 * * * *", () => {
        if (!isCronEnabled) {
            return;
        }

        const hour = new Date().getHours();
        if (hour < 8) return;

        if (isRujukBedaRunning) {
            console.log("[CRON] Rujukan Beda Poli terlewat karena proses sebelumnya masih berjalan.");
            return;
        }

        // Run asynchronously in the background to prevent blocking node-cron tick
        (async () => {
            try {
                isRujukBedaRunning = true;
                console.log(`\n[CRON] [${new Date().toLocaleTimeString()}] Menjalankan Update Task Rujuk Beda Poli 1 s/d 7...`);
                for (let taskId = 1; taskId <= 7; taskId++) {
                    await updateTaskRujukBedaPoli(10, taskId);
                }
                console.log("[CRON] Selesai Rujuk Beda Poli.");
            } catch (error) {
                console.error("[CRON ERROR] Rujuk Beda Poli:", error);
            } finally {
                isRujukBedaRunning = false;
            }
        })();
    });

    // 4. Poli Sesuai (Mulai jam 8.00, setiap 10 menit)
    cron.schedule("*/10 * * * *", () => {
        if (!isCronEnabled) {
            return;
        }

        const hour = new Date().getHours();
        if (hour < 8) return;

        if (isPoliSesuaiRunning) {
            console.log("[CRON] Poli Sesuai terlewat karena proses sebelumnya masih berjalan.");
            return;
        }

        // Run asynchronously in the background to prevent blocking node-cron tick
        (async () => {
            try {
                isPoliSesuaiRunning = true;
                console.log(`\n[CRON] [${new Date().toLocaleTimeString()}] Menjalankan Update Task Poli Sesuai 1 s/d 7...`);
                for (let taskId = 1; taskId <= 7; taskId++) {
                    await updateTaskPoliSesuai(10, taskId);
                }
                console.log("[CRON] Selesai Poli Sesuai.");
            } catch (error) {
                console.error("[CRON ERROR] Poli Sesuai:", error);
            } finally {
                isPoliSesuaiRunning = false;
            }
        })();
    });

    // 5. Update Task Backdate (Mulai jam 13.00, setiap 15 menit)
    cron.schedule("*/15 * * * *", () => {
        if (!isCronEnabled) {
            return;
        }

        const hour = new Date().getHours();
        if (hour < 13) return;

        if (isBackdateRunning) {
            console.log("[CRON] Update Task Backdate terlewat karena proses sebelumnya masih berjalan.");
            return;
        }

        // Run asynchronously in the background to prevent blocking node-cron tick
        (async () => {
            try {
                isBackdateRunning = true;
                const { tglAwal, tglAkhir } = getBackdateRange();
                console.log(`\n[CRON] [${new Date().toLocaleTimeString()}] Menjalankan Update Task Backdate 1 s/d 7 (Tgl Awal: ${tglAwal}, Tgl Akhir: ${tglAkhir})...`);
                for (let taskId = 1; taskId <= 7; taskId++) {
                    await updateTask(50, taskId, true, tglAwal, tglAkhir);
                }
                console.log("[CRON] Selesai Update Task Backdate.");
            } catch (error) {
                console.error("[CRON ERROR] Update Task Backdate:", error);
            } finally {
                isBackdateRunning = false;
            }
        })();
    });
};
