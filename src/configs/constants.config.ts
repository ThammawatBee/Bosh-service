// status
export const CODE_TECHNICAL_ERROR = 1999;
export const CODE_BUSINESS_ERROR = 1899;
export const CODE_SUCCESS = 1000;

// config
export const PROM_PREFIX = process.env.PROM_PREFIX;
export const SERVER_PORT = (process.env.SERVER_PORT as unknown as number) || 3000;
export const DATABASE_TYPE = 'postgres';
export const DATABASE_SLAVE = 'slave';
export const LOGGER_ENABLE = process.env.LOGGER_ENABLE as unknown as boolean | true;
export const IS_EMPTY_VAULT_CONFIG = !process.env.VAULT_URL || !process.env.VAULT_PATH;
// header
export const ACCEPT_LANGUAGE_HEADER = 'accept-language';
export const DEFAULT_ACCEPT_LANGUAGE = 'TH';
export const LANGUAGE_TH = 'TH';
export const LANGUAGE_EN = 'EN';
export const USER_ID_HEADER = 'userid';
export const ACCEPT_LANGUAGE_LIST = ['EN', 'TH'];
export const CORRELATION_ID_HEADER = 'correlationid';
export const CONTENT_TYPE_APP_JSON = 'application/json';

// notification constants
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DATE_TIMEZONE_FORMAT = 'YYYY-MM-DD[T]HH:mm:ssZ';
export const TIME_ZONE_BANGKOK = 'Asia/Bangkok';
export const DATE_TIMEZONE_ZULU_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
export const TIME_ZONE_OFFSET = 7;