import {
    MarketStatus,
    OrderExecutionType,
    OrderOutcome,
    OrderSide,
    OrderStatus,
    Prisma,
    TransactionType,
} from "@prisma/client";
import { BOT } from "../matchingEngine/LP_CONFIG";
import prisma from "../prisma";

type SeedLevel = {
    outcome: OrderOutcome;
    side: OrderSide;
    price: number;
    quantity: number;
};

type MarketSeedResult = {
    created: number;
    skipped: number;
    holdingsCreated: number;
    holdingsUpdated: number;
};

const DEMO_ORDER_QUANTITY = 500;
const DEMO_HOLDING_SHARES = 2_000;
const DEMO_MIN_FREE_BALANCE = 100_000;

const DEMO_LEVELS: SeedLevel[] = [
    {
        outcome: OrderOutcome.YES,
        side: OrderSide.BUY,
        price: 0.45,
        quantity: DEMO_ORDER_QUANTITY,
    },
    {
        outcome: OrderOutcome.YES,
        side: OrderSide.SELL,
        price: 0.55,
        quantity: DEMO_ORDER_QUANTITY,
    },
    {
        outcome: OrderOutcome.NO,
        side: OrderSide.BUY,
        price: 0.45,
        quantity: DEMO_ORDER_QUANTITY,
    },
    {
        outcome: OrderOutcome.NO,
        side: OrderSide.SELL,
        price: 0.55,
        quantity: DEMO_ORDER_QUANTITY,
    },
];

const roundMoney = (value: number) => {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};

const getPotentialBuyLockPerMarket = () => {
    return DEMO_LEVELS.filter((level) => level.side === OrderSide.BUY).reduce(
        (total, level) => total + roundMoney(level.price * level.quantity),
        0,
    );
};

const ensureLpBot = async () => {
    const existingBot = await prisma.user.findUnique({
        where: {
            username: BOT.id,
        },
    });

    if (existingBot) {
        console.log(`LP bot found: ${existingBot.username} (${existingBot.id})`);
        return existingBot;
    }

    const bot = await prisma.user.create({
        data: {
            username: BOT.id,
            password: BOT.password,
            profileImg: "",
            email: BOT.email,
        },
    });

    console.log(`LP bot created: ${bot.username} (${bot.id})`);
    return bot;
};

const ensureLpWallet = async (botId: string, targetBalance: number) => {
    const existingWallet = await prisma.wallet.findUnique({
        where: {
            userID: botId,
        },
    });

    if (!existingWallet) {
        const wallet = await prisma.wallet.create({
            data: {
                userID: botId,
                balance: targetBalance,
                locked: 0,
            },
        });

        console.log(
            `LP wallet created with demo balance ${wallet.balance.toFixed(2)}`,
        );
        return wallet;
    }

    if (existingWallet.balance < targetBalance) {
        const wallet = await prisma.wallet.update({
            where: {
                userID: botId,
            },
            data: {
                balance: targetBalance,
            },
        });

        console.log(
            `LP wallet updated from ${existingWallet.balance.toFixed(2)} to ${wallet.balance.toFixed(2)}`,
        );
        return wallet;
    }

    console.log(
        `LP wallet found with balance ${existingWallet.balance.toFixed(2)} and locked ${existingWallet.locked.toFixed(2)}`,
    );
    return existingWallet;
};

const ensureHoldingForSell = async (
    tx: Prisma.TransactionClient,
    botId: string,
    marketId: string,
    outcome: OrderOutcome,
    requiredShares: number,
) => {
    const holding = await tx.holdings.findUnique({
        where: {
            userId_marketId_outcome: {
                userId: botId,
                marketId,
                outcome,
            },
        },
    });

    if (!holding) {
        await tx.holdings.create({
            data: {
                userId: botId,
                marketId,
                outcome,
                shares: Math.max(DEMO_HOLDING_SHARES, requiredShares),
                lockedShares: 0,
                avgPrice: 0.5,
            },
        });

        return { created: 1, updated: 0 };
    }

    const totalInventory = holding.shares + holding.lockedShares;
    const inventoryShortfall = Math.max(
        DEMO_HOLDING_SHARES - totalInventory,
        0,
    );
    const availableShareShortfall = Math.max(requiredShares - holding.shares, 0);
    const sharesToAdd = Math.max(inventoryShortfall, availableShareShortfall);

    if (sharesToAdd > 0) {
        await tx.holdings.update({
            where: {
                userId_marketId_outcome: {
                    userId: botId,
                    marketId,
                    outcome,
                },
            },
            data: {
                shares: {
                    increment: sharesToAdd,
                },
            },
        });

        return { created: 0, updated: 1 };
    }

    return { created: 0, updated: 0 };
};

const findExistingSeedOrder = async (
    tx: Prisma.TransactionClient,
    botId: string,
    marketId: string,
    level: SeedLevel,
) => {
    return tx.order.findFirst({
        where: {
            userId: botId,
            marketId,
            outcome: level.outcome,
            type: level.side,
            price: level.price,
            orderType: OrderExecutionType.LIMIT,
            status: {
                in: [OrderStatus.OPEN, OrderStatus.PARTIAL],
            },
        },
        select: {
            id: true,
        },
    });
};

const createSeedOrder = async (
    tx: Prisma.TransactionClient,
    botId: string,
    marketId: string,
    level: SeedLevel,
) => {
    if (level.side === OrderSide.BUY) {
        const lockAmount = roundMoney(level.price * level.quantity);
        const wallet = await tx.wallet.findUnique({
            where: {
                userID: botId,
            },
            select: {
                id: true,
                balance: true,
            },
        });

        if (!wallet) {
            throw new Error("LP wallet not found while seeding BUY order");
        }

        if (wallet.balance < lockAmount) {
            throw new Error(
                `LP wallet balance ${wallet.balance.toFixed(2)} is below required lock ${lockAmount.toFixed(2)}`,
            );
        }

        await tx.wallet.update({
            where: {
                userID: botId,
            },
            data: {
                balance: {
                    decrement: lockAmount,
                },
                locked: {
                    increment: lockAmount,
                },
            },
        });

        await tx.transaction.create({
            data: {
                type: TransactionType.TRADE_LOCK,
                amount: lockAmount,
                description: `LOCKED IN $${lockAmount.toFixed(2)} FOR DEMO LP ORDER`,
                walletId: wallet.id,
            },
        });
    } else {
        await tx.holdings.update({
            where: {
                userId_marketId_outcome: {
                    userId: botId,
                    marketId,
                    outcome: level.outcome,
                },
            },
            data: {
                shares: {
                    decrement: level.quantity,
                },
                lockedShares: {
                    increment: level.quantity,
                },
            },
        });
    }

    await tx.order.create({
        data: {
            userId: botId,
            marketId,
            type: level.side,
            orderType: OrderExecutionType.LIMIT,
            outcome: level.outcome,
            quantity: level.quantity,
            remainingQuantity: level.quantity,
            price: level.price,
            status: OrderStatus.OPEN,
        },
    });
};

const seedMarket = async (
    botId: string,
    market: { id: string; title: string },
): Promise<MarketSeedResult> => {
    return prisma.$transaction(async (tx) => {
        const result: MarketSeedResult = {
            created: 0,
            skipped: 0,
            holdingsCreated: 0,
            holdingsUpdated: 0,
        };

        for (const level of DEMO_LEVELS) {
            const existingOrder = await findExistingSeedOrder(
                tx,
                botId,
                market.id,
                level,
            );

            if (existingOrder) {
                result.skipped += 1;
                continue;
            }

            if (level.side === OrderSide.SELL) {
                const holdingResult = await ensureHoldingForSell(
                    tx,
                    botId,
                    market.id,
                    level.outcome,
                    level.quantity,
                );

                result.holdingsCreated += holdingResult.created;
                result.holdingsUpdated += holdingResult.updated;
            }

            await createSeedOrder(tx, botId, market.id, level);
            result.created += 1;
        }

        return result;
    });
};

const main = async () => {
    console.log("Demo liquidity seeding started");

    const bot = await ensureLpBot();
    const activeMarkets = await prisma.market.findMany({
        where: {
            status: MarketStatus.ACTIVE,
        },
        select: {
            id: true,
            title: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    const walletTargetBalance =
        DEMO_MIN_FREE_BALANCE +
        Math.ceil(activeMarkets.length * getPotentialBuyLockPerMarket());

    await ensureLpWallet(bot.id, walletTargetBalance);

    console.log(`Total active markets found: ${activeMarkets.length}`);

    let totalOrdersCreated = 0;
    let totalOrdersSkipped = 0;
    let totalHoldingsCreated = 0;
    let totalHoldingsUpdated = 0;

    for (const market of activeMarkets) {
        const result = await seedMarket(bot.id, market);

        totalOrdersCreated += result.created;
        totalOrdersSkipped += result.skipped;
        totalHoldingsCreated += result.holdingsCreated;
        totalHoldingsUpdated += result.holdingsUpdated;

        console.log(
            `Market ${market.id} (${market.title}): seeded ${result.created}, skipped ${result.skipped}`,
        );
    }

    console.log(`Total holdings created: ${totalHoldingsCreated}`);
    console.log(`Total holdings updated: ${totalHoldingsUpdated}`);
    console.log(`Total orders created: ${totalOrdersCreated}`);
    console.log(`Total orders skipped: ${totalOrdersSkipped}`);
    console.log(
        "Demo liquidity seeded in database. Restart/start the engine so Redis orderbooks rebuild from DB.",
    );
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error("Demo liquidity seeding failed:", error);
        await prisma.$disconnect();
        process.exit(1);
    });
