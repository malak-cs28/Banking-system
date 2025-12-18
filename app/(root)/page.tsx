import { redirect } from "next/navigation";

import { HeaderBox, TotalBalanceBox } from "@/components/ui/common";
import { RightSidebar } from "@/components/nav/RightSidebar";
import { RecentTransactions } from "@/components/transaction/RecentTransactions";
import EmptyState from "@/components/ui/EmptyState";
import DemoDataSeeder from "@/components/ui/DemoDataSeeder";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser, getUserInfo } from "@/lib/actions/user.actions";

type SearchParamProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const Home = async ({ searchParams }: SearchParamProps) => {
  // Await searchParams before accessing its properties (Next.js 15+ requirement)
  const params = await searchParams || {};
  
  // Safely extract id and page from searchParams
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const page = Array.isArray(params.page) ? params.page[0] : params.page;

  const idSafe = id ?? null;
  const pageSafe = page ?? "1";
  const currentPage = Number(pageSafe) || 1;

  // Fetch logged-in user with error handling
  let loggedInAccount;
  try {
    loggedInAccount = await getLoggedInUser();
  } catch (e) {
    console.error("Error fetching logged in user:", e);
    redirect("/sign-in");
  }

  if (!loggedInAccount) {
    redirect("/sign-in");
  }

  // Fetch full user info from database (includes firstName, lastName, etc.)
  let loggedIn;
  try {
    loggedIn = await getUserInfo({ userId: loggedInAccount.$id });
    // Fallback to account data if user info not found
    if (!loggedIn) {
      loggedIn = {
        ...loggedInAccount,
        firstName: loggedInAccount.name?.split(' ')[0] || '',
        lastName: loggedInAccount.name?.split(' ').slice(1).join(' ') || '',
      };
    }
  } catch (e) {
    console.error("Error fetching user info:", e);
    // Fallback to account data
    loggedIn = {
      ...loggedInAccount,
      firstName: loggedInAccount.name?.split(' ')[0] || '',
      lastName: loggedInAccount.name?.split(' ').slice(1).join(' ') || '',
    };
  }

  // Fetch accounts with error handling
  let accounts;
  try {
    accounts = await getAccounts({ userId: loggedIn.$id });
  } catch (e) {
    console.error("Error fetching accounts:", e);
    accounts = { data: [], totalBanks: 0, totalCurrentBalance: 0 };
  }

  // Handle empty state - no bank accounts connected yet
  if (!accounts || !accounts.data || accounts.data.length === 0) {
    return (
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox
              type="greeting"
              title="Welcome"
              user={loggedIn?.firstName || "Guest"}
              subtext="Access & manage your account and transactions efficiently."
            />
          </header>

          <EmptyState user={loggedIn} />
        </div>

        <RightSidebar
          user={loggedIn}
          transactions={[]}
          banks={[]}
        />
      </section>
    );
  }

  const accountsData = accounts.data;
  const appwriteItemId = idSafe || accountsData[0]?.appwriteItemId;

  // Fetch specific account with error handling
  let account;
  try {
    account = await getAccount({ appwriteItemId });
  } catch (e) {
    console.error("Error fetching account:", e);
    account = null;
  }

  if (!account) {
    return (
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox
              type="greeting"
              title="Welcome"
              user={loggedIn?.firstName || "Guest"}
              subtext="Access & manage your account and transactions efficiently."
            />
          </header>

          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <h2 className="text-24 font-semibold text-gray-900">Account Data Unavailable</h2>
            <p className="text-16 font-normal text-gray-600 text-center max-w-md">
              We couldn't load your account information. Please try refreshing the page or contact support if the issue persists.
            </p>
          </div>
        </div>

        <RightSidebar
          user={loggedIn}
          transactions={[]}
          banks={accountsData?.slice(0, 2) || []}
        />
      </section>
    );
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access & manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>

        {/* Demo Data Seeder - For presentations */}
        <DemoDataSeeder userId={loggedIn.$id || loggedIn.userId} bankId={appwriteItemId} />

        {/* Replace components with placeholders if debugging crashes */}
        <RecentTransactions
          accounts={accountsData}
          transactions={account?.transactions}
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar
        user={loggedIn}
        transactions={account?.transactions}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  );
};

export default Home;
