export const asyncHandlerfn = (fn)=>{
    return (...args)=>{
        return Promise.resolve(fn(...args)).catch((error)=>{
            throw error;
            
        })
        
    }
}