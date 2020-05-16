import serviceErrors from '@/service/errors';

const errors = {
  ...serviceErrors,
  signup: {
    code: 6000,
    message: 'Account already exists.',
  },
};

export default errors;
