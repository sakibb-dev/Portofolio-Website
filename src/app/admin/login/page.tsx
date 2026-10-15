import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="adm-login nb-grid">
      <div className="nb-card">
        <div>
          <p className="nb-eyebrow">Admin</p>
          <h1 style={{ fontSize: 40, lineHeight: 1, margin: 0 }}>Masuk</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
