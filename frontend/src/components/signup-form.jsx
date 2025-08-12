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
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import api from "../api/auth"
import AlertBox from "./Alerts/AlertBox"
import { useDispatch } from "react-redux"
import { getUserData } from "@/state/user/user"

export function SignupForm({
  className,
  ...props
}) {
  const schema = z.object({
    username: z.string().min(3,"Username must be atleast 3 characters"),
    email: z.email("Email ID is not valid"),
    password: z.string().min(8,"Password must be at least 8 characters long").regex(/[A-Z]/,"Password must include at least one uppercase letter").regex(/[0-9]/,"Password must include at least one number ")
  })
  const {register,handleSubmit,setError,formState:{errors,isSubmitting}} = useForm({resolver:zodResolver(schema)})
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try{
      const response = await api.post("/signup",data,{withCredentials:true})
      dispatch(getUserData())
      navigate("/home")
    }catch(error){
      if(error.response){
        setError("root",{
          message:error.response.data.message
        })
      }else if (error.request){
        setError("root",{
          message:"Server Error"
        })
      }else{
        setError("root",{
          error:error.message
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
              Already have an account?{" "}
              <Link to="/login" className="underline underline-offset-4">
                Log In
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
                  Sign Up with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="username" className="font-bold text-sm">
                    Username
                  </Label>
                  <Input
                    {...register("username")}
                    id="username"
                    type="text"
                    placeholder="@yuv"
                    
                  />
                  {errors.username && <AlertBox variant="destructive" message={errors.username.message} />}
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="email" className="font-bold text-sm">
                    Email
                  </Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="y@example.com"
                    
                  />
                  {errors.email && <AlertBox variant="destructive" message={errors.email.message} />}
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="font-bold text-sm">
                      Password
                    </Label>
                  </div>
                  <Input {...register("password")} id="password" type="password"  />
                  {errors.password && <AlertBox variant="destructive" message={errors.password.message} />}
                </div>
                {errors.root && <AlertBox variant="destructive" message={errors.root.message} />}
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-primaryBlue font-bold text-white hover:bg-secondaryBlue  mt-2"
                >
                  {isSubmitting ? "Signing Up" : "Sign Up"}
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
