import Image from "next/image";
import Link from "next/link";

import { Category } from "@/components/Category";
import { countTransactionCategories } from "@/lib/utils";
import PlaidLink from "@/components/ui/PlaidLink";

import BankCard from "../bank/BankCard";

export const RightSidebar = ({
  user,
  transactions = [],
  banks = [],
}: RightSidebarProps) => {
  const categories: CategoryCount[] = countTransactionCategories(transactions);

  // Handle missing user data
  if (!user) {
    return null;
  }

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const email = user.email || "";
  const userName = `${firstName} ${lastName}`.trim() || "User";

  return (
    <aside className="right-sidebar">
      <section className="flex flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile">
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500">
              {firstName[0]?.toUpperCase() || "U"}
            </span>
          </div>

          <div className="profile-details">
            <h1 className="profile-name">
              {userName}
            </h1>
            <p className="profile-email">{email}</p>
          </div>
        </div>
      </section>

      <section className="banks">
        <div className="flex w-full justify-between">
          <h2 className="header-2">My Banks</h2>
          <div className="flex gap-2 items-center">
            <PlaidLink user={user} variant="ghost" />
          </div>
        </div>

        {banks && banks.length > 0 && (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-5">
            {banks[0] && (
              <div className="relative z-10">
                <BankCard
                  key={banks[0].$id || banks[0].id}
                  account={banks[0]}
                  userName={userName}
                  showBalance={false}
                />
              </div>
            )}
            {banks[1] && (
              <div className="absolute right-0 top-8 z-0 w-[90%]">
                <BankCard
                  key={banks[1].id || banks[1].$id}
                  account={banks[1]}
                  userName={userName}
                  showBalance={false}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-1 flex-col gap-6">
          <h2 className="header-2 ">Top Categories</h2>

          <div className="space-y-5">
            {categories.map((category, index) => (
              <Category key={category.name + index} category={category} />
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
};
