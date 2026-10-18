import type { MetadataRoute } from "next";
import { isPrivateMode } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return isPrivateMode()
    ? { rules: { userAgent: "*", disallow: "/" } }
    : { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cuenta"] } };
}
