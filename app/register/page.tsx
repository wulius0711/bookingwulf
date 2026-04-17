export const dynamic = 'force-dynamic';

import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <RegisterForm
      termsUrl={process.env.LEGAL_TERMS_URL || ''}
      privacyUrl={process.env.LEGAL_PRIVACY_URL || ''}
    />
  );
}
