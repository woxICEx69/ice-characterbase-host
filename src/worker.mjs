import source from "../payload/1.lua";
import { handleRequest } from "./router.mjs";
export default { async fetch(request) { return handleRequest(request, source); } };
