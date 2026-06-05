import ForgotForm from './ForgotForm';

export default function ForgotPasswordPage() {
  const bgIndex = Math.floor(Math.random() * 5) + 1;
  return <ForgotForm bgIndex={bgIndex} />;
}
