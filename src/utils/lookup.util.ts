/* eslint-disable @typescript-eslint/no-var-requires */
import { DEFAULT_ACCEPT_LANGUAGE } from '../configs/constants.config';
import { ResponseStatus } from '../responses/response.status';

const GenericResponse = {
  en: {
    '1000': {
      code: 1000,
      header: '',
      description: 'Success',
    },
    '1899': {
      code: 1899,
      header: 'Unable to proceed',
      description: 'We cannot process your request at the moment. Please try again later.',
    },
    '1999': {
      code: 1999,
      header: 'Unable to proceed',
      description: 'We cannot process your request at this moment.',
    },
  },
  th: {
    '1000': {
      code: 1000,
      header: '',
      description: 'สำเร็จ',
    },
    '1899': {
      code: 1899,
      header: 'ไม่สามารถดำเนินการต่อได้',
      description: 'ไม่สามารถทำรายการได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
    },
    '1999': {
      code: 1999,
      header: 'ไม่สามารถดำเนินการต่อได้',
      description: 'ไม่สามารถทำรายการได้ในขณะนี้',
    },
  },
};

export class LookupUtil {
  static read(statusCode: number, language: string): JSON {
    if (!language) language = DEFAULT_ACCEPT_LANGUAGE;
    return GenericResponse['en'][statusCode];
  }

  static getLookup(statusCode: number, language: string): JSON | ResponseStatus {
    const responseStatus = this.read(statusCode, language);
    if (responseStatus) {
      return responseStatus;
    }

    return {
      code: statusCode,
      header: null,
      description: null,
    };
  }
}
