class API_error extends Error {
    constructor(statusCode,message="Something went wrong",error= [],stack ="")
    {
        super(message)
        this.statusCode=statusCode;
        this.data=null
        this.message=message
        this.success=false
        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}
export {API_error};