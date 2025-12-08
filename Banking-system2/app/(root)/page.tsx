import HeaderBox from "@/components/ui/HeaderBox";
import TotalBalanceBox from "@/components/ui/TotalBalanceBox";
import react from "react";

const Home = () => {
  const loggedIn = {firstName: 'Malak'};
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
          type="greeting"
          title="Welcome to NU Bank,"
          user={loggedIn?.firstName || "Customer"}
          subtext="Your modern banking platform for everyone."
          />

          <TotalBalanceBox
          accounts={[]}
          totalBanks={1}
          totalCurrentBalance={1250.35}
          />

        </header>
      </div>

    </section>
  );
};

export default Home;