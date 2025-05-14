
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';

interface SearchHeaderProps {
  onSearch: (query: string, useDHgate?: boolean) => void;
  loading: boolean;
  resetSearch?: () => void;
  isCompact?: boolean;
}

const SearchHeader = ({
  onSearch,
  loading,
  resetSearch,
  isCompact = false
}: SearchHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isCompact ? 'sticky top-0 z-50 bg-gradient-to-b from-[#EBEBEB]/95 to-[#EBEBEB]/90 dark:from-gray-900/95 dark:to-gray-900/90 shadow-md backdrop-blur-lg' : ''}`}>
      <div className="container mx-auto px-4 py-[18px]">
        <header className={`flex items-center ${!isCompact ? 'mb-8' : 'mb-4 pl-[10px]'}`}>
          {!isCompact ? (
            <div className="flex items-center justify-center mb-8 w-full">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <UserMenu />
                <ThemeToggle />
              </div>
              <h1 className="font-['Montserrat'] font-black italic text-[#E3231E] text-7xl">Silk</h1>
            </div>
          ) : (
            <>
              <div className={`${isMobile ? 'mr-2' : 'mr-8'}`}>
                <div onClick={resetSearch} className="cursor-pointer">
                  <h2 className="font-['Montserrat'] font-black italic text-[#E3231E] text-2xl">Silk</h2>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <SearchBar onSearch={onSearch} disabled={loading} />
              </div>
              {isMobile ? (
                <div className="ml-2">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <button className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Menu size={20} className="text-gray-600 dark:text-gray-300" />
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="p-4">
                      <div className="flex flex-col items-center gap-4">
                        <UserMenu />
                        <ThemeToggle />
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>
              ) : (
                <div className="ml-4 flex items-center gap-2">
                  <UserMenu />
                  <ThemeToggle />
                </div>
              )}
            </>
          )}
        </header>
        {!isCompact && (
          <>
            <p className="text-gray-600 dark:text-gray-300 mb-16 text-xl sm:text-2xl px-4 sm:px-[42px] transition-colors duration-300">
              Find similar products - at factory direct prices.
            </p>
            <div className="scale-in">
              <SearchBar onSearch={onSearch} disabled={loading} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;
