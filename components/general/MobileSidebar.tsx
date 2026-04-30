import { sidebarItems } from "./sidebar-items";
import SidebarItemMobile from "./SidebarItemMobile";

export default function MobileSidebar() {
    return (
        <div className="lg:hidden flex absolute bottom-0 bg-grey-900 w-full h-15 md:h-18 rounded-t-lg">
            
            <div className="flex w-full justify-center items-end md:gap-4">
                {
                    sidebarItems.map((item) => (
                        <SidebarItemMobile key={item.href} {...item}  />
                    ))
                }
            </div>
        </div>
    )
}
