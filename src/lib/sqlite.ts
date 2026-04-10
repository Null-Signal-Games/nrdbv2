import { SQLocal } from 'sqlocal';
import { NRDB_SQLITE_NAME } from '$lib/constants';

export const { sql, overwriteDatabaseFile } = new SQLocal(NRDB_SQLITE_NAME);
