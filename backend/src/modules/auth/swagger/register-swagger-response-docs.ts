// src/auth/swagger/swagger-response-docs.ts

import { ResponseDto } from '../../../common/utils/response.dto';

export const signupSuccessResponse = () => {
  return {
    status: 201,
    description: 'Berhasil signup!',
    schema: {
      example: {
        status: 'success',
        message: 'Berhasil signup!',
        data: {
          access_token: 'Your access token',
          refresh_token: 'Your refresh token',
        },
      },
    },
  };
};

// Fungsi untuk mendokumentasikan respons gagal pada signup
export const signupFailedResponse = () => {
  return {
    status: 400,
    description: 'Bad Request - Credentials taken',
    schema: {
      example: {
        status: 'failed',
        message: 'Credentials taken',
        data: null,
      },
    },
  };
};
