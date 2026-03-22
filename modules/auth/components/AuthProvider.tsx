"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  session: Session | null;
};

export default function AuthProvider({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}