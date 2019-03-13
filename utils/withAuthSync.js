import { Component } from "react";
import Router from "next/router";
import nextCookie from "next-cookies";
import cookie from "js-cookie";
import Axios from "axios";

if (process.browser) {
  window.jsCookie = cookie;
}

export const login = async ({ token }) => {
  cookie.set("token", token, { expires: 1 });
  Router.push("/");
};

export const logout = async token => {
  // 1. Remove the token cookie
  cookie.remove("token");

  // 2. Notify API to expire token
  // Notice we are sending the token in the Authorization header
  // so that the server knows which token to expire
  try {
    await Axios.delete("https://leigh-notes-api.herokuapp.com/session", {
      headers: { Authorization: `Bearer: ${token}` }
    });
  } catch (error) {
    // assume already logged out
  }

  // 3. Write to localStorage... triggering an event which enables
  // listening tabs to redirect to the /login page
  window.localStorage.setItem("logout", Date.now().toString());

  // 4. Redirect user back to the /login page
  Router.push("/login");
};

// Gets the display name of a JSX component for dev tools
const getDisplayName = Component =>
  Component.displayName || Component.name || "Component";

export const withAuthSync = WrappedComponent => {
  return class extends Component {
    static displayName = `withAuthSync(${getDisplayName(WrappedComponent)})`;

    static async getInitialProps(ctx) {
      const token = auth(ctx);
      const { res } = ctx;

      if (res && res.finished) {
        // When redirecting, the response is finished.
        // No point in continuing to render
        return {};
      }

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps({ ...ctx, token }));

      return { ...componentProps, token };
    }

    componentDidMount() {
      window.addEventListener("storage", this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener("storage", this.syncLogout);
      window.localStorage.removeItem("logout");
    }

    syncLogout = event => {
      if (event.key === "logout") {
        console.log("logged out from storage!");
        Router.push("/login");
      }
    };

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };
};

const auth = ctx => {
  const { token } = nextCookie(ctx);

  if (!token) {
    if (ctx.req && ctx.res) {
      ctx.res.writeHead(302, { Location: "/login" });
      ctx.res.end();
    } else {
      Router.push("/login");
    }
    return;
  }

  return token;
};
