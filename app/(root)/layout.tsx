
//import MobileNav from "@/Banking-system2/components/MobileNav";


import Image from "next/image";
import Sidebar from "@/Banking-system2/components/Sidebar"
import MobileNav from "@/Banking-system2/components/MobileNav";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = { firstName: "Adrian", lastName: "JSM" }as User;


  return (
    <main className="flex h-screen w-full font-inter">
  <Sidebar user= {loggedIn}/>
<div className="flex size-full flex-col">
   <div className="root-layout">
    <img src="/icons/logo.svg" width={30} height={30} alt="logo icon" />
    <div>
      < MobileNav user={loggedIn}/>
    </div>
 
   </div>
    {children}
</div>
        
    </main>
  );
}
