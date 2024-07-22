import { defaults } from './defaults';
export default { ...defaults, ...process.env, ...import.meta.env };
