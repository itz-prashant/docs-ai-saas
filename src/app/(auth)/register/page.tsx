import AuthForm from "../_components/AuthForm";


export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm type="register" />
    </main>
  );
}