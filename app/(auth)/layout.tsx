import Link from "next/link";

export default function AuthLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-beige-100">
            <Link href={"/"} className="block lg:hidden bg-grey-900 text-white rounded-b-lg text-4xl py-4 font-bold text-center">
                DocMe
            </Link>
            {children}
        </div>
    );
}