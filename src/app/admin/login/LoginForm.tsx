"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="adm-form" noValidate>
      <div className={`nb-field${state.errors?.email ? " nb-field--error" : ""}`}>
        <label className="nb-label" htmlFor="email">
          Email
        </label>
        <input className="nb-input" id="email" name="email" type="email" autoComplete="username" required />
        {state.errors?.email && <p className="nb-error">{state.errors.email}</p>}
      </div>
      <div className={`nb-field${state.errors?.password ? " nb-field--error" : ""}`}>
        <label className="nb-label" htmlFor="password">
          Kata sandi
        </label>
        <input
          className="nb-input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.errors?.password && <p className="nb-error">{state.errors.password}</p>}
      </div>
      <button className="nb-btn nb-btn--lg" type="submit" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
      <p role="status" aria-live="polite" style={{ margin: 0 }}>
        {state.message && <span className="nb-error">{state.message}</span>}
      </p>
    </form>
  );
}
