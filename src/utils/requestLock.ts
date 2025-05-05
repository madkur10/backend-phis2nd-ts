import fs from "fs";
import path from "path";

const LOCK_DIR = path.join(__dirname, "locks");

export function ensureLockDir() {
    if (!fs.existsSync(LOCK_DIR)) {
        fs.mkdirSync(LOCK_DIR, { recursive: true });
    }
}

export function getLockFilePath(key: string) {
    return path.join(LOCK_DIR, `${key}.lock`);
}

export function isLocked(key: string): boolean {
    return fs.existsSync(getLockFilePath(key));
}

export function createLock(key: string) {
    fs.writeFileSync(getLockFilePath(key), "locked", { flag: "wx" });
}

export function removeLock(key: string) {
    fs.unlinkSync(getLockFilePath(key));
}
