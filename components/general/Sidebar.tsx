import { cn } from "@/lib/utils"
import Link from "next/link"
import { sidebarItems } from "./sidebar-items"
import SidebarItem from "./SidebarItem"

interface Props {
    className?: string
}

export default function Sidebar({ className }: Props) {
    return (
        <div className={cn(`
        bg-grey-900 h-full w-75 fixed text-grey-300 flex-col
        ${className}
    `)}>
            <div>
                <Link className="mt-8 mx-4 text-2xl font-bold mb-7 flex items-center gap-x-3" href={"/overview"}>
                    DocMe
                </Link>
            </div>

            <div className="flex flex-col flex-1">
                {
                    sidebarItems.map((item) => (
                        <SidebarItem key={item.href} {...item} />
                    ))
                }
            </div>

            <div>

            </div>
        </div>
    )
}
