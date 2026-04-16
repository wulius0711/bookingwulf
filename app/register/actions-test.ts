'use server';

export type RegisterState = { error?: string } | undefined;

export async function registerHotelTest(
  _state: RegisterState,
  _formData: FormData,
): Promise<RegisterState> {
  return { error: 'test action works' };
}
