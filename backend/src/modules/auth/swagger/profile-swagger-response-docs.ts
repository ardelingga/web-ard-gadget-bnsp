// Fungsi untuk mendokumentasikan header Authorization untuk endpoint profile
export const profileAuthorizationHeader = () => {
  return {
    name: 'Authorization',
    description: 'Bearer token untuk otentikasi',
    required: true,
    example: 'Bearer your_token_here',
  };
};
export const profileSuccessResponse = () => {
  return {
    status: 200,
    description: 'Profile berhasil diambil',
    schema: {
      example: {
        status: 'success',
        message: 'Profile berhasil diambil',
        data: {
          id: 1, // Alias ID
          name_business: 'Toko Serba Ada',
          email: 'tokoserbaada@gmail.com',
          phone_number: '08123456789',
          address: 'Jl. Raya, No. 123',
          is_deleted: false,
          updated_at: '2025-02-11T02:00:30.232Z',
          created_at: '2025-02-11T02:00:30.232Z',
        },
      },
    },
  };
};

export const profileFailedResponse = () => {
  return {
    status: 401,
    description: 'Unauthorized',
    schema: {
      example: {
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  };
};
