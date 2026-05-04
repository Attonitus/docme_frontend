import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
    children
}: {
    children: React.ReactNode;
}) {

    return (
        <div className="bg-beige-100 min-h-screen lg:p-4 lg:flex">

            {/* Mobile header */}
            <div className="block lg:hidden bg-grey-900 text-white rounded-b-lg text-4xl py-4 font-bold text-center">
                <Link href={"/"}>DocMe</Link>
            </div>

            {/* Left panel — imagen ocupa todo el alto */}
            <div className="hidden lg:block relative w-[560px] shrink-0 self-stretch">
                <Image
                    src={`/auth_image.png`}
                    alt="Auth image"
                    fill
                    className="object-cover rounded-lg"
                    priority
                />
            </div>

            {/* Right panel — centra el form vertical y horizontalmente */}
            <div className="flex-1 flex items-center justify-center p-8">
                {children}
            </div>
        </div>
    );
}