
import { dhgateApiRequest } from './api';
import { DHgateProductResponse, DHgateSearchResponse, DHgateSellerResponse } from './types';
import { toast } from "@/components/ui/use-toast";

/**
 * Get product details by itemcode
 */
export const getProductByItemcode = async (itemcode: string): Promise<DHgateProductResponse['product']> => {
  try {
    console.log("Fetching product details for itemcode:", itemcode);
    const response = await dhgateApiRequest<DHgateProductResponse>('dh.product.get', '1.0', { itemcode });
    
    console.log("DHgate product response:", JSON.stringify(response, null, 2));
    
    // Check if we have image information and log it for debugging
    if (response.product) {
      if (response.product.skuProperties) {
        console.log("Found SKU properties with images:", 
          response.product.skuProperties
            .filter(prop => prop.values.some(v => v.imageUrl))
            .length
        );
      }
      
      if (response.product.imageList) {
        console.log("Found image list with", response.product.imageList.length, "images");
      }
    }
    
    return response.product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

/**
 * Search products by keyword
 */
export const searchDHgateProducts = async (keyword: string, pageNum: number = 1, pageSize: number = 20) => {
  try {
    const response = await dhgateApiRequest<DHgateSearchResponse>('dh.product.search', '1.0', {
      keyword,
      pageNum: pageNum.toString(),
      pageSize: pageSize.toString()
    });
    return response;
  } catch (error) {
    console.error('Error searching DHgate products:', error);
    throw error;
  }
};

/**
 * Get seller information
 */
export const getSellerInfo = async () => {
  try {
    const response = await dhgateApiRequest<DHgateSellerResponse>('dh.user.seller.get', '1.0');
    return response.seller;
  } catch (error) {
    console.error('Error fetching seller info:', error);
    throw error;
  }
};
