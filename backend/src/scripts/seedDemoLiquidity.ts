import {
    MarketStatus,
    OrderExecutionType,
    OrderOutcome,
    OrderSide,
    OrderStatus,
    Prisma,
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

type SeedMarket = {
    id: string;
    title: string;
};

const DEMO_ORDER_QUANTITY = 10_000;
const DEMO_HOLDING_SHARES = 25_000;
const DEMO_MIN_FREE_BALANCE = 1_000_000;

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

const getSeedOrderKey = (marketId: string, level: SeedLevel) => {
    return `${marketId}:${level.outcome}:${level.side}:${level.price}`;
};

const getActiveSeedOrderKeys = async (botId: string, marketIds: string[]) => {
    if (marketIds.length === 0) {
        return new Set<string>();
    }

    const existingOrders = await prisma.order.findMany({
        where: {
            userId: botId,
            marketId: {
                in: marketIds,
            },
            orderType: OrderExecutionType.LIMIT,
            status: {
                in: [OrderStatus.OPEN, OrderStatus.PARTIAL],
            },
            remainingQuantity: {
                gt: 0,
            },
        },
        select: {
            marketId: true,
            outcome: true,
            type: true,
            price: true,
        },
    });

    return new Set(
        existingOrders.map((order) =>
            getSeedOrderKey(order.marketId, {
                outcome: order.outcome,
                side: order.type,
                price: order.price,
                quantity: DEMO_ORDER_QUANTITY,
            }),
        ),
    );
};

const getMissingBuyLockTotal = (
    markets: SeedMarket[],
    activeSeedOrderKeys: Set<string>,
) => {
    return roundMoney(
        markets.reduce((total, market) => {
            const missingBuyLockForMarket = DEMO_LEVELS.filter(
                (level) =>
                    level.side === OrderSide.BUY &&
                    !activeSeedOrderKeys.has(getSeedOrderKey(market.id, level)),
            ).reduce(
                (marketTotal, level) =>
                    marketTotal + roundMoney(level.price * level.quantity),
                0,
            );

            return total + missingBuyLockForMarket;
        }, 0),
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
            remainingQuantity: {
                gt: 0,
            },
        },
        select: {
            id: true,
        },
    });
};

const getBuyLockAmount = (levels: SeedLevel[]) => {
    return roundMoney(
        levels
            .filter((level) => level.side === OrderSide.BUY)
            .reduce(
                (total, level) =>
                    total + roundMoney(level.price * level.quantity),
                0,
            ),
    );
};

const getSellRequirements = (levels: SeedLevel[]) => {
    const requirements = new Map<OrderOutcome, number>();

    for (const level of levels) {
        if (level.side !== OrderSide.SELL) {
            continue;
        }

        requirements.set(
            level.outcome,
            (requirements.get(level.outcome) || 0) + level.quantity,
        );
    }

    return requirements;
};

const lockWalletForBuyOrders = async (
    tx: Prisma.TransactionClient,
    botId: string,
    lockAmount: number,
) => {
    if (lockAmount <= 0) {
        return;
    }

    const wallet = await tx.wallet.findUnique({
        where: {
            userID: botId,
        },
        select: {
            balance: true,
        },
    });

    if (!wallet) {
        throw new Error("LP wallet not found while seeding BUY orders");
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
};

const lockHoldingsForSellOrders = async (
    tx: Prisma.TransactionClient,
    botId: string,
    marketId: string,
    sellRequirements: Map<OrderOutcome, number>,
) => {
    for (const [outcome, quantity] of sellRequirements) {
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
                    decrement: quantity,
                },
                lockedShares: {
                    increment: quantity,
                },
            },
        });
    }
};

const createSeedOrder = async (
    tx: Prisma.TransactionClient,
    botId: string,
    marketId: string,
    level: SeedLevel,
) => {
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
    market: SeedMarket,
): Promise<MarketSeedResult> => {
    return prisma.$transaction(
        async (tx) => {
            const result: MarketSeedResult = {
                created: 0,
                skipped: 0,
                holdingsCreated: 0,
                holdingsUpdated: 0,
            };
            const levelsToCreate: SeedLevel[] = [];

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

                levelsToCreate.push(level);
            }

            if (levelsToCreate.length === 0) {
                return result;
            }

            const sellRequirements = getSellRequirements(levelsToCreate);

            for (const [outcome, requiredShares] of sellRequirements) {
                const holdingResult = await ensureHoldingForSell(
                    tx,
                    botId,
                    market.id,
                    outcome,
                    requiredShares,
                );

                result.holdingsCreated += holdingResult.created;
                result.holdingsUpdated += holdingResult.updated;
            }

            await lockWalletForBuyOrders(
                tx,
                botId,
                getBuyLockAmount(levelsToCreate),
            );
            await lockHoldingsForSellOrders(
                tx,
                botId,
                market.id,
                sellRequirements,
            );

            for (const level of levelsToCreate) {
                await createSeedOrder(tx, botId, market.id, level);
                result.created += 1;
            }

            return result;
        },
        {
            maxWait: 10000,
            timeout: 30000,
        },
    );
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
    const activeSeedOrderKeys = await getActiveSeedOrderKeys(
        bot.id,
        activeMarkets.map((market) => market.id),
    );
    const missingBuyLockTotal = getMissingBuyLockTotal(
        activeMarkets,
        activeSeedOrderKeys,
    );

    const walletTargetBalance =
        DEMO_MIN_FREE_BALANCE + Math.ceil(missingBuyLockTotal);

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
