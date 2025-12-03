import HeaderBox from "@/components/ui/HeaderBox";
import react from "react";

const Home = () => {
  const loggedIn = {firstName: 'Malak'};
  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
          type="greeting"
          title="Welcome to NU Bank"
          user={loggedIn?.firstName || "Customer"}
          subtext="Your modern banking platform for everyone."
          />

        </header>
      </div>

    </section>
  );
};

export default Home;