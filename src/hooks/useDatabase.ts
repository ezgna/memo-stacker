import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";

export const useDatabase = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  useEffect(() => {
    const openDatabase = async () => {
      try {
        const dbInstance = await SQLite.openDatabaseAsync("MemoLog.db");
        setDb(dbInstance);
      } catch (e) {
        console.error(e);
      }
    };
    openDatabase();
  }, []);
  return db;
};
