import MobileNav from "@/components/ui/MobileNav";
import Sidebar from "@/components/ui/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  
}>) { 
  const loggedIn = { firstName: "Adrian", lastName: "JSM" } as User;

  return (
    <main className="flex h-screen w-full font-inter">
       <Sidebar user ={loggedIn} />
      <div className="flex size-full flex-col">
       <div className="root-layout">

        <div>
          < MobileNav user={loggedIn}/>
        </div>
       </div>
       {children}
      </div>
        
        </main>
  ); 
}
 