import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient,Prisma } from "@prisma/client";
import { verifyHashPassword } from "../services/verifyHashPassword";

const prisma = new PrismaClient()

passport.use(
  new LocalStrategy({usernameField: "email", passwordField: "password"},async (email, password, done) => {
    try {
        console.log(`${email} ${password}`)
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const verifiedPassword = await verifyHashPassword(
        password,
        user.password
      );
      if (!verifiedPassword) {
        return done(null, false, { message: "Password doesn't match" });
      }

      done(null,{
        id: user.id,
        email: user.email,
        username:user.username,
        profileImg:user.profileImg
      })
    } catch (error) {
      if (error instanceof Error) {
        return done(error);
      }
      return done(error);
    }
  })
);

passport.serializeUser((user: any,done)=>{
    console.log("Serialized user")
    console.log(user)
    done(null,user.id)
})

passport.deserializeUser(async(id: string,done)=>{
    console.log("Deserialized user")
    try{
        const user = await prisma.user.findUnique({
        where: { id: id },
        });
        if(!user) throw new Error("User not Found")
        done(null,{
        id: user.id,
        email: user.email,
        username:user.username,
        profileImg:user.profileImg
      })
    }catch(error){
        done(error,null)
    }

})