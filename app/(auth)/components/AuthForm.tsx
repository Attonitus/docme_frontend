import Link from "next/link";

interface Props {
    title: string;
    children: React.ReactNode;
    footer: {
        text: string;
        linkText: string;
        linkHref: string;
    };
}

export function AuthForm({ children, footer, title }: Props) {
    return (
        <div className="bg-white w-full max-w-md flex flex-col gap-4 p-8 rounded-xl shadow-sm text-left">
            <h3 className="text-3xl font-bold">{title}</h3>
            {children}
            
            <p className="text-sm text-center text-gray-500">
                {footer.text}{" "}
                <Link href={footer.linkHref} className="underline font-bold text-black">
                    {footer.linkText}
                </Link>
            </p>
        </div>
    );
}