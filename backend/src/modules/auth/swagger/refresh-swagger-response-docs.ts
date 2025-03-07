export const refreshTokenSuccessResponse = () => {
  return {
    status: 200,
    description: 'Token berhasil diperbarui',
    schema: {
      example: {
        status: 'success',
        message: 'Token berhasil diperbarui',
        data: {
          access_token: 'Your new access token',
        },
      },
    },
  };
};

// Fungsi untuk mendokumentasikan respons gagal refresh token
export const refreshTokenFailedResponse = () => {
  return {
    status: 400,
    description: 'Token refresh gagal',
    schema: {
      example: {
        status: 'failed',
        message: 'Invalid refresh token',
        data: null,
      },
    },
  };
};

export const refreshTokenRequestBody = () => {
  return {
    properties: {
      refreshToken: { type: 'string', example: 'Your refresh token here' },
    },
    description: 'Request body untuk refresh token',
    schema: {
      example: {
        refreshToken: 'Your refresh token here',
      },
    },
  };
};
