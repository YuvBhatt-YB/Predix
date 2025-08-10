import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc";
import api from "../api/auth"
import { useForm } from "react-hook-form"
import z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import AlertBox from "./Alerts/AlertBox"
const schema = z.object({
  email:z.email(),
  password:z.string().min(8,"Password must be at least 8 characters long").regex(/[A-Z]/,"Password must contain at least one uppercase letter").regex(/[0-9]/,"Password must contain at least one number")
})
export function LoginForm({
  className,
  ...props
}) {
  const {register,handleSubmit,setError,formState: {errors,isSubmitting}} = useForm({resolver: zodResolver(schema)})
  const navigate = useNavigate()
  const onSubmit = async (data) => {
    try{
      const response = await api.post("/login",data)
        navigate("/home")
    }catch(error){
      if(error.response){
        setError("root",{
          message:error.response.data.message
        })
      }else if (error.request){
        setError("root",{
          message:'No response from Server'
        })
      }else{
        setError("root",{
          message:error.message
        })
      }
    }
    
  }
  return (
    <div className={cn("flex flex-col gap-6 ", className)} {...props}>
      <Card className="bg-white border-borderPrimary ">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-main">
            Welcome to <span className=" text-primaryBlue">Predix</span>
          </CardTitle>
          <CardDescription className="font-secondary text-primary ">
            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className=" font-secondary text-primary">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <FcGoogle />
                  Login with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email" className="font-bold text-sm">
                    Email
                  </Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    name="email"
                    placeholder="y@example.com"
                    
                  />
                  {errors.email && <AlertBox message={errors.email.message} variant={"destructive"}  />}
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="font-bold text-sm">
                      Password
                    </Label>
                  </div>
                  <Input {...register("password")} id="password" name="password" type="password" />
                  {errors.password && <AlertBox message={errors.password.message} variant={"destructive"}  />}
                </div>
                {errors.root && <AlertBox message={errors.root.message} variant={"destructive"}/>}
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-primaryBlue font-bold text-white hover:bg-secondaryBlue "

                >
                  {isSubmitting ? "Logging In" : "Log In"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="font-secondary text-primaryGray *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
