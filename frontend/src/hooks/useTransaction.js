import { useEffect, useState } from "react";
import api from "../api/funds"
import { useSelector } from 'react-redux';


export default function useTransaction() {
  const { wallet } = useSelector((state) => state.user.userData);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/transactions/${wallet.id}`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTransactions();
    console.log("Transaction Mounted");
  }, []);

  return {
    transactions,
    loading
  }
}