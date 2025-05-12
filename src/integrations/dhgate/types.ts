
// Token storage
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

// Define interface for product response
export interface DHgateProductResponse {
  product: {
    itemCode: string;
    itemName: string;
    originalImageUrl?: string;
    skuProperties?: Array<{
      propertyId: string;
      propertyName?: string;
      values: Array<{
        propertyValueId?: string;
        propertyValueDisplayName?: string;
        imageUrl?: string;
      }>;
    }>;
    imageList?: Array<{
      imageUrl: string;
    }>;
    [key: string]: any;
  };
  [key: string]: any;
}

// Define interface for product search response
export interface DHgateSearchResponse {
  totalItem: number;
  totalPage: number;
  pageSize: number;
  pageNum: number;
  items: any[];
  [key: string]: any;
}

// Define interface for seller response
export interface DHgateSellerResponse {
  seller: any;
  [key: string]: any;
}
