import { useState } from "react"
import { loginValidation } from "../utils/validations"

export default function useLogin(){ 
    const [loginDetails,setLoginDetails] = useState({
        email:"",
        password:""
    })
    const [loginErrors,setLoginErrors] = useState({})

    const handleChange =(e) => {
        const {name,value} = e.target
        setLoginDetails({...loginDetails,[name]:value})
    }
    const handleSubmit =(e) => {
        e.preventDefault()
        const errors = loginValidation(loginDetails)
        setLoginErrors(errors)
        if(Object.keys(errors).length > 0){
            return;
        }
        console.log(JSON.stringify(loginDetails))
        setLoginDetails({
        email:"",
        password:""
        })
    }
    

    return {
        loginDetails,
        loginErrors,
        handleChange,
        handleSubmit
    }
}