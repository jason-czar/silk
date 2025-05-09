
import { DHgateProductResponse } from '@/integrations/dhgate/client';

export interface ImageCardProps {
  item: {
    kind: string;
    title: string;
    htmlTitle: string;
    link: string;
    displayLink: string;
    snippet: string;
    htmlSnippet: string;
    mime?: string;
    fileFormat?: string;
    image?: {
      contextLink: string;
      height: number;
      width: number;
      byteSize: number;
      thumbnailLink: string;
      thumbnailHeight: number;
      thumbnailWidth: number;
    };
  };
}

export interface ProductData {
  title: string;
  displayTitle: string;
  cleanTitle: string;
  thumbnailUrl: string;
  imageUrl: string;
  contextLink: string;
  productSource: string;
  brandName: string;
}
