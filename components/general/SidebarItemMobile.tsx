"use client"

import Link from "next/link"
import { Bot, Home, MessagesSquare, Settings, Zap } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const iconMap = {
    home: Home,
    bot: Bot,
    messagesSquare: MessagesSquare,
    settings: Settings,
    widgets: Zap
}

interface Props {
    title: string,
    href: string,
    icon: keyof typeof iconMap
}

export default function SidebarItemMobile({ href, icon, title }: Props) {

    const pathname = usePathname();
    const active = pathname === href;

    const Icon = iconMap[icon]

    return (
        <Link className={cn(`
            flex
            flex-col
            justify-center
            items-center
            px-6
            md:px-8
            py-4
            rounded-t-lg
            text-2xl
            ${active ? "bg-white text-green shadow-[inset_0_-6px_0_0_theme(colors.green)]" : "bg-transparent text-grey-300"}
        `)} href={href}>
            <Icon />
            <span className="hidden md:block text-current text-[12px] leading-[1.5] font-bold">
                {title}
            </span>
        </Link>
    )
}
