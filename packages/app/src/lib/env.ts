import { defaults } from './defaults';
const env = { ...defaults, ...process.env, ...import.meta.env };
export default env;
