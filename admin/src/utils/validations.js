export const loginValidation = (values) => {
        let error = {}
        if(!values.email){
            error.email = "Please enter your Email"
        }else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)){
            error.email = "Please enter a valid Email e.g your-name@gmail.com"
        }
        if(!values.password){
            error.password = "Please enter your Password"
        }else if (values.password.length < 8){
            error.password = "Password must at least contain 8 characters"
        }else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(values.password)){
            error.password = "Password must have 8+ characters, including uppercase, lowercase, number, and special character"
        }

        return error
    }

export const formValidation = (values,currDateAndTime) => {
        let error = {}
        if(!values.title){
            error.title = "Title is Required"
        }else if (values.title.length < 5){
            error.title = "Title should not be less than 5 Characters"
        }
        if(!values.image){
            error.image = "Add Valid Image Link"
        }else if (values.image && !values.image.startsWith("http")){
            error.image = "Image URL must start with http or https"
        }
        if(!values.description){
            error.description = "Description should not be Empty"
        }
        if(!values.endTime){
            error.endTime = "Please add when will your market end"
        }else if (new Date(values.endTime) < new Date(currDateAndTime)){
            error.endTime = "End Time must be in future"
        }
        if(!values.category){
            error.category = "Please Add which Category is your Market"
        }

        return error
    }