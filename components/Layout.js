import React from "react";
import Link from "next/link";
import Head from "next/head";
import { logout } from "../utils/withAuthSync";
import "./normalize.css";
import "./global.css";

export default function Layout({ token, children }) {
  return (
    <div>
      <Head>
        <title>Notes!</title>
      </Head>
      <nav>
        {token ? (
          <button onClick={() => logout(token)}>Logout</button>
        ) : (
          <>
            <Link href="/login">
              <a className="btn">Login</a>
            </Link>
            <Link href="/register">
              <a className="btn">Register</a>
            </Link>
          </>
        )}
      </nav>
      <div className="container">{children}</div>
    </div>
  );
}
