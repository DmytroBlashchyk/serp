export const mockUserRepository = {
  getUserByEmail: jest.fn().mockImplementation((email: string) => {
    if (email === 'existing@example.com') {
      return {
        id: 1,
        email: 'existing@example.com',
        password: 'hashedPassword',
      };
    } else if (email === 'admin@example.com') {
      return {
        id: 2,
        email: 'admin@example.com',
        password: 'hashedAdminPassword',
      };
    }
    return null;
  }),
  save: jest.fn().mockImplementation(() => {
    return {
      email: 'test@test.com',
      password:
        '$argon2id$v=19$m=4096,t=3,p=1$VNoBYYYmlmM5SBe1/nb/Rw$CD6wPIawn0t2zxlobXAiRnu6Cgzo/jYuxUE1jS0a7F4',
      username: 'Dmitriy',
      tariffPlan: 4,
      firstName: 'Test',
      lastName: '',
      emailConfirmationToken: 'jNPy9M0hUUOsg1vXiZm5P',
      status: { id: '1', name: 'Activated' },
      passwordResetConfirmationToken: null,
      googleId: null,
      id: '2',
      createdAt: '2024-09-26T11:53:39.892Z',
      updatedAt: '2024-09-26T11:53:39.892Z',
      isEmailConfirmed: false,
      numberOfForgotPasswordLetterRequests: 0,
      numberOfResendingMailConfirmationLetterRequest: 0,
    };
  }),
};
