import LoginForm from './LoginForm'

export default function LoginPage() {
  const bgIndex = Math.floor(Math.random() * 5) + 1;
  return <LoginForm bgIndex={bgIndex} />;
}
