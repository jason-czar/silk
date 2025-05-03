
interface ImageCardProps {
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  width: number;
  height: number;
}

const ImageCard = ({ 
  title, 
  thumbnailUrl, 
  imageUrl, 
  width, 
  height 
}: ImageCardProps) => {
  return (
    <a 
      href={imageUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block h-full"
    >
      <div className="rounded-lg overflow-hidden shadow-md h-full bg-white image-card-hover">
        <div className="relative pb-[100%]">
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </a>
  );
};

export default ImageCard;
