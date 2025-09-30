import { BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center text-swin-ivory`}
    >
      <BuildingLibraryIcon className="h-8 w-8" />
    </div>
  );
}
