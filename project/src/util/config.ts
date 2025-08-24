const local_server = false;
export const BACKEND_URL = local_server ? "http://localhost:8080" : "https://general-project-production.up.railway.app";
export const FRONTEND_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://tannyspaacquisitions.shop"

export const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1eqbNGSklj9kRzh7jcRG9PtNKURURjy_V8sc3Kz5WJSo/edit?gid=0#gid=0"