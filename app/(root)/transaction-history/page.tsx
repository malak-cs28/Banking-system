import { redirect } from "next/navigation";

import { BankDropdown } from "@/components/bank/BankDropdown";
import { HeaderBox } from "@/components/ui/common";
import TransactionHistoryTable from "@/components/transaction/TransactionHistoryTable";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";

type SearchParamProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

const TransactionHistory = async (props: SearchParamProps) => {
  const { searchParams } = props || {};
  
  // Await searchParams before accessing its properties (Next.js 15+ requirement)
  const params = await searchParams || {};

  const id =
    params && typeof params.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : undefined;

  const pageStr =
    params && typeof params.page === "string"
      ? params.page
      : undefined;

  const currentPage = pageStr ? Number(pageStr) : 1;

  const loggedIn = await getLoggedInUser();
  if (!loggedIn) redirect("/sign-in");

  const accounts = await getAccounts({
    userId: loggedIn?.$id,
  });
  
  if (!accounts || !accounts.data || accounts.data.length === 0) {
    return (
      <section className="transactions">
        <div className="transactions-header">
          <HeaderBox
            title="Transaction History"
            subtext="See your bank details and transactions."
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-16 font-normal text-gray-600">No bank accounts found. Please connect a bank account first.</p>
        </div>
      </section>
    );
  }

  const accountsData = accounts.data;
  const appwriteItemId = id || accountsData[0]?.appwriteItemId;

  if (!appwriteItemId) {
    return (
      <section className="transactions">
        <div className="transactions-header">
          <HeaderBox
            title="Transaction History"
            subtext="See your bank details and transactions."
          />
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-16 font-normal text-gray-600">Unable to load account information.</p>
        </div>
      </section>
    );
  }

  const account = await getAccount({ appwriteItemId });

  if (!account || !account.data) {
    return (
      <section className="transactions">
        <div className="transactions-header">
          <HeaderBox
            title="Transaction History"
            subtext="See your bank details and transactions."
          />
          {accountsData && accountsData.length > 0 && (
            <BankDropdown accounts={accountsData} />
          )}
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <p className="text-16 font-normal text-gray-600">Unable to load account details. Please try again.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="transactions">
      <div className="transactions-header">
        <HeaderBox
          title="Transaction History"
          subtext="See your bank details and transactions."
        />
        <BankDropdown accounts={accountsData} />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">{account?.data.name}</h2>
            <p className="text-14 text-blue-25">{account?.data.officialName}</p>
            <p className={`text-14 font-medium text-blue-25`}>
              ●●●● ●●●● ●●●● {account?.data.mask}
            </p>
          </div>
          <div className="transactions-account-balance">
            <p className={`text-14`}>Current Balance</p>
            <p className={`text-24 text-center font-bold `}>
              {formatAmount(account?.data.currentBalance)}
            </p>
          </div>
        </div>

        <TransactionHistoryTable page={currentPage} transactions={account?.transactions} />
      </div>
    </section>
  );
};

export default TransactionHistory;
