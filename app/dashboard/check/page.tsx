import { Suspense } from "react";
import { redirect } from 'next/navigation';
import { getDashboardSession } from "@/app/lib/auth/session";
import TabSwitch from "@/app/ui/dashboard/tab-switch";

// Sub page
import BorrowBooksPage from "./out/page"
import ReturningBooksPage from "./in/page"

export default async function CheckPage({
    searchParams,
} : {
    searchParams?: Promise<Record<string, string | string[]>>;
}) {
    const params = (await searchParams) ?? {};
    const { user } = await getDashboardSession();
    if (!user) redirect("/login");

    const mode =
    params.mode === 'in' || params.mode === 'out'
      ? params.mode
      : 'out';
  
    return (
        <main className="space-y-8">
            <title>Check Books | Dashboard</title>

            <TabSwitch
                activeKey={mode}
                items={[
                    {
                        key: 'out',
                        label: 'Borrow Book',
                        href: '/dashboard/check?mode=out',
                    },
                    {
                        key: 'in',
                        label: 'Return Book',
                        href: '/dashboard/check?mode=in',
                    },
                ]}
            />

            {/* Content */}
            <Suspense fallback={null}>
                {mode === 'in' ? (
                    <ReturningBooksPage searchParams={Promise.resolve(params)} />
                ) : (
                    <BorrowBooksPage searchParams={Promise.resolve(params)} />
                )}
            </Suspense>
        </main>
    )
}