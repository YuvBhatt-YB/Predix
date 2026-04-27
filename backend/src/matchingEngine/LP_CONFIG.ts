

interface Bot {
    id:string,
    password:string,
    email:string,
    balance:number
}
interface LP_CONFIG {
    targetInventory:number,
    maxInventory:number,
    maxShift:number,
    baseOrderSize:number,
    maxOrderSize:number,
    tick:number,
    levels:number,
    minAnchorChange:number,
    minSkewChange:number,
    minTimeGap:number
}

export const BOT:Bot = {
    id:"LP_BOT",
    password:"NO_LOGIN",
    email:"bot@email.com",
    balance:10000000 
}

export const LP_CONFIG:LP_CONFIG = {
    targetInventory:0,
    maxInventory:20000,
    maxShift:0.05,
    baseOrderSize:5000,
    maxOrderSize:10000,
    tick:0.02,
    levels:3,
    minAnchorChange:0.01,
    minSkewChange:0.02,
    minTimeGap:500
}

