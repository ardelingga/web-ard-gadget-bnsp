import { ResponseDto } from '../../../common/utils/response.dto';
export const loginSuccessResponse = () => {
  return {
    status: 200,
    description: 'Login berhasil',
    schema: {
      example: {
        status: 'success',
        message: 'Berhasil signin!',
        data: {
          access_token: 'Your access token',
          refresh_token: 'Your refresh token',
        },
      },
    },
  };
};

export const loginFailedResponse = () => {
  return {
    status: 400,
    description: 'Login gagal',
    schema: {
      example: {
        status: 'failed',
        message: 'Invalid email or password',
        data: null,
      },
    },
  };
};
