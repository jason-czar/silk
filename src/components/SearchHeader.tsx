
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SearchHeaderProps {
  onSearch: (query: string, useDHgate?: boolean) => void;
  loading: boolean;
  resetSearch?: () => void;
  isCompact?: boolean;
  preferHighQuality?: boolean;
  onToggleQualityPreference?: () => void;
}

const SearchHeader = ({
  onSearch,
  loading,
  resetSearch,
  isCompact = false,
  preferHighQuality,
  onToggleQualityPreference
}: SearchHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isCompact ? 'sticky top-0 z-50 bg-gradient-to-b from-[#EBEBEB]/60 to-[#EBEBEB]/10 dark:from-gray-900/60 dark:to-gray-900/10 shadow-sm backdrop-blur-sm' : ''}`}>
      <div className="container mx-auto px-4 py-[18px]">
        <header className={`flex items-center ${!isCompact ? 'mb-8' : 'mb-4 pl-[10px]'}`}>
          {!isCompact ? (
            <div className="flex items-center justify-center mb-8 w-full">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isMobile ? (
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Menu size={20} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 flex flex-col gap-4">
                        <UserMenu />
                        <div className="flex justify-center">
                          <ThemeToggle />
                        </div>
                        {onToggleQualityPreference && (
                          <div className="flex items-center space-x-2 justify-center mt-4">
                            <Switch 
                              id="compact-quality-preference" 
                              checked={preferHighQuality}
                              onCheckedChange={onToggleQualityPreference}
                            />
                            <Label htmlFor="compact-quality-preference">High-quality images</Label>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <>
                    <UserMenu />
                    <ThemeToggle />
                  </>
                )}
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
              <div className="ml-4 flex items-center gap-2">
                {isMobile ? (
                  <Sheet>
                    <SheetTrigger asChild>
                      <button className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Menu size={20} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 flex flex-col gap-4">
                        <UserMenu />
                        <div className="flex justify-center">
                          <ThemeToggle />
                        </div>
                        {onToggleQualityPreference && (
                          <div className="flex items-center space-x-2 justify-center mt-4">
                            <Switch 
                              id="quality-preference-sheet" 
                              checked={preferHighQuality}
                              onCheckedChange={onToggleQualityPreference}
                            />
                            <Label htmlFor="quality-preference-sheet">High-quality images</Label>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                ) : (
                  <>
                    <UserMenu />
                    <ThemeToggle />
                    {onToggleQualityPreference && (
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="quality-preference-header" 
                          checked={preferHighQuality}
                          onCheckedChange={onToggleQualityPreference}
                        />
                        <Label htmlFor="quality-preference-header" className="text-sm">High-quality</Label>
                      </div>
                    )}
                  </>
                )}
              </div>
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
