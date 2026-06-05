import { Suspense } from 'react';
import ResetForm from './ResetForm';

export default function ResetPasswordPage() {
  const bgIndex = Math.floor(Math.random() * 5) + 1;
  return (
    <Suspense>
      <ResetForm bgIndex={bgIndex} />
    </Suspense>
  );
}
