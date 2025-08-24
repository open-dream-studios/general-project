import axios from "axios";
import { auth, provider, signInWithPopup } from "./firebase";
import { showToast } from "@/components/CustomToast";
import { toast } from "react-toastify";

export type LoginInputs = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

export type RegisterInputs = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export const login = async (inputs: LoginInputs) => {
  try {
    const res = await axios.post("/api/auth/login", inputs, {
      withCredentials: true,
    });
    return res.status === 200;
  } catch (err) {
    toast.error("Unauthorized user");
    console.error("Login failed", err);
    return false;
  }
};

export const logout = async () => {
  try {
    const res = await axios.post(
      "/api/auth/logout",
      {},
      { withCredentials: true }
    );
    return res.status === 200;
  } catch (err) {
    console.error("Login failed", err);
    return false;
  }
};

export const register = async (inputs: RegisterInputs) => {
  try {
    const res = await axios.post("/api/auth/register", inputs, {
      withCredentials: true,
    });
    return res.status === 200;
  } catch (err) {
    toast.error("Unauthorized user");
    console.error("Registration failed", err);
    return false;
  }
};

export const googleSignIn = async () => {
  try {
    const googleAccount = await signInWithPopup(
      auth,
      provider.setCustomParameters({ prompt: "select_account" })
    );

    const user = googleAccount.user;
    const idToken = await user.getIdToken();

    const res = await axios.post(
      "/api/auth/google",
      { idToken },
      {
        withCredentials: true,
      }
    );
    return res.status === 200;
  } catch (error) {
    toast.error("Unauthorized user");
    console.error("Login Error:", error);
    return false;
  }
};
