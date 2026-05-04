import MobileSidebar from "@/components/general/MobileSidebar";
import Sidebar from "@/components/general/Sidebar";

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {

    return (
        <div>
            <MobileSidebar />
            <Sidebar className="hidden lg:flex" />
            <main className="bg-beige-100 lg:pl-75 h-full pt-[50px] lg:pt-0">
                <div className="max-w-6xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}