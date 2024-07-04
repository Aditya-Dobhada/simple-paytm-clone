import { Navigate } from "react-router-dom";
import { AppBar } from "../components/AppBar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";
import axios from "axios";
import { useEffect, useState } from "react";

export function Dashboard() {
  const [balance, setBalance] = useState(0)
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div>
        <Navigate to="/signin" />
      </div>
    );
  }

  useEffect(() => {
    async function getBalance() {
      const response = await axios.get(
        "http://localhost:3000/api/v1/account/balance",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const balanceStr = response.data.balance;
      const balance = parseFloat(parseFloat(balanceStr).toFixed(2));
      setBalance(balance);
    }
    getBalance();
  }, [token]);

  return (
    <div>
      <AppBar />

      <div className="m-8">
        <Balance value={balance} />
        <Users />
      </div>
    </div>
  );
}
