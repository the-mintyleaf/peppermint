export interface Site extends Record<string, unknown> {
  id: string;
  organization: string;
  name: string;
  code: string;
  site_type: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  province_state: string;
  district: string;
  country_code: string;
  postal_code: string;
  latitude: string | null;
  longitude: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SitesFetchResponse {
  data: Site[];
  meta: { total: number; page: number; pageSize: number };
}

export interface CreateSitePayload {
  name: string;
  code: string;
  site_type: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  province_state: string;
  district: string;
  country_code: string;
  postal_code: string;
}
