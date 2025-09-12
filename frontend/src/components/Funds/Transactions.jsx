import React, { useEffect, useState } from 'react'
import TransactionModel from './TransactionModel'
import { PiEmptyBold } from "react-icons/pi";
import api from "../../api/funds"
import { useSelector } from 'react-redux';
import Loading from '../ui/Loading';
const Transactions = () => {
    const {wallet} = useSelector((state)=>state.user.userData)
    const [transactions,setTransactions] = useState([])
    const[loading,setLoading] = useState(false)
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
    useEffect(()=>{
        
        fetchTransactions()
        console.log("Transaction Mounted")
    },[])
  return (
    <div>
      <div className=" pb-2 border-b-1 border-borderGray">
        <p className=" font-secondary font-semibold text-primary">
          Your Transactions History
        </p>
      </div>
      <div className=" mt-2 flex flex-col gap-2 ">
        {loading ? (
          <div className=' w-full flex items-center justify-center'><Loading /></div>
        ) : transactions && transactions.length > 0 ? (
          <div className=' max-h-82 overflow-y-auto custom-scrollbar'>
            {transactions.map((transaction) => (
              <TransactionModel
                key={transaction.id}
                type={transaction.type}
                description={transaction.description}
                addedAt={transaction.createdAt}
              />
            ))}
          </div>
        ) : (
          <p className=" font-semibold font-secondary text-primary flex items-center gap-2">
            <PiEmptyBold /> No Transactions Yet
          </p>
        )}
      </div>
    </div>
  );
}

export default Transactions
