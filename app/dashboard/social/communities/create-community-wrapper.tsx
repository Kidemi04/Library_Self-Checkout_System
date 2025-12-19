'use client';

import { useState } from 'react';
import { Button } from '@/app/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateCommunityModal from '@/app/ui/dashboard/communities/create-community-modal';
import CreateCommunityForm from '@/app/ui/dashboard/communities/create-community-form';

export default function CreateCommunityWrapper() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="flex items-center justify-center gap-2 w-full md:w-auto bg-swin-red hover:bg-swin-red/90 shadow-lg shadow-swin-red/20 transition-all hover:scale-105 active:scale-95">
                <PlusIcon className="h-5 w-5" />
                <span>Create Community</span>
            </Button>

            <CreateCommunityModal open={isOpen} onClose={() => setIsOpen(false)}>
                <CreateCommunityForm onSuccess={() => setIsOpen(false)} />
            </CreateCommunityModal>
        </>
    );
}
