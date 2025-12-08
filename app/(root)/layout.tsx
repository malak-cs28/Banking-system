import MobileNav from "@/Banking-system2/components/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = { firstName: "Adrian", lastName: "JSM" }as User;

  return (
    <main className="flex h-screen w-full font-inter">
      <div className="flex h-full w-full flex-col">
        <div className="root-layout flex items-center gap-3 px-4 py-2">
          <img src="/icons/logo.svg" width={30} alt="logo" />

          <div>
            <MobileNav user={loggedIn} />
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
