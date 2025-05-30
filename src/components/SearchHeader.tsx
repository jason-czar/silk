
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import ThemeToggle from '@/components/ThemeToggle';
import UserMenu from '@/components/UserMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Heart, Menu, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

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
  return <div className={`${isCompact ? 'sticky top-0 z-50 bg-gradient-to-b from-[#EBEBEB]/60 to-[#EBEBEB]/10 dark:from-gray-900/60 dark:to-gray-900/10 shadow-sm backdrop-blur-sm' : ''}`}>
      <div className="container mx-auto px-4 py-[18px]">
        <header className={`flex items-center ${!isCompact ? 'mb-8' : 'mb-4 pl-[10px]'}`}>
          {!isCompact ? <div className="flex items-center justify-center mb-0 w-full">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isMobile ? <Sheet>
                    <SheetTrigger asChild>
                      <button className="p-2 rounded-full transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:rotate-12">
                        <Menu size={20} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm backdrop-blur-lg bg-white/80 dark:bg-gray-900/90 border-l border-white/20 dark:border-gray-800/50">
                      <SheetHeader className="pb-6">
                        <SheetTitle className="text-2xl bg-gradient-to-r from-[#E3231E] to-rose-500 bg-clip-text text-transparent font-bold">Silk Menu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 flex flex-col gap-6">
                        <div className="flex justify-center scale-110 mb-4">
                          <UserMenu />
                        </div>
                        <nav className="mt-2">
                          <ul className="space-y-3">
                            <li className="menu-item-appear" style={{ '--item-index': 0 } as React.CSSProperties}>
                              <Link to="/favorites" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                <Heart size={18} className="text-[#E3231E]" />
                                <span className="font-medium">My Favorites</span>
                              </Link>
                            </li>
                            <li className="menu-item-appear" style={{ '--item-index': 1 } as React.CSSProperties}>
                              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                                <span className="font-medium">Settings</span>
                              </Link>
                            </li>
                          </ul>
                        </nav>
                        <div className="flex justify-center">
                          <ThemeToggle />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet> : <>
                    <UserMenu />
                    <ThemeToggle />
                  </>}
              </div>
              <h1 className="font-['Montserrat'] font-black italic text-[#E3231E] text-7xl">Silk</h1>
            </div> : <>
              <div className={`${isMobile ? 'mr-2' : 'mr-8'}`}>
                <div onClick={resetSearch} className="cursor-pointer">
                  <h2 className="font-['Montserrat'] font-black italic text-[#E3231E] text-2xl">Silk</h2>
                </div>
              </div>
              <div className="flex-grow flex items-center justify-center">
                <SearchBar onSearch={onSearch} disabled={loading} />
              </div>
              <div className="ml-4 flex items-center gap-2 mx-[18px]">
                {isMobile ? <Sheet>
                    <SheetTrigger asChild>
                      <button className="p-2 rounded-full transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:rotate-12">
                        <Menu size={20} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm backdrop-blur-lg bg-white/80 dark:bg-gray-900/90 border-l border-white/20 dark:border-gray-800/50">
                      <SheetHeader className="pb-6">
                        <SheetTitle className="text-2xl bg-gradient-to-r from-[#E3231E] to-rose-500 bg-clip-text text-transparent font-bold">Silk Menu</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 flex flex-col gap-6">
                        <div className="flex justify-center scale-110 mb-4">
                          <UserMenu />
                        </div>
                        <nav className="mt-2">
                          <ul className="space-y-3">
                            <li className="menu-item-appear" style={{ '--item-index': 0 } as React.CSSProperties}>
                              <Link to="/favorites" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                <Heart size={18} className="text-[#E3231E]" />
                                <span className="font-medium">My Favorites</span>
                              </Link>
                            </li>
                            <li className="menu-item-appear" style={{ '--item-index': 1 } as React.CSSProperties}>
                              <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                                <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                                <span className="font-medium">Settings</span>
                              </Link>
                            </li>
                          </ul>
                        </nav>
                        <div className="flex justify-center">
                          <ThemeToggle />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet> : <>
                    <UserMenu />
                    <ThemeToggle />
                  </>}
              </div>
            </>}
        </header>
        {!isCompact && <>
            <p className="text-gray-600 dark:text-gray-300 mb-12 text-xl sm:text-2xl px-4 sm:px-[42px] transition-colors duration-300">
              Find similar products - at factory direct prices.
            </p>
            <div className="scale-in">
              <SearchBar onSearch={onSearch} disabled={loading} />
            </div>
          </>}
      </div>
    </div>;
};
export default SearchHeader;
