
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
// sdq

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  // jkjoo
}>) { 
  const loggedIn = { firstName: "Adrian", lastName: "JSM" } as User;

  return (
    <main className="flex h-screen w-full font-inter">
       <Sidebar user ={loggedIn} />
      <div className="flex size-full flex-col">
       <div className="root-layout">
        <img src="/icons/logo.svg" width={30} height={30} alt="logo" />
        <div>
          < MobileNav user={loggedIn}/>
        </div>
       </div>
       {children}
      </div>
        
        </main>
  ); 
}
 