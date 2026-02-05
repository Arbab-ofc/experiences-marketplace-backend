export const successResponse = <T>(data: T) => ({
  success: true,
  data,
});

export const errorResponse = (message: string, status: number) => ({
  success: false,
  error: { message, status },
});
