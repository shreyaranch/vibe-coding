import { rmSync } from "node:fs";
import { DB_PATH, db } from "./db.ts";

db.close();
for (const suffix of ["", "-wal", "-shm"]) rmSync(DB_PATH + suffix, { force: true });
console.log("Deleted the local Tidbit database. Demo data will be re-created on next start.");
