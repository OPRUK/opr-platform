export type SocialBrand = "opr" | "opc";

export type SocialRequestOptions = {
  forceRefresh?: boolean;
  brand?: SocialBrand;
};

export function socialCache<T>() {
  return new Map<SocialBrand, { data: T; expiresAt: number }>();
}
