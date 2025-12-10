
//import MobileNav from "@/Banking-system2/components/MobileNav";
 //import Sidebar from "@/Banking-system2/components/Sidebar"
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //const loggedIn = { firstName: "Adrian", lastName: "JSM" }as User;

  return (
    <main className="flex h-screen w-full font-inter">
      Sidebar

        {children}
    </main>
  );
}
