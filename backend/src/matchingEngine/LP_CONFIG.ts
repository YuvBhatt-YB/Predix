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
    tick:number,
    levels:number
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
    tick:0.02,
    levels:3
}

