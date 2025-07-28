import { useState } from "react"
import { initFormValues } from "../utils/data"
import { formValidation } from "../utils/validations"


export default function useForm(){
    
    const [formValues,setFormValues] = useState(initFormValues)
    const [formErrors,setFormErrors] = useState({})

    const handleChange = (e) => {
        const {name,value} = e.target
        setFormValues({...formValues,[name]:value})
    }

    const handleSubmit = (e) => {
        let currDateAndTime = new Date().toISOString().slice(0,16)
        e.preventDefault()
        const errors = formValidation(formValues,currDateAndTime)
        setFormErrors(errors)
        if(Object.keys(errors).length > 0){
            return;
        }
        const updatedValues = {...formValues,["createdAt"]:currDateAndTime}
        setFormValues(updatedValues)
        console.log(`Form Submitted Successfully Data : ${JSON.stringify(formValues)}`)
        setFormValues(initFormValues)
    }
    
    

    return {
        formValues,
        handleChange,
        formErrors,
        handleSubmit
    }
}