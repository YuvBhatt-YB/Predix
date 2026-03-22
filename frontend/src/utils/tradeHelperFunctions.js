export const deriveVisualLevels = (sideObject = {},side) => {
        const levels = []
        

        for(const [price,quantity] of Object.entries(sideObject)){
            levels.push({
                price:Number(price),
                quantity:quantity
            })
        }
        if(side === "SELL"){
            levels.sort((a,b) => a.price - b.price)
        }else if (side === "BUY"){
            levels.sort((a,b) => b.price - a.price)
        }
        
        if(levels.length === 0){
            return []
        }

        if(!levels || levels.length === 0) return
        const maxQuantity =Math.max(...levels.map(level => level.quantity))
        
        levels.forEach((level) => {
            level.width = maxQuantity === 0 ? 0 : (level.quantity / maxQuantity) * 100
        })
        
        return levels
        
    
}