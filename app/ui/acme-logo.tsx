import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white text-center`}>
      <BuildingLibraryIcon className="max-w-10 max-h-10 " />
    </div>
  );
}
