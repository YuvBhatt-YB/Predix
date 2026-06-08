import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { UserFromSession } from "../types/UserFromSession";

const unauthorized = (res: Response) => {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
};

const forbidden = (res: Response) => {
    return res.status(403).json({ ok: false, message: "Forbidden" });
};

const getAuthenticatedUser = (req: Request): UserFromSession | null => {
    if (
        typeof req.isAuthenticated === "function" &&
        req.isAuthenticated() &&
        req.user
    ) {
        return req.user as UserFromSession;
    }

    return null;
};

const getStringValues = (value: unknown): string[] => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
    }

    return [];
};

const getFirstStringValue = (...values: unknown[]) => {
    for (const value of values) {
        const [stringValue] = getStringValues(value);
        if (stringValue) return stringValue;
    }

    return null;
};

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const user = getAuthenticatedUser(req);

    if (!user) {
        return unauthorized(res);
    }

    return next();
};

export const requireSameUser = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const user = getAuthenticatedUser(req);

    if (!user) {
        return unauthorized(res);
    }

    const requestedUserIds = [
        ...getStringValues(req.params.userId),
        ...getStringValues(req.body?.userId),
        ...getStringValues(req.query.userId),
    ];

    if (requestedUserIds.some((userId) => userId !== user.id)) {
        return forbidden(res);
    }

    return next();
};

export const requireWalletOwner = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = getAuthenticatedUser(req);

        if (!user) {
            return unauthorized(res);
        }

        const walletId = getFirstStringValue(
            req.params.walletId,
            req.body?.walletId,
            req.query.walletId,
        );

        if (!walletId) {
            return next();
        }

        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId },
            select: { userID: true },
        });

        if (wallet && wallet.userID !== user.id) {
            return forbidden(res);
        }

        return next();
    } catch (error) {
        return next(error);
    }
};

export const requireOrderOwner = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = getAuthenticatedUser(req);

        if (!user) {
            return unauthorized(res);
        }

        const orderId = getFirstStringValue(req.params.orderId);

        if (!orderId) {
            return next();
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { userId: true },
        });

        if (order && order.userId !== user.id) {
            return forbidden(res);
        }

        return next();
    } catch (error) {
        return next(error);
    }
};
