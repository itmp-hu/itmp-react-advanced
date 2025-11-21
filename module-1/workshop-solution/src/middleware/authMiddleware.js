import { redirect } from "react-router";

async function authMiddleware({ request }) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw redirect("/login");
  }
}

export default authMiddleware;