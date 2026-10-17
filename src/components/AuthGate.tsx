import React, { useEffect, useState } from "react";
import {
  isFirebaseAuth,
  observeAuth,
  signInWithGoogle,
} from "../services/auth";
export const AuthGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(!isFirebaseAuth),
    [user, setUser] = useState<unknown>(null),
    [error, setError] = useState("");
  useEffect(
    () =>
      isFirebaseAuth
        ? observeAuth((value) => {
            setUser(value);
            setReady(true);
          })
        : undefined,
    [],
  );
  if (!ready)
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        Đang xác thực...
      </div>
    );
  if (isFirebaseAuth && !user)
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-white">
        <div className="text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500 grid place-items-center text-2xl font-black">
            SGT
          </div>
          <h1 className="text-2xl font-black">Saigon Tếu Operations</h1>
          <p className="text-slate-400">
            Đăng nhập bằng tài khoản Google nội bộ đã được cấp quyền.
          </p>
          {error && <p className="text-rose-400">{error}</p>}
          <button
            onClick={() =>
              void signInWithGoogle().catch((e) => setError(e.message))
            }
            className="bg-white text-slate-900 px-5 py-3 rounded-xl font-bold"
          >
            Đăng nhập với Google
          </button>
        </div>
      </div>
    );
  return <>{children}</>;
};
