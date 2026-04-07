export interface Site {
  plant_no: string;
  name: string;
  address_line_1: string | null;
  address_line_2: string | null;
  address_town: string | null;
  address_county: string | null;
  address_post_code: string | null;
  telephone: string | null;
  fax: string | null;
  is_apha_site: boolean;
}

export interface CreateSiteRequest {
  plant_no: string;
  name: string;
  address_line_1?: string;
  address_line_2?: string;
  address_town?: string;
  address_county?: string;
  address_post_code?: string;
  telephone?: string;
  fax?: string;
  is_apha_site?: boolean;
}

export interface UpdateSiteNameRequest {
  new_name: string;
}

export interface UpdateSiteRequest {
  address_line_1?: string;
  address_line_2?: string;
  address_town?: string;
  address_county?: string;
  address_post_code?: string;
  telephone?: string;
  fax?: string;
  is_apha_site?: boolean;
}

export interface SiteListItem {
  plant_no: string;
  name: string;
}

export interface SiteValidationError {
  field: string;
  message: string;
}
