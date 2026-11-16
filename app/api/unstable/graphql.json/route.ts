import { getPrivacyProxyConfig } from "lib/privacy/config";
import { forwardPrivacyRequest } from "lib/privacy/proxy";

export async function POST(request: Request): Promise<Response> {
  return forwardPrivacyRequest(request, getPrivacyProxyConfig());
}
