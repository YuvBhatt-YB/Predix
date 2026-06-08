import { walletSocketRoute } from "@/socket/wallet";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { updateWallet } from "@/state/user/user";
import { useEffect, useRef } from "react";
import portfolioApi from "@/api/portfolio";
import { setPositions } from "@/state/portfolio/portfolio";

export default function useWallet(userId) {
    const dispatch = useDispatch();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!userId) return;

        const socket = io(walletSocketRoute, {
            transports: ["websocket"],
        });

        socketRef.current = socket;

        const refreshPositions = async () => {
            try {
                const res = await portfolioApi.get(`/positions/${userId}`);
                dispatch(setPositions(res.data.positions || []));
            } catch (error) {
                console.error("Positions Refresh Fail", error);
            }
        };

        const handleWalletUpdated = (data) => {
            try {
                dispatch(updateWallet(data));
                refreshPositions();
            } catch (error) {
                console.error("Wallet Refresh Fail", error);
            }
        };

        const handleConnect = () => {
            socket.emit("joinWallet", userId);
        };

        socket.on("connect", handleConnect);
        socket.on("walletUpdated", handleWalletUpdated);

        if (socket.connected) {
            socket.emit("joinWallet", userId);
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("walletUpdated", handleWalletUpdated);

            setTimeout(() => {
                if (socket.connected || socket.active) {
                    socket.disconnect();
                }
            }, 300);

            socketRef.current = null;
        };
    }, [userId, dispatch]);
}
