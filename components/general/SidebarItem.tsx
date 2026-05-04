"use client"
import { cn } from "@/lib/utils";
import { Bot, Home, MessagesSquare, Settings, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation";

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

export default function SidebarItem({ href, icon, title }: Props) {

    const pathname = usePathname();
    const active = pathname === href;

    const Icon = iconMap[icon];

    return (
        <Link className={cn(`
            flex
            gap-4
            w-68
            rounded-r-lg
            py-4
            px-6
            ${active ? "bg-white shadow-[inset_6px_0_0_0_theme(colors.green)]": ""}
        `)}
        href={href}>
            <Icon className={cn(`${active ? "text-green": ""}`)} />
            <span className={cn(`font-black ${active ? "text-green": ""}`)}>{title}</span>
        </Link>
    )
}
